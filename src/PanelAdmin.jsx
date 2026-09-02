import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { ArrowLeft, Download, Zap, ChevronDown, Settings, Megaphone, Lightbulb, UserPlus, Contact, ShieldCheck, Ban } from "lucide-react";
import { C, CATEGORIAS_TURNO } from "./App.jsx";

export default function PanelAdmin({ sesion, perfil, onVolver }) {
  const [tab, setTab] = useState("usuarios");
  const [usuarios, setUsuarios] = useState([]);
  const [reportes, setReportes] = useState([]);
  const [solicitudesBaneo, setSolicitudesBaneo] = useState([]);
  const [baneadosIds, setBaneadosIds] = useState(new Set());
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState(null);
  const [baneandoId, setBaneandoId] = useState(null);
  const [textoAnuncio, setTextoAnuncio] = useState("");
  const [enviandoAnuncio, setEnviandoAnuncio] = useState(false);
  const [mensajeAnuncio, setMensajeAnuncio] = useState(null);
  const [categoriasCambiosSel, setCategoriasCambiosSel] = useState(["sector", "maquinista"]);
  const [guardandoAjustes, setGuardandoAjustes] = useState(false);
  const [mensajeAjustes, setMensajeAjustes] = useState(null);

  useEffect(() => {
    supabase
      .from("ajustes_club")
      .select("categorias_cambios_visibles")
      .eq("id", true)
      .single()
      .then(({ data }) => {
        if (data?.categorias_cambios_visibles) setCategoriasCambiosSel(data.categorias_cambios_visibles);
      });
  }, []);

  function alternarCategoriaCambios(id) {
    setCategoriasCambiosSel((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  async function guardarCategoriasCambios() {
    setGuardandoAjustes(true);
    setMensajeAjustes(null);
    const { error } = await supabase
      .from("ajustes_club")
      .update({ categorias_cambios_visibles: categoriasCambiosSel, actualizado_en: new Date().toISOString() })
      .eq("id", true);
    setGuardandoAjustes(false);
    if (error) setMensajeAjustes({ tipo: "error", texto: error.message });
    else setMensajeAjustes({ tipo: "ok", texto: "Guardado." });
  }

  const [motivoBaneo, setMotivoBaneo] = useState("");

  const esDev = perfil?.rol === "dev";
  const esAdmin = perfil?.rol === "admin"; const [generandoBackup, setGenerandoBackup] = useState(false); async function generarBackup() { setGenerandoBackup(true); const tablas = ["perfiles","documentos","hilos","respuestas","mensajes_privados","notificaciones","reacciones","registros_calendario","reportes","solicitudes_baneo","sugerencias","baneos","bloqueos","seguidores","avatares","biblioteca","ajustes_club"]; const backup = {}; for (const t of tablas) { const { data } = await supabase.from(t).select("*"); backup[t] = data || []; } const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `backup_underground_${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(url); setGenerandoBackup(false); }

  useEffect(() => {
    cargarTodo();
  }, []);

  const [sugerencias, setSugerencias] = useState([]);
  const [respondiendoId, setRespondiendoId] = useState(null);
  const [textoRespuesta, setTextoRespuesta] = useState("");

  useEffect(() => {
    cargarSugerencias();
  }, []);

  function cargarSugerencias() {
    supabase
      .from("sugerencias")
      .select("*, perfiles(nombre, apellido, dne)")
      .order("creado_en", { ascending: false })
      .then(({ data }) => setSugerencias(data || []));
  }

  async function enviarRespuestaSugerencia(id) {
    if (!textoRespuesta.trim()) return;
    const { error } = await supabase
      .from("sugerencias")
      .update({
        respuesta: textoRespuesta.trim(),
        respondido_por_id: sesion.user.id,
        respondido_en: new Date().toISOString(),
        resuelto: true,
      })
      .eq("id", id);
    if (!error) {
      setRespondiendoId(null);
      setTextoRespuesta("");
      cargarSugerencias();
    } else {
      setMensaje({ tipo: "error", texto: error.message });
    }
  }

  async function cargarTodo() {
    setCargando(true);
    const [{ data: perfilesData }, { data: reportesData }, { data: solicitudesData }, { data: baneosData }] = await Promise.all([
      supabase.from("perfiles").select("*").order("creado_en", { ascending: true }),
      supabase.from("reportes").select("*, hilos(titulo)").eq("resuelto", false).order("creado_en", { ascending: false }),
      supabase.from("solicitudes_baneo").select("*").eq("resuelto", false).order("creado_en", { ascending: false }),
      supabase.from("baneos").select("usuario_id").eq("activo", true),
    ]);
    setUsuarios(perfilesData || []);
    setReportes(reportesData || []);
    setSolicitudesBaneo(solicitudesData || []);
    setBaneadosIds(new Set((baneosData || []).map((b) => b.usuario_id)));
    setCargando(false);
  }

  async function cambiarRol(usuarioId, nuevoRol) {
    const { error } = await supabase.from("perfiles").update({ rol: nuevoRol }).eq("id", usuarioId);
    if (!error) cargarTodo();
    else setMensaje({ tipo: "error", texto: error.message });
  }

  async function cambiarModoDios(usuarioId, nuevoValor) {
    const { error } = await supabase.from("perfiles").update({ modo_dios: nuevoValor }).eq("id", usuarioId);
    if (!error) cargarTodo();
    else setMensaje({ tipo: "error", texto: error.message });
  }

  async function cambiarVip(usuarioId, nuevoVip) {
    const { error } = await supabase.rpc("set_vip", { usuario_id: usuarioId, nuevo_vip: nuevoVip });
    if (!error) cargarTodo();
    else setMensaje({ tipo: "error", texto: error.message });
  }

  async function confirmarBaneo() {
    if (!motivoBaneo.trim()) return;
    const { error } = await supabase.from("baneos").insert({
      usuario_id: baneandoId,
      motivo: motivoBaneo.trim(),
      baneado_por_id: sesion.user.id,
      activo: true,
    });
    if (!error) {
      setBaneandoId(null);
      setMotivoBaneo("");
      cargarTodo();
    } else {
      setMensaje({ tipo: "error", texto: error.message });
    }
  }

  async function desbanear(usuarioId) {
    const { error } = await supabase
      .from("baneos")
      .update({ activo: false })
      .eq("usuario_id", usuarioId)
      .eq("activo", true);
    if (!error) cargarTodo();
  }

  async function resolverReporte(id) {
    const { error } = await supabase.from("reportes").update({ resuelto: true }).eq("id", id);
    if (!error) cargarTodo();
  }

  async function resolverSolicitudBaneo(id) {
    const { error } = await supabase.from("solicitudes_baneo").update({ resuelto: true }).eq("id", id);
    if (!error) cargarTodo();
  }

  async function enviarAnuncio() {
    if (!textoAnuncio.trim()) return;
    setEnviandoAnuncio(true);
    setMensajeAnuncio(null);
    const { error } = await supabase.rpc("anunciar_a_todos", { mensaje: textoAnuncio.trim() });
    setEnviandoAnuncio(false);
    if (error) {
      setMensajeAnuncio({ tipo: "error", texto: error.message });
      return;
    }
    setTextoAnuncio("");
    setMensajeAnuncio({ tipo: "ok", texto: "Anuncio enviado a todos los socios." });
  }

  async function aprobarAlta(usuarioId) {
    const { error } = await supabase.from("perfiles").update({ aprobado: true }).eq("id", usuarioId);
    if (!error) cargarTodo();
    else setMensaje({ tipo: "error", texto: error.message });
  }

  const pendientesAlta = usuarios.filter((u) => !u.aprobado);

  const TABS = [
    { id: "ajustes", nombre: "Ajustes", icon: Settings, badge: 0 },
    { id: "anuncios", nombre: "Anuncios", icon: Megaphone, badge: 0 },
    { id: "sugerencias", nombre: "Sugerencias", icon: Lightbulb, badge: sugerencias.filter((s) => !s.resuelto).length },
    { id: "altas", nombre: "Altas pendientes", icon: UserPlus, badge: pendientesAlta.length },
    { id: "usuarios", nombre: "Usuarios", icon: Contact, badge: 0 },
    { id: "reportes", nombre: "Reportes", icon: ShieldCheck, badge: reportes.length },
    { id: "baneos", nombre: "Peticiones de baneo", icon: Ban, badge: solicitudesBaneo.length }, ...(esDev ? [{ id: "backup", nombre: "Backup", icon: Download, badge: 0 }] : []),
  ];

  return (
    <div style={{ background: C.bg }} className="min-h-screen">
      <div style={{ background: C.blueDarker }} className="px-4 py-3 flex items-center gap-3">
        <button onClick={onVolver} className="text-white text-xs font-semibold flex items-center gap-1">
          <ArrowLeft size={17} /> Volver
        </button>
        <p className="text-white font-bold text-sm">Panel de administraciÃ³n</p>
      </div>

      <div className="max-w-4xl mx-auto p-4 flex flex-col sm:flex-row gap-4">
        <aside className="flex sm:flex-col gap-1 overflow-x-auto sm:w-48 sm:shrink-0">
          {TABS.map((tb) => {
            const Icono = tb.icon;
            const activo = tab === tb.id;
            return (
              <button
                key={tb.id}
                onClick={() => setTab(tb.id)}
                style={{ background: activo ? "#EAF2F9" : "transparent" }}
                className="shrink-0 text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5"
              >
                <Icono size={20} style={{ color: activo ? C.blue : C.mute }} />
                <span className="text-sm font-semibold whitespace-nowrap" style={{ color: activo ? C.blueDark : C.ink }}>
                  {tb.nombre}
                </span>
                {!!tb.badge && (
                  <span style={{ background: C.red }} className="text-xs text-white rounded-full px-1.5 py-0.5 font-bold leading-none ml-auto">
                    {tb.badge}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        <div className="flex-1 min-w-0 space-y-3">
          {mensaje && (
            <p className="text-xs rounded-lg p-2.5" style={{ background: "#FCEBEA", color: C.red }}>
              {mensaje.texto}
            </p>
          )}

          {cargando && (
            <p className="text-sm" style={{ color: C.mute }}>
              Cargando...
            </p>
          )}

          {!cargando && tab === "usuarios" && (
            <div className="space-y-2">
              {usuarios.map((u) => (
                <div
                  key={u.id}
                  style={{ background: C.white, borderColor: C.line }}
                  className="rounded-xl border p-3 flex flex-wrap items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: C.ink }}>
                      {u.nombre} {u.apellido}{" "}
                      {u.vip && (
                        <span className="text-xs font-bold" style={{ color: "#B8860B" }}>
                          â VIP
                        </span>
                      )}{" "}
                      {!u.aprobado && (
                <span className="text-xs font-bold" style={{ color: C.blueDark }}>
                  {" "}(pendiente de aprobaciÃ³n)
                </span>
              )}{" "}
              {baneadosIds.has(u.id) && (
                        <span className="text-xs font-bold" style={{ color: C.red }}>
                          (baneado)
                        </span>
                      )}
                    </p>
                    <p className="text-xs" style={{ color: C.mute }}>
                      DNE: {u.dne} Â· {u.cargo}
                    </p>
                  </div>
                  {esDev ? (
                    <div className="relative">
          <select
                      value={u.rol || "socio"}
                      onChange={(e) => cambiarRol(u.id, e.target.value)}
                      className="rounded-lg border pl-2 pr-6 py-1.5 text-xs outline-none appearance-none"
                      style={{ borderColor: C.line, color: C.ink }}
                    >
                      <option value="socio">Socio</option>
                      <option value="admin">Admin</option>
                      <option value="dev">Dev</option>
                    </select>
          <ChevronDown
            size={14}
            style={{ color: C.mute }}
            className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2"
          />
        </div>
                  ) : (
                    <span className="text-xs font-semibold" style={{ color: C.mute }}>
                      {u.rol || "socio"}
                    </span>
                  )}
                  {(esDev || esAdmin) && (
                    <button
                      onClick={() => cambiarVip(u.id, !u.vip)}
                      style={{
                        borderColor: u.vip ? "#B8860B" : C.line,
                        color: u.vip ? "#B8860B" : C.ink,
                      }}
                      className="text-xs font-semibold border rounded-lg px-2.5 py-1.5"
                    >
                      {u.vip ? "Quitar VIP" : "Nombrar VIP"}
                    </button>
                  )}
              {esDev && u.rol === "admin" && (
                <button
                  onClick={() => cambiarModoDios(u.id, !u.modo_dios)}
                  style={{
                    borderColor: u.modo_dios ? "#F59E0B" : C.line,
                    color: u.modo_dios ? "#B45309" : C.ink,
                    background: u.modo_dios ? "#FEF3C7" : C.white,
                  }}
                  className="text-xs font-semibold border rounded-lg px-2.5 py-1.5 flex items-center gap-1"
                >
                  <Zap size={12} />
                  {u.modo_dios ? "Quitar modo dios" : "Dar modo dios"}
                </button>
              )}
                  {baneadosIds.has(u.id) ? (
                    <button
                      onClick={() => desbanear(u.id)}
                      style={{ borderColor: C.line, color: C.ink }}
                      className="text-xs font-semibold border rounded-lg px-2.5 py-1.5"
                    >
                      Desbanear
                    </button>
                  ) : (
                    <button
                      onClick={() => setBaneandoId(u.id)}
                      style={{ borderColor: C.red, color: C.red }}
                      className="text-xs font-semibold border rounded-lg px-2.5 py-1.5"
                    >
                      Banear
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {!cargando && tab === "reportes" && (
            <div className="space-y-2">
              {reportes.length === 0 && (
                <p className="text-sm" style={{ color: C.mute }}>
                  No hay reportes pendientes.
                </p>
              )}
              {reportes.map((r) => (
                <div
                  key={r.id}
                  style={{ background: C.white, borderColor: C.line }}
                  className="rounded-xl border p-3 space-y-1.5"
                >
                  <p className="text-sm font-semibold" style={{ color: C.ink }}>
                    {r.hilos?.titulo || "Tema eliminado"}
                  </p>
                  <p className="text-xs" style={{ color: C.mute }}>
                    {r.motivo}
                  </p>
                  <button
                    onClick={() => resolverReporte(r.id)}
                    style={{ background: C.blue }}
                    className="text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                  >
                    Marcar resuelto
                </button>
                </div>
              ))}
            </div>
          )}

          {!cargando && tab === "altas" && (
              <div className="space-y-2">
                {pendientesAlta.length === 0 && (
                  <p className="text-sm" style={{ color: C.mute }}>
                    No hay altas pendientes de aprobaciÃ³n.
                  </p>
                )}
                {pendientesAlta.map((u) => (
                  <div
                    key={u.id}
                    style={{ background: C.white, borderColor: C.line }}
                    className="rounded-xl border p-3 flex flex-wrap items-center gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: C.ink }}>
                        {u.nombre} {u.apellido}
                      </p>
                      <p className="text-xs" style={{ color: C.mute }}>
                        DNE: {u.dne} Â· {u.cargo}
                      </p>
                      <p className="text-xs" style={{ color: C.mute }}>
                        Solicitado el {new Date(u.creado_en).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                    <button
                      onClick={() => aprobarAlta(u.id)}
                      style={{ background: "#22C55E" }}
                      className="text-white text-xs font-semibold rounded-lg px-3 py-1.5"
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={() => setBaneandoId(u.id)}
                      style={{ borderColor: C.red, color: C.red }}
                      className="text-xs font-semibold border rounded-lg px-2.5 py-1.5"
                    >
                      Rechazar
                    </button>
                  </div>
                ))}
              </div>
            )}

            {tab === "ajustes" && (
              <div style={{ background: C.white, borderColor: C.line }} className="rounded-xl border p-4 space-y-3">
                <p className="text-xs font-semibold" style={{ color: C.ink }}>
                  CategorÃ­as visibles en "Cambios"
                </p>
                <p className="text-xs" style={{ color: C.mute }}>
                  Elige quÃ© categorÃ­as aparecen al elegir categorÃ­a para ofertar un cambio. Las que
                  desmarques siguen existiendo, solo se ocultan de ese desplegable.
                </p>
                {mensajeAjustes && (
                  <p
                    className="text-xs rounded-lg p-2.5"
                    style={{
                      background: mensajeAjustes.tipo === "error" ? "#FCEBEA" : "#E7F7EE",
                      color: mensajeAjustes.tipo === "error" ? C.red : "#15803D",
                    }}
                  >
                    {mensajeAjustes.texto}
                  </p>
                )}
                <div className="space-y-1.5">
                  {CATEGORIAS_TURNO.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-2 text-sm" style={{ color: C.ink }}>
                      <input
                        type="checkbox"
                        checked={categoriasCambiosSel.includes(cat.id)}
                        onChange={() => alternarCategoriaCambios(cat.id)}
                        className="w-4 h-4"
                      />
                      {cat.nombre}
                    </label>
                  ))}
                </div>
                <button
                  onClick={guardarCategoriasCambios}
                  disabled={guardandoAjustes}
                  style={{ background: C.blue }}
                  className="w-full text-white font-semibold py-2.5 rounded-lg text-sm"
                >
                  {guardandoAjustes ? "Guardando..." : "Guardar"}
                </button>
              </div>
            )}

            {tab === "anuncios" && (
              <div style={{ background: C.white, borderColor: C.line }} className="rounded-xl border p-4 space-y-3">
                <p className="text-xs font-semibold" style={{ color: C.ink }}>
                  Enviar un aviso a todos los socios
                </p>
                <p className="text-xs" style={{ color: C.mute }}>
                  Les llegarÃ¡ como notificaciÃ³n del club (no como mensaje directo).
                </p>
                {mensajeAnuncio && (
                  <p
                    className="text-xs rounded-lg p-2.5"
                    style={{
                      background: mensajeAnuncio.tipo === "error" ? "#FCEBEA" : "#E7F7EE",
                      color: mensajeAnuncio.tipo === "error" ? C.red : "#15803D",
                    }}
                  >
                    {mensajeAnuncio.texto}
                  </p>
                )}
                <textarea
                  value={textoAnuncio}
                  onChange={(e) => setTextoAnuncio(e.target.value)}
                  rows={3}
                  placeholder="Ej: Se ha actualizado el convenio en la Biblioteca..."
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none resize-none"
                  style={{ borderColor: C.line, color: C.ink }}
                />
                <button
                  onClick={enviarAnuncio}
                  disabled={!textoAnuncio.trim() || enviandoAnuncio}
                  style={{ background: textoAnuncio.trim() ? C.blue : "#B9C6D2" }}
                  className="w-full text-white font-semibold py-2.5 rounded-lg text-sm"
                >
                  {enviandoAnuncio ? "Enviando..." : "Enviar a todos los socios"}
                </button>
              </div>
            )}

            {tab === "sugerencias" && (
              <div className="space-y-2">
                {sugerencias.length === 0 && (
                  <p className="text-sm" style={{ color: C.mute }}>
                    TodavÃ­a no hay mensajes en el buzÃ³n.
                  </p>
                )}
                {sugerencias.map((s) => (
                  <div
                    key={s.id}
                    style={{ background: C.white, borderColor: C.line }}
                    className="rounded-xl border p-3 space-y-2"
                  >
                    <p className="text-sm font-semibold" style={{ color: C.ink }}>
                      {s.perfiles?.nombre} {s.perfiles?.apellido}{" "}
                      <span className="font-normal" style={{ color: C.mute }}>
                        Â· DNEà{s.perfiles?.dne} Â· {new Date(s.creado_en).toLocaleString("es-ES")}
                      </span>
                    </p>
                    <p className="text-sm" style={{ color: C.ink }}>
                      {s.texto}
                    </p>
                    {s.respuesta ? (
                      <div style={{ background: "#EAF2F9" }} className="rounded-lg p-2.5">
                        <p className="text-xs font-semibold mb-1" style={{ color: C.blueDark }}>
                          Ya respondida
                        </p>
                        <p className="text-sm" style={{ color: C.ink }}>
                          {s.respuesta}
                        </p>
                      </div>
                    ) : respondiendoId === s.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={textoRespuesta}
                          onChange={(e) => setTextoRespuesta(e.target.value)}
                          rows={2}
                          placeholder="Escribe tu respuesta..."
                          className="w-full rounded-lg border px-3 py-2 text-sm outline-none resize-none"
                          style={{ borderColor: C.line, color: C.ink }}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setRespondiendoId(null);
                              setTextoRespuesta("");
                            }}
                            style={{ borderColor: C.line, color: C.ink }}
                            className="flex-1 border text-xs font-semibold py-1.5 rounded-lg"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => enviarRespuestaSugerencia(s.id)}
                            disabled={!textoRespuesta.trim()}
                            style={{ background: textoRespuesta.trim() ? C.blue : "#B9C6D2" }}
                            className="flex-1 text-white text-xs font-semibold py-1.5 rounded-lg"
                          >
                            Enviar respuesta
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setRespondiendoId(s.id);
                          setTextoRespuesta("");
                        }}
                        style={{ background: C.blue }}
                        className="text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                      >
                        Responder
                        </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {esDev && tab === "backup" && (<div className="space-y-3"><p className="text-sm" style={{ color: C.ink }}>Genera una copia de seguridad de todos los datos del club (perfiles, mensajes, documentos, temas, etc.) en un archivo descargable. GuÃ¡rdalo en un sitio seguro.</p><button onClick={generarBackup} disabled={generandoBackup} style={{ background: generandoBackup ? "#B9C6D2" : C.blue }} className="text-white font-semibold py-2.5 px-4 rounded-lg text-sm flex items-center gap-2"><Download size={18} />{generandoBackup ? "Generando..." : "Descargar copia de seguridad"}</button></div>)}{!cargando && tab === "baneos" && (
            <div className="space-y-2">
              {solicitudesBaneo.length === 0 && (
                <p className="text-sm" style={{ color: C.mute }}>
                  No hay peticiones pendientes.
                </p>
              )}
              {solicitudesBaneo.map((s) => (
                <div
                  key={s.id}
                  style={{ background: C.white, borderColor: C.line }}
                  className="rounded-xl border p-3 space-y-1.5"
                >
                  <p className="text-sm font-semibold" style={{ color: C.ink }}>
                    {s.tipo}: {s.objetivo}
                  </p>
                  <p className="text-xs" style={{ color: C.mute }}>
                    {s.motivo}
                  </p>
                  <button
                    onClick={() => resolverSolicitudBaneo(s.id)}
                    style={{ background: C.blue }}
                    className="text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                  >
                    Marcar resuelto
                </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {baneandoId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-30 p-4">
          <div style={{ background: C.white }} className="w-full max-w-sm rounded-2xl p-4 space-y-3">
            <p className="font-bold text-sm" style={{ color: C.ink }}>
              Motivo del baneo
            </p>
            <textarea
              value={motivoBaneo}
              onChange={(e) => setMotivoBaneo(e.target.value)}
              rows={3}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none resize-none"
              style={{ borderColor: C.line, color: C.ink }}
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setBaneandoId(null);
                  setMotivoBaneo("");
                }}
                style={{ borderColor: C.line, color: C.ink }}
                className="flex-1 border text-sm font-semibold py-2 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarBaneo}
                disabled={!motivoBaneo.trim()}
                style={{ background: motivoBaneo.trim() ? C.red : "#B9C6D2" }}
                className="flex-1 text-white text-sm font-semibold py-2 rounded-lg"
              >
                Banear
              </button>
            </div>
          </div>
        )}
    </div>
  );
}
