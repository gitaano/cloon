import React, { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";
import { ArrowLeft, Ban, Plus, Send } from "lucide-react";
import { C, nombrePublico } from "./App.jsx";

export default function VistaMensajes({ sesion, perfil, conversacionInicial, onVolver }) {
  const [conversaciones, setConversaciones] = useState([]);
  const [perfilesPorId, setPerfilesPorId] = useState({});
  const [conversacionActiva, setConversacionActiva] = useState(conversacionInicial || null);
  const [mensajesHilo, setMensajesHilo] = useState([]);
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [nuevoMensajeAbierto, setNuevoMensajeAbierto] = useState(false);
  const [todosSocios, setTodosSocios] = useState([]);
  const [bloqueados, setBloqueados] = useState(new Set());
  const conversacionActivaRef = useRef(conversacionInicial || null);

  useEffect(() => {
    conversacionActivaRef.current = conversacionActiva;
  }, [conversacionActiva]);

  useEffect(() => {
    const canal = supabase
      .channel(`mensajes-privados-hilo-${sesion.user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "mensajes_privados", filter: `destinatario_id=eq.${sesion.user.id}` },
        (payload) => {
          const nuevo = payload.new;
          if (conversacionActivaRef.current === nuevo.remitente_id) {
            setMensajesHilo((prev) => [...prev, nuevo]);
            supabase.from("mensajes_privados").update({ leido: true }).eq("id", nuevo.id).then(() => {});
          }
          cargarConversaciones();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(canal);
    };
  }, [sesion.user.id]);


  useEffect(() => {
    cargarConversaciones();
  }, []);

  useEffect(() => {
    cargarBloqueados();
  }, []);

  function cargarBloqueados() {
    supabase
      .from("bloqueos")
      .select("bloqueado_id")
      .eq("usuario_id", sesion.user.id)
      .then(({ data }) => setBloqueados(new Set((data || []).map((b) => b.bloqueado_id))));
  }

  async function alternarBloqueo(otroId) {
    if (bloqueados.has(otroId)) {
      await supabase.from("bloqueos").delete().eq("usuario_id", sesion.user.id).eq("bloqueado_id", otroId);
    } else {
      await supabase.from("bloqueos").insert({ usuario_id: sesion.user.id, bloqueado_id: otroId });
    }
    cargarBloqueados();
  }

  useEffect(() => {
    if (conversacionInicial) abrirConversacion(conversacionInicial);
  }, [conversacionInicial]);

  async function cargarConversaciones() {
    setCargando(true);
    const { data, error } = await supabase
      .from("mensajes_privados")
      .select("*")
      .or(`remitente_id.eq.${sesion.user.id},destinatario_id.eq.${sesion.user.id}`)
      .order("creado_en", { ascending: false });

    if (!error && data) {
      const idsOtros = new Set();
      data.forEach((m) => {
        const otro = m.remitente_id === sesion.user.id ? m.destinatario_id : m.remitente_id;
        idsOtros.add(otro);
      });

      if (idsOtros.size > 0) {
        const { data: perfilesData } = await supabase
          .from("perfiles")
          .select("id, nombre, apellido, nickname, mostrar_nombre_real, foto_url, vip")
          .in("id", Array.from(idsOtros));
        const mapaPerfiles = {};
        (perfilesData || []).forEach((p) => {
          mapaPerfiles[p.id] = p;
        });
        setPerfilesPorId((prev) => ({ ...prev, ...mapaPerfiles }));
      }

      const porOtro = {};
      data.forEach((m) => {
        const otro = m.remitente_id === sesion.user.id ? m.destinatario_id : m.remitente_id;
        if (!porOtro[otro]) porOtro[otro] = [];
        porOtro[otro].push(m);
      });
      const lista = Object.entries(porOtro).map(([otroId, msgs]) => {
        const noLeidos = msgs.filter((m) => m.destinatario_id === sesion.user.id && !m.leido).length;
        return { otroId, ultimo: msgs[0], noLeidos };
      });
      lista.sort((a, b) => new Date(b.ultimo.creado_en) - new Date(a.ultimo.creado_en));
      setConversaciones(lista);
    }
    setCargando(false);
  }

  async function abrirConversacion(otroId) {
    setConversacionActiva(otroId);
    setNuevoMensajeAbierto(false);

    if (!perfilesPorId[otroId]) {
      const { data: p } = await supabase
        .from("perfiles")
        .select("id, nombre, apellido, nickname, mostrar_nombre_real, foto_url, vip")
        .eq("id", otroId)
        .single();
      if (p) setPerfilesPorId((prev) => ({ ...prev, [otroId]: p }));
    }

    const { data } = await supabase
      .from("mensajes_privados")
      .select("*")
      .or(
        `and(remitente_id.eq.${sesion.user.id},destinatario_id.eq.${otroId}),and(remitente_id.eq.${otroId},destinatario_id.eq.${sesion.user.id})`
      )
      .order("creado_en", { ascending: true });
    setMensajesHilo(data || []);

    await supabase
      .from("mensajes_privados")
      .update({ leido: true })
      .eq("destinatario_id", sesion.user.id)
      .eq("remitente_id", otroId)
      .eq("leido", false);

    cargarConversaciones();
  }

  async function enviarMensaje() {
    if (!texto.trim() || !conversacionActiva || enviando) return;
    setEnviando(true);
    const contenido = texto.trim();
    setTexto("");
    const { error } = await supabase.from("mensajes_privados").insert({
      remitente_id: sesion.user.id,
      destinatario_id: conversacionActiva,
      contenido,
    });
    setEnviando(false);
    if (!error) {
      abrirConversacion(conversacionActiva);
    } else {
      setTexto(contenido);
    }
  }

  async function abrirNuevoMensaje() {
    setNuevoMensajeAbierto(true);
    setConversacionActiva(null);
    if (todosSocios.length === 0) {
      const { data } = await supabase
        .from("perfiles")
        .select("id, nombre, apellido, nickname, mostrar_nombre_real, foto_url, vip")
        .neq("id", sesion.user.id)
        .order("nombre");
      setTodosSocios(data || []);
    }
  }

  const conversacionActivaPerfil = conversacionActiva ? perfilesPorId[conversacionActiva] : null;

  return (
    <div style={{ background: C.bg }} className="min-h-screen flex flex-col">
      <div style={{ background: C.blueDarker }} className="px-4 py-3 flex items-center gap-3 shrink-0">
        {conversacionActiva || nuevoMensajeAbierto ? (
          <button
            onClick={() => {
              setConversacionActiva(null);
              setNuevoMensajeAbierto(false);
            }}
            className="text-white text-xs font-semibold flex items-center gap-1"
          >
            <ArrowLeft size={17} /> Mensajes
          </button>
        ) : (
          <button onClick={onVolver} className="text-white text-xs font-semibold flex items-center gap-1">
            <ArrowLeft size={17} /> Volver
          </button>
        )}
        <p className="text-white font-bold text-sm">
          {conversacionActivaPerfil
            ? nombrePublico(conversacionActivaPerfil)
            : nuevoMensajeAbierto
            ? "Nuevo mensaje"
            : "Mensajes"}
        </p>
        {!conversacionActiva && !nuevoMensajeAbierto && (
          <button onClick={abrirNuevoMensaje} className="ml-auto text-white" aria-label="Nuevo mensaje">
            <Plus size={24} />
          </button>
        )}
        {conversacionActiva && (
          <button
            onClick={() => alternarBloqueo(conversacionActiva)}
            className="ml-auto text-white text-xs font-semibold border rounded-full px-2.5 py-1 flex items-center gap-1"
            style={{ borderColor: "rgba(255,255,255,0.35)" }}
          >
            <Ban size={14} />
            {bloqueados.has(conversacionActiva) ? "Desbloquear" : "Bloquear"}
          </button>
        )}
      </div>

      {!conversacionActiva && !nuevoMensajeAbierto && (
        <div className="flex-1 overflow-y-auto max-w-2xl mx-auto w-full p-4 space-y-2">
          {cargando && (
            <p className="text-sm" style={{ color: C.mute }}>
              Cargando...
            </p>
          )}
          {!cargando && conversaciones.length === 0 && (
            <p className="text-sm text-center py-8" style={{ color: C.mute }}>
              Todavía no tienes ningún mensaje. Pincha en + para escribir a un socio.
            </p>
          )}
          {conversaciones
            .filter((c) => !bloqueados.has(c.otroId))
            .map((c) => {
            const p = perfilesPorId[c.otroId];
            return (
              <button
                key={c.otroId}
                onClick={() => abrirConversacion(c.otroId)}
                style={{ background: C.white, borderColor: C.line }}
                className="w-full text-left rounded-xl border p-3 flex items-center gap-3"
              >
                <div
                  style={{ background: C.blue }}
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                >
                  {(nombrePublico(p) || "?").slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate" style={{ color: C.ink }}>
                    {nombrePublico(p)}
                    {p?.vip && (
                      <span className="font-bold" style={{ color: "#B8860B" }}>
                        {" "}★
                      </span>
                    )}
                  </p>
                  <p className="text-xs truncate" style={{ color: C.mute }}>
                    {c.ultimo.remitente_id === sesion.user.id ? "Tú: " : ""}
                    {c.ultimo.contenido}
                  </p>
                </div>
                {c.noLeidos > 0 && (
                  <span
                    style={{ background: C.red }}
                    className="text-xs text-white rounded-full w-5 h-5 flex items-center justify-center font-bold shrink-0"
                  >
                    {c.noLeidos}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {nuevoMensajeAbierto && (
        <div className="flex-1 overflow-y-auto max-w-2xl mx-auto w-full p-4 space-y-2">
          <p className="text-xs font-semibold mb-1" style={{ color: C.mute }}>
            Elige un socio
          </p>
          {todosSocios.map((s) => (
            <button
              key={s.id}
              onClick={() => abrirConversacion(s.id)}
              style={{ background: C.white, borderColor: C.line }}
              className="w-full text-left rounded-xl border p-3 flex items-center gap-3"
            >
              <div
                style={{ background: C.blue }}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
              >
                {(nombrePublico(s) || "?").slice(0, 1).toUpperCase()}
              </div>
              <p className="text-sm font-semibold" style={{ color: C.ink }}>
                {nombrePublico(s)}
                {s.vip && (
                  <span className="font-bold" style={{ color: "#B8860B" }}>
                    {" "}★
                  </span>
                )}
              </p>
            </button>
          ))}
        </div>
      )}

      {conversacionActiva && (
        <>
          <div className="flex-1 overflow-y-auto max-w-2xl mx-auto w-full p-4 space-y-2">
            {mensajesHilo.map((m) => {
              const esMio = m.remitente_id === sesion.user.id;
              return (
                <div key={m.id} className={"flex " + (esMio ? "justify-end" : "justify-start")}>
                  <div
                    style={{ background: esMio ? C.blue : C.white, borderColor: C.line }}
                    className={"max-w-[75%] rounded-2xl border px-3 py-2 " + (esMio ? "rounded-br-sm" : "rounded-bl-sm")}
                  >
                    <p className="text-sm" style={{ color: esMio ? C.white : C.ink }}>
                      {m.contenido}
                    </p>
                    <p
                      className="text-[10px] mt-0.5 text-right"
                      style={{ color: esMio ? "rgba(255,255,255,0.7)" : C.mute }}
                    >
                      {new Date(m.creado_en).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
            {mensajesHilo.length === 0 && (
              <p className="text-sm text-center py-8" style={{ color: C.mute }}>
                Escribe el primer mensaje.
              </p>
            )}
          </div>

{bloqueados.has(conversacionActiva) ? (
            <div style={{ background: C.white, borderColor: C.line }} className="border-t p-3 shrink-0 text-center">
              <p className="text-xs" style={{ color: C.mute }}>
                Has bloqueado a este socio. Desbloquéalo para poder escribirle.
              </p>
            </div>
          ) : (
          <div style={{ background: C.white, borderColor: C.line }} className="border-t p-3 shrink-0">
            <div className="max-w-2xl mx-auto flex items-center gap-2">
              <input
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") enviarMensaje();
                }}
                placeholder="Escribe un mensaje..."
                className="flex-1 rounded-full border px-4 py-2.5 text-sm outline-none"
                style={{ borderColor: C.line, color: C.ink }}
              />
              <button
                onClick={enviarMensaje}
                disabled={!texto.trim() || enviando}
                style={{ background: texto.trim() ? C.blue : "#B9C6D2" }}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
                aria-label="Enviar mensaje"
              >
                <Send size={19} />
              </button>
            </div>
          </div>
          )}
        </>
      )}
    </div>
  );
}

