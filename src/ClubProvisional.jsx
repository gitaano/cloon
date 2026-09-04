{esServicio && turnoOfrecido && (
            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: C.ink }}>
                Línea(s) de preferencia (opcional)
              </label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {Object.entries(LINEAS_METRO_ESTACIONES).map(([id, l]) => (
                  <label
                    key={id}
                    className="flex items-center gap-2 text-sm rounded-lg border px-3 py-2"
                    style={{ borderColor: C.line, color: C.ink }}
                  >
                    <input
                      type="checkbox"
                      checked={lineasPreferidas.includes(id)}
                      onChange={() => alternarLineaPreferida(id)}
                    />
                    {l.nombre}
                  </label>
                ))}
              </div>
            </div>
          )}

          {esServicio && turnoOfrecido && (import React, { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";
import { C, AMBITOS, CATEGORIAS_TURNO, TURNOS, LINEAS_METRO_ESTACIONES, nombrePublico, LogoMetroColor, LogoUnderground, MarcaAguaFondo } from "./App.jsx";
import MiPerfil from "./MiPerfil.jsx";
import PanelAdmin from "./PanelAdmin.jsx";
import VistaCalendario from "./VistaCalendario.jsx";
import VistaMensajes from "./VistaMensajes.jsx";
import VistaBiblioteca from "./VistaBiblioteca.jsx";
import VistaSugerencias from "./VistaSugerencias.jsx";
import VistaNotificaciones from "./VistaNotificaciones.jsx";
import {
  Angry, Bell, Calendar, ChevronDown, ChevronLeft, ChevronRight, Contact, Eye,
  FileText, Info, Lightbulb, LogOut, Mail, Megaphone, Meh, MessageSquare,
  Repeat, Search, Settings, Star, ThumbsUp, UserPlus, Users, X, Zap,
} from "lucide-react";

export default function ClubProvisional({ sesion }) {
  const [perfil, setPerfil] = useState(null);
  const [hilos, setHilos] = useState([]);
  const [cargandoHilos, setCargandoHilos] = useState(true);
  const [formAbierto, setFormAbierto] = useState(false);
  const [vista, setVista] = useState("foro");
  const [ambitoActivo, setAmbitoActivo] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [cambiosCategoria, setCambiosCategoria] = useState("");
  const [cambiosTipo, setCambiosTipo] = useState("");
  const [modalCambioAbierto, setModalCambioAbierto] = useState(false);
  const [mensajesNoLeidos, setMensajesNoLeidos] = useState(0);
  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState(0);
  const [numUsuariosRegistrados, setNumUsuariosRegistrados] = useState(null);
  const [usuariosOnline, setUsuariosOnline] = useState(1);
  const [mensajeIniciarCon, setMensajeIniciarCon] = useState(null);
  const [ahora, setAhora] = useState(Date.now());
  const [verSocioId, setVerSocioId] = useState(null);
    const [usuariosOnlineIds, setUsuariosOnlineIds] = useState([]);
  const [modalListaUsuarios, setModalListaUsuarios] = useState(null);
  const [listaUsuariosModal, setListaUsuariosModal] = useState([]);
  const [cargandoListaUsuarios, setCargandoListaUsuarios] = useState(false);

  useEffect(() => {
    cargarPerfil();
    cargarHilos();
    cargarMensajesNoLeidos();
    cargarNotificacionesNoLeidas();
    supabase
      .from("perfiles")
      .select("id", { count: "exact", head: true })
      .eq("aprobado", true)
      .then(({ count }) => setNumUsuariosRegistrados(count || 0));
  }, [sesion]);

  function cargarMensajesNoLeidos() {
    supabase
      .from("mensajes_privados")
      .select("id", { count: "exact", head: true })
      .eq("destinatario_id", sesion.user.id)
      .eq("leido", false)
      .then(({ count }) => setMensajesNoLeidos(count || 0));
  }

  function cargarNotificacionesNoLeidas() {
    supabase
      .from("notificaciones")
      .select("id", { count: "exact", head: true })
      .eq("usuario_id", sesion.user.id)
      .eq("leida", false)
      .then(({ count }) => setNotificacionesNoLeidas(count || 0));
  }

useEffect(() => {
    const canal = supabase
      .channel(`mensajes-privados-recibidos-${sesion.user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "mensajes_privados", filter: `destinatario_id=eq.${sesion.user.id}` },
        () => {
          cargarMensajesNoLeidos();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(canal);
    };
  }, [sesion.user.id]);

  useEffect(() => {
    const canalNotif = supabase
      .channel(`notificaciones-${sesion.user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notificaciones", filter: `usuario_id=eq.${sesion.user.id}` },
        () => {
          cargarNotificacionesNoLeidas();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(canalNotif);
    };
  }, [sesion.user.id]);

  useEffect(() => {
    const canalPresencia = supabase.channel("presencia-online", {
      config: { presence: { key: sesion.user.id } },
    });
    canalPresencia
      .on("presence", { event: "sync" }, () => {
        const estado = canalPresencia.presenceState();
        const idsOnline = Object.keys(estado);
        setUsuariosOnline(idsOnline.length || 1);
        setUsuariosOnlineIds(idsOnline);
      })
      .subscribe(async (estadoSuscripcion) => {
        if (estadoSuscripcion === "SUBSCRIBED") {
          await canalPresencia.track({ online_at: new Date().toISOString() });
        }
      });
    return () => {
      supabase.removeChannel(canalPresencia);
    };
  }, [sesion.user.id]);

  useEffect(() => {
    const iv = setInterval(() => setAhora(Date.now()), 15000);
    return () => clearInterval(iv);
  }, []);

  async function alternarModoDiosPropio() {
    const { error } = await supabase
      .from("perfiles")
      .update({ modo_dios: !perfil.modo_dios })
      .eq("id", sesion.user.id);
    if (!error) cargarPerfil();
    setMenuAbierto(false);
  }

  function cargarPerfil() {
    supabase
      .from("perfiles")
      .select("*")
      .eq("id", sesion.user.id)
      .single()
      .then(({ data }) => setPerfil(data));
  }

  async function cerrarBienvenida() {
    setPerfil((p) => (p ? { ...p, bienvenida_vista: true } : p));
    await supabase.from("perfiles").update({ bienvenida_vista: true }).eq("id", sesion.user.id);
  }
  
  function cargarHilos() {
    setCargandoHilos(true);
    supabase
      .from("hilos")
      .select("*, perfiles(nombre, apellido, nickname, mostrar_nombre_real, vip)")
      .order("creado_en", { ascending: false })
      .then(async ({ data, error }) => {
        if (error || !data) {
          setCargandoHilos(false);
          return;
        }
        const ids = data.map((h) => h.id);
        const { data: reacciones } = await supabase
          .from("reacciones")
          .select("hilo_id, usuario_id, tipo")
          .in("hilo_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
        const conReacciones = data.map((h) => {
          const deEsteHilo = (reacciones || []).filter((r) => r.hilo_id === h.id);
          const conteo = { meGusta: 0, meDaIgual: 0, meCabrea: 0 };
          let miVoto = null;
          deEsteHilo.forEach((r) => {
            conteo[r.tipo] = (conteo[r.tipo] || 0) + 1;
            if (r.usuario_id === sesion.user.id) miVoto = r.tipo;
          });
          return { ...h, reacciones: conteo, miVoto };
        });
        setHilos(conReacciones);
        setCargandoHilos(false);
      });
  }

    async function abrirListaUsuarios(tipo) {
    setModalListaUsuarios(tipo);
    setCargandoListaUsuarios(true);
    if (tipo === "registrados") {
      const { data } = await supabase
        .from("perfiles")
        .select("id, nombre, apellido, nickname, mostrar_nombre_real, cargo, foto_url, vip")
        .eq("aprobado", true)
        .order("nombre", { ascending: true });
      setListaUsuariosModal(data || []);
    } else {
      const ids = usuariosOnlineIds.length ? usuariosOnlineIds : ["00000000-0000-0000-0000-000000000000"];
      const { data } = await supabase
        .from("perfiles")
        .select("id, nombre, apellido, nickname, mostrar_nombre_real, cargo, foto_url, vip")
        .in("id", ids);
      setListaUsuariosModal(data || []);
    }
    setCargandoListaUsuarios(false);
  }

  async function alternarDestacado(id, valorActual) {
    const { error } = await supabase.from("hilos").update({ destacado: !valorActual }).eq("id", id);
    if (!error) cargarHilos();
  }

  async function votar(hiloId, tipoVoto) {
    const hilo = hilos.find((h) => h.id === hiloId);
    const yaVotado = hilo && hilo.miVoto === tipoVoto;
    if (yaVotado) {
      await supabase
        .from("reacciones")
        .delete()
        .eq("hilo_id", hiloId)
        .eq("usuario_id", sesion.user.id);
    } else {
      await supabase
        .from("reacciones")
        .upsert(
          { hilo_id: hiloId, usuario_id: sesion.user.id, tipo: tipoVoto },
          { onConflict: "hilo_id,usuario_id" }
        );
    }
    cargarHilos();
  }

  async function eliminarHiloPropio(id) {
    if (!confirm("¿Seguro que quieres eliminar este tema? No se puede deshacer.")) return;
    const { error } = await supabase.from("hilos").delete().eq("id", id);
    if (!error) cargarHilos();
  }

  async function crearCambio({ ambito, titulo, texto, categoria, tipo, etiquetaCambio }) {
    const { error } = await supabase.from("hilos").insert({
      ambito,
      titulo,
      texto,
      categoria,
      tipo,
      etiqueta_cambio: etiquetaCambio,
      autor_id: sesion.user.id,
    });
    if (!error) {
      setModalCambioAbierto(false);
      setAmbitoActivo("cambios");
      cargarHilos();
    }
  }

  if (vista === "perfil") {
    return (
      <MiPerfil
        sesion={sesion}
        perfil={perfil}
        onVolver={() => setVista("foro")}
        onActualizado={(p) => {
          setPerfil(p);
          cargarHilos();
        }}
      />
    );
  }

  if (vista === "admin") {
    return <PanelAdmin sesion={sesion} perfil={perfil} onVolver={() => setVista("foro")} />;
  }

  if (vista === "calendario") {
    return <VistaCalendario sesion={sesion} perfil={perfil} onVolver={() => setVista("foro")} />;
  }

  if (vista === "biblioteca") {
    return <VistaBiblioteca sesion={sesion} perfil={perfil} onVolver={() => setVista("foro")} />;
  }

  if (vista === "sugerencias") {
    return <VistaSugerencias sesion={sesion} perfil={perfil} onVolver={() => setVista("foro")} />;
  }

  if (vista === "notificaciones") {
    return (
      <VistaNotificaciones
        sesion={sesion}
        onVolver={() => {
          setVista("foro");
          cargarNotificacionesNoLeidas();
        }}
      />
    );
  }

  if (vista === "mensajes") {
    return (
      <VistaMensajes
        sesion={sesion}
        perfil={perfil}
        conversacionInicial={mensajeIniciarCon}
        onVolver={() => {
          setVista("foro");
          setMensajeIniciarCon(null);
          cargarMensajesNoLeidos();
        }}
      />
    );
  }

  if (perfil && perfil.aprobado === false && perfil.rol !== "admin" && perfil.rol !== "dev") {
    return <PendienteAprobacion onCerrarSesion={() => supabase.auth.signOut()} />;
  }

  const hilosFiltrados = hilos.filter((h) => {
    const coincideAmbito = ambitoActivo === "todos" || h.ambito === ambitoActivo;
    const q = busqueda.trim().toLowerCase();
    const coincideBusqueda =
      !q || h.titulo.toLowerCase().includes(q) || (h.texto || "").toLowerCase().includes(q);
    return coincideAmbito && coincideBusqueda;
  });

  return (
    <div style={{ background: "#F3F6F9", position: "relative", zIndex: 0 }} className="min-h-screen">
      <MarcaAguaFondo />
      <div style={{ background: C.blueDarker }} className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LogoMetroColor size={34} />
          <p className="text-white font-bold text-sm">Underground</p>
          {perfil && (
            <p className="text-xs" style={{ color: "#8FD9EE" }}>
              {nombrePublico(perfil)} · {perfil.cargo}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setVista("mensajes")}
            style={{ background: "rgba(255,255,255,0.12)" }}
            className="text-white rounded-full p-2 flex items-center relative"
            aria-label="Mensajes"
            title="Mensajes"
          >
            <Mail size={17} />
            {mensajesNoLeidos > 0 && (
              <span
                style={{ background: C.red, borderColor: C.blueDarker }}
                className="absolute -top-1 -right-1 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2"
              >
                {mensajesNoLeidos}
              </span>
            )}
          </button>

          <button
            onClick={() => setVista("notificaciones")}
            style={{ background: "rgba(255,255,255,0.12)" }}
            className="text-white rounded-full p-2 flex items-center relative"
            aria-label="Notificaciones"
            title="Notificaciones"
          >
            <Bell size={17} />
            {notificacionesNoLeidas > 0 && (
              <span
                style={{ background: C.red, borderColor: C.blueDarker }}
                className="absolute -top-1 -right-1 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2"
              >
                {notificacionesNoLeidas}
              </span>
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setMenuAbierto((v) => !v)}
              style={{ background: "rgba(255,255,255,0.12)" }}
              className="flex items-center gap-1 rounded-full pl-1 pr-2 py-1"
              aria-label="Menú de cuenta"
            >
              {perfil?.foto_url ? (
                <img src={perfil.foto_url} alt="Tu avatar" className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div
                  style={{ background: C.blue }}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                >
                  {(nombrePublico(perfil) || "?").slice(0, 1).toUpperCase()}
                </div>
              )}
              <ChevronDown
                size={14}
                style={{
                  color: C.white,
                  transform: menuAbierto ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.15s ease",
                }}
              />
            </button>

            {menuAbierto && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuAbierto(false)} />
                <div
                  style={{ background: C.white, borderColor: C.line }}
                  className="absolute right-0 top-full mt-2 w-56 rounded-xl border shadow-xl py-1.5 z-50"
                >
                  <button
                    onClick={() => {
                      setVista("perfil");
                      setMenuAbierto(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm flex items-center gap-2.5"
                    style={{ color: C.ink }}
                  >
                    <Contact size={16} style={{ color: C.mute }} />
                    Mi perfil
                  </button>
                  <button
                    onClick={() => {
                      setVista("calendario");
                      setMenuAbierto(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm flex items-center gap-2.5"
                    style={{ color: C.ink }}
                  >
                    <Calendar size={16} style={{ color: C.mute }} />
                    Calendario
                  </button>
                  <button
                    onClick={() => {
                      setVista("biblioteca");
                      setMenuAbierto(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm flex items-center gap-2.5"
                    style={{ color: C.ink }}
                  >
                    <FileText size={16} style={{ color: C.mute }} />
                    Biblioteca
                  </button>
                  <button
                    onClick={() => {
                      setVista("sugerencias");
                      setMenuAbierto(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm flex items-center gap-2.5"
                    style={{ color: C.ink }}
                  >
                    <Lightbulb size={16} style={{ color: C.mute }} />
                    Buzón sugerencias
                  </button>
                  {perfil && (perfil.rol === "admin" || perfil.rol === "dev") && (
                    <button
                      onClick={() => {
                        setVista("admin");
                        setMenuAbierto(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm flex items-center gap-2.5"
                      style={{ color: C.ink }}
                    >
                      <Settings size={16} style={{ color: C.mute }} />
                      Panel admin
                    </button>
                  )}
                  {perfil && perfil.rol === "dev" && (
                    <button
                      onClick={() => alternarModoDiosPropio()}
                      className="w-full text-left px-3 py-2 text-sm flex items-center gap-2.5"
                      style={{ color: perfil.modo_dios ? "#B45309" : C.ink }}
                    >
                      <Zap size={16} style={{ color: perfil.modo_dios ? "#F59E0B" : C.mute }} />
                      {perfil.modo_dios ? "Desactivar modo dios" : "Activar modo dios"}
                    </button>
                  )}
                  <div className="my-1.5 border-t" style={{ borderColor: C.line }} />
                  <button
                    onClick={() => supabase.auth.signOut()}
                    className="w-full text-left px-3 py-2 text-sm flex items-center gap-2.5"
                    style={{ color: C.red }}
                  >
                    <LogOut size={16} />
                    Cerrar sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-4 p-4">
        <aside className="space-y-1 lg:w-56 lg:shrink-0">
          <p className="text-xs font-bold uppercase tracking-wide px-2 mb-2" style={{ color: C.mute }}>
            Ámbitos de trabajo
          </p>
          <BotonAmbito
            activo={ambitoActivo === "todos"}
            onClick={() => setAmbitoActivo("todos")}
            icon={MessageSquare}
            nombre="Todo el club"
          />
          {AMBITOS.map((a) =>
            a.id === "cambios" ? (
              <CambiosSelector
                key={a.id}
                activo={ambitoActivo === "cambios"}
                categoria={cambiosCategoria}
                tipo={cambiosTipo}
                onAbrir={() => setAmbitoActivo("cambios")}
                onCategoria={(v) => {
                  setCambiosCategoria(v);
                  setCambiosTipo("");
                  setAmbitoActivo("cambios");
                }}
                onTipo={(v) => {
                  setCambiosTipo(v);
                  setAmbitoActivo("cambios");
                }}
                onContinuar={() => setModalCambioAbierto(true)}
                onVerCambios={() => setAmbitoActivo("cambios")}
              />
            ) : (
              <BotonAmbito
                key={a.id}
                activo={ambitoActivo === a.id}
                onClick={() => setAmbitoActivo(a.id)}
                icon={a.icon}
                nombre={a.nombre} descripcion={a.descripcion}
              />
            )
          )}
        </aside>

        <div className="flex-1 min-w-0 space-y-4"><div style={{ background: "#F3F6F9", borderColor: C.line }} className="rounded-lg border px-3 py-2 flex items-start gap-2"><Megaphone size={14} style={{ color: C.mute }} className="shrink-0 mt-0.5" /><p className="text-xs" style={{ color: C.mute }}>Este foro se está construyendo para todos. Hay muchas cosas que podemos mejorar, muchas veces por desconocimiento de otras categorías, así que por favor, mándanos tus sugerencias para poder mejorar el club. — La dirección</p></div>
        {perfil && !perfil.bienvenida_vista && (
          <div style={{ background: C.white, borderColor: C.blue }} className="rounded-xl border-2 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold flex items-center gap-1.5" style={{ color: C.blue }}>
                👋 ¡Bienvenido/a a Underground!
              </p>
              <button onClick={cerrarBienvenida} style={{ color: C.mute }} aria-label="Cerrar bienvenida">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs" style={{ color: C.ink }}>
              Una guía rápida de cuatro cosas para empezar:
            </p>
            <div className="space-y-2">
              <p className="text-xs" style={{ color: C.ink }}>
                <strong>💬 Foro:</strong> aquí mismo, elige un ámbito a la izquierda (Estaciones, Vías, Cambios...) o pulsa "Crear nuevo tema".
              </p>
              <p className="text-xs" style={{ color: C.ink }}>
                <strong>🔁 Cambios:</strong> ofrece o busca cambios de turno, servicio o vacaciones desde el ámbito "Cambios".
              </p>
              <p className="text-xs" style={{ color: C.ink }}>
                <strong>👤 Mi perfil:</strong> arriba a la derecha, en tu avatar. Ahí controlas qué ven los demás socios de ti y tus preferencias de calendario.
              </p>
              <p className="text-xs" style={{ color: C.ink }}>
                <strong>📅 Calendario:</strong> también desde tu avatar, para llevar tus turnos, vacaciones y bajas de forma privada.
              </p>
            </div>
            <button
              onClick={cerrarBienvenida}
              style={{ background: C.blue }}
              className="w-full text-white font-semibold py-2 rounded-lg text-xs"
            >
              Entendido, no volver a mostrar
            </button>
          </div>
        )}
        <button
          onClick={() => setFormAbierto((v) => !v)}
          style={{ background: C.blue }}
          className="w-full text-white font-semibold py-2.5 rounded-lg text-sm"
        >
          {formAbierto ? "Cancelar" : "+ Crear nuevo tema"}
        </button>

            <div className="relative">
              <Search
                size={17}
                style={{ color: C.mute }}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
              />
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar temas por título o texto..."
                className="w-full rounded-lg border pl-9 pr-3 py-2 text-sm outline-none"
                style={{ borderColor: C.line, color: C.ink, background: C.white }}
              />
            </div>

        {formAbierto && <FormularioNuevoTema sesion={sesion} onCreado={() => { setFormAbierto(false); cargarHilos(); }} />}

        {modalCambioAbierto && (
          <ModalOfertaCambio
            categoria={cambiosCategoria}
            tipo={cambiosTipo}
            onCerrar={() => setModalCambioAbierto(false)}
            onCrear={crearCambio}
          />
        )}

        {cargandoHilos && <p className="text-sm text-center" style={{ color: C.mute }}>Cargando temas...</p>}

        {!cargandoHilos && hilos.length === 0 && (
          <p className="text-sm text-center py-8" style={{ color: C.mute }}>
            Todavía no hay ningún tema. ¡Sé el primero en publicar!
          </p>
        )}

          {!cargandoHilos && hilos.length > 0 && hilosFiltrados.length === 0 && (
            <p className="text-sm text-center py-8" style={{ color: C.mute }}>
              No se ha encontrado ningún tema con esa búsqueda.
            </p>
        )}

        <div className="space-y-2">
                    {hilosFiltrados.map((h) => (
            <div
              key={h.id}
              style={{
                background: h.destacado ? "#FEF3C7" : C.white,
                borderColor: h.destacado ? "#F59E0B" : C.line,
                borderWidth: h.destacado ? 2 : 1,
              }}
              className="rounded-xl border p-4"
            >
              {h.destacado && (
                <p className="text-xs font-bold flex items-center gap-1 mb-1" style={{ color: "#B45309" }}>
                  <Star size={12} fill="#F59E0B" /> Tema destacado
                </p>
              )}
              <p className="text-xs font-semibold flex items-center gap-1" style={{ color: C.blue }}>
                {(() => {
                  const ambInfo = AMBITOS.find((a) => a.id === h.ambito);
                  const IconoAmb = ambInfo ? ambInfo.icon : MessageSquare;
                  return (
                    <>
                      <IconoAmb size={16} />
                      {ambInfo ? ambInfo.nombre : h.ambito}
                    </>
                  );
                })()}
              </p>
              {h.etiqueta_cambio && (
                <p className="text-xs font-bold" style={{ color: C.blueDark }}>
                  {h.etiqueta_cambio}
                </p>
              )}
              <p className="text-sm font-semibold" style={{ color: C.ink }}>
                {h.titulo}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <p className="text-xs" style={{ color: C.mute }}>
                  <button type="button" onClick={() => setVerSocioId(h.autor_id)} className="font-semibold">{nombrePublico(h.perfiles)}</button>
                  {h.perfiles?.vip && (
                    <span className="font-bold" style={{ color: "#B8860B" }}>
                      {" "}★ VIP
                    </span>
                  )}{" "}
                  ·{" "}
                  {new Date(h.creado_en).toLocaleString("es-ES")}
                </p>
                {h.autor_id !== sesion.user.id && (
                  <button
                    onClick={() => {
                      setMensajeIniciarCon(h.autor_id);
                      setVista("mensajes");
                    }}
                    aria-label="Enviar mensaje privado"
                    style={{ color: C.mute }}
                  >
                    <Mail size={14} />
                  </button>
                )}
                                { perfil?.modo_dios && (
                  <button
                    onClick={() => alternarDestacado(h.id, h.destacado)}
                    aria-label={h.destacado ? "Quitar destacado" : "Destacar tema"}
                    className={((h.autor_id === sesion.user.id && ahora - new Date(h.creado_en).getTime() < 5 * 60 * 1000) ? "" : "ml-auto ") + "text-xs font-semibold flex items-center gap-1"}
                    style={{ color: h.destacado ? "#B45309" : C.mute }}
          >
                    <Star size={12} fill={h.destacado ? "#F59E0B" : "none"} />
                    {h.destacado ? "Quitar" : "Destacar"}
                  </button>
                )}
                {((h.autor_id === sesion.user.id && ahora - new Date(h.creado_en).getTime() < 5 * 60 * 1000) ||
              perfil?.modo_dios) && (
              <button
                onClick={() => eliminarHiloPropio(h.id)}
                aria-label="Eliminar tema"
                className="text-xs font-semibold ml-auto flex items-center gap-1"
                style={{ color: C.red }}
              >
                {perfil?.modo_dios && h.autor_id !== sesion.user.id && <Zap size={12} />}
                Eliminar
              </button>
            )}
              </div>
              {h.texto && (
                <p className="text-sm mt-2" style={{ color: C.ink }}>
                  {h.texto}
                </p>
              )}
              <div className="flex items-center gap-4 mt-3 pt-3 border-t" style={{ borderColor: C.line }}>
                <BotonReaccion
                  icon={ThumbsUp}
                  color="#22C55E"
                  activo={h.miVoto === "meGusta"}
                  cantidad={h.reacciones ? h.reacciones.meGusta : 0}
                  onClick={() => votar(h.id, "meGusta")}
                  label="Me gusta"
                />
                <BotonReaccion
                  icon={Meh}
                  color="#EAB308"
                  activo={h.miVoto === "meDaIgual"}
                  cantidad={h.reacciones ? h.reacciones.meDaIgual : 0}
                  onClick={() => votar(h.id, "meDaIgual")}
                  label="Me da igual"
                />
                <BotonReaccion
                  icon={Angry}
                  color={C.red}
                  activo={h.miVoto === "meCabrea"}
                  cantidad={h.reacciones ? h.reacciones.meCabrea : 0}
                  onClick={() => votar(h.id, "meCabrea")}
                  label="Me cabrea"
                />
              </div>
              <Respuestas hiloId={h.id} sesion={sesion} onVerSocio={setVerSocioId} perfil={perfil} />
            </div>
          ))}
        </div>
        </div>
      
          <aside className="w-full lg:w-64 shrink-0">
            <div
              style={{ background: C.white, borderColor: C.line }}
              className="rounded-xl border p-4 space-y-4 lg:sticky lg:top-4"
            >
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: C.mute }}>
                El club en cifras
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div style={{ background: "#EAF2F9" }} className="rounded-lg p-2 shrink-0">
                    <MessageSquare size={18} style={{ color: C.blue }} />
                  </div>
                  <div>
                    <p className="text-lg font-bold leading-none" style={{ color: C.ink }}>
                      {hilos.length}
                    </p>
                    <p className="text-xs" style={{ color: C.mute }}>
                      Temas abiertos
                    </p>
                  </div>
                </div>
                                <div className="flex items-center gap-3">
                  <div style={{ background: "#EAF2F9" }} className="rounded-lg p-2 shrink-0">
                    <Users size={18} style={{ color: C.blue }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold leading-none" style={{ color: C.ink }}>
                      {numUsuariosRegistrados === null ? "..." : numUsuariosRegistrados}
                    </p>
                    <p className="text-xs" style={{ color: C.mute }}>
                      Socios registrados
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => abrirListaUsuarios("registrados")}
                    aria-label="Ver socios registrados"
                    style={{ color: C.mute }}
                    className="shrink-0"
                  >
                    <Eye size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div style={{ background: "#E7F7EE" }} className="rounded-lg p-2 shrink-0 relative">
                    <Users size={18} style={{ color: "#16A34A" }} />
                    <span
                      style={{ background: "#22C55E", borderColor: C.white }}
                      className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold leading-none" style={{ color: C.ink }}>
                      {usuariosOnline}
                    </p>
                    <p className="text-xs flex items-center gap-1" style={{ color: C.mute }}>
                      <span style={{ background: "#22C55E" }} className="w-1.5 h-1.5 rounded-full inline-block" />
                      En línea ahora
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => abrirListaUsuarios("online")}
                    aria-label="Ver socios en línea"
                    style={{ color: C.mute }}
                    className="shrink-0"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            </div>
          </aside></div>
        {verSocioId && (
        <TarjetaSocioModal
          usuarioId={verSocioId}
          sesion={sesion}
          onCerrar={() => setVerSocioId(null)}
          onMensaje={(id) => {
            setVerSocioId(null);
            setMensajeIniciarCon(id);
            setVista("mensajes");
          }}
        />
      )}
    {modalListaUsuarios && (
      <ModalListaUsuarios
        tipo={modalListaUsuarios}
        usuarios={listaUsuariosModal}
        cargando={cargandoListaUsuarios}
        onCerrar={() => setModalListaUsuarios(null)}
        onVerSocio={(id) => {
          setModalListaUsuarios(null);
          setVerSocioId(id);
        }}
      />
    )}
    </div>
  );
}


function ModalListaUsuarios({ tipo, usuarios, cargando, onCerrar, onVerSocio }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40 p-4" onClick={onCerrar}>
      <div
        style={{ background: C.white }}
        className="rounded-2xl shadow-2xl p-5 max-w-sm w-full space-y-3 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between shrink-0">
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: C.mute }}>
            {tipo === "registrados" ? "Socios registrados" : "Socios en línea ahora"}
          </p>
          <button onClick={onCerrar} style={{ color: C.mute }}>
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto space-y-1 -mx-1 px-1">
          {cargando && (
            <p className="text-sm text-center py-4" style={{ color: C.mute }}>
              Cargando...
            </p>
          )}
          {!cargando && usuarios.length === 0 && (
            <p className="text-sm text-center py-4" style={{ color: C.mute }}>
              {tipo === "registrados" ? "No hay socios registrados." : "No hay nadie en línea ahora mismo."}
            </p>
          )}
          {!cargando &&
            usuarios.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => onVerSocio(u.id)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-black/5 text-left"
              >
                {u.foto_url ? (
                  <img src={u.foto_url} alt="Avatar" className="w-9 h-9 rounded-full object-cover shrink-0" />
                ) : (
                  <div
                    style={{ background: C.blue }}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                  >
                    {(nombrePublico(u) || "?").slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: C.ink }}>
                    {nombrePublico(u)}
                    {u.vip && (
                      <span className="font-bold" style={{ color: "#B8860B" }}>
                        {" "}★
                      </span>
                    )}
                  </p>
                  {u.cargo && (
                    <p className="text-xs truncate" style={{ color: C.mute }}>
                      {u.cargo}
                    </p>
                  )}
                </div>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}


function TarjetaSocioModal({ usuarioId, sesion, onCerrar, onMensaje }) {
  const [perfilVisto, setPerfilVisto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [siguiendo, setSiguiendo] = useState(false);
  const [numSeguidores, setNumSeguidores] = useState(0);
  const [numSiguiendo, setNumSiguiendo] = useState(0);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    cargar();
  }, [usuarioId]);

  async function cargar() {
    setCargando(true);
    const [{ data: p }, { count: cSeguidores }, { count: cSiguiendo }, { data: yo }] = await Promise.all([
      supabase.from("perfiles").select("*").eq("id", usuarioId).single(),
      supabase.from("seguidores").select("id", { count: "exact", head: true }).eq("seguido_id", usuarioId),
      supabase.from("seguidores").select("id", { count: "exact", head: true }).eq("seguidor_id", usuarioId),
      supabase.from("seguidores").select("id").eq("seguidor_id", sesion.user.id).eq("seguido_id", usuarioId).maybeSingle(),
    ]);
    setPerfilVisto(p);
    setNumSeguidores(cSeguidores || 0);
    setNumSiguiendo(cSiguiendo || 0);
    setSiguiendo(!!yo);
    setCargando(false);
  }

  async function alternarSeguir() {
    setProcesando(true);
    if (siguiendo) {
      await supabase
        .from("seguidores")
        .delete()
        .eq("seguidor_id", sesion.user.id)
        .eq("seguido_id", usuarioId);
    } else {
      await supabase.from("seguidores").insert({ seguidor_id: sesion.user.id, seguido_id: usuarioId });
    }
    await cargar();
    setProcesando(false);
  }

  const esUnoMismo = usuarioId === sesion.user.id;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40 p-4" onClick={onCerrar}>
      <div
        style={{ background: C.white }}
        className="rounded-2xl shadow-2xl p-5 max-w-sm w-full space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        {(cargando || !perfilVisto) ? (
          <p className="text-sm text-center py-4" style={{ color: C.mute }}>
            Cargando...
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: C.mute }}>
                Tarjeta de socio
              </p>
              <button onClick={onCerrar} style={{ color: C.mute }}>
                <X size={20} />
              </button>
            </div>
            <div className="flex items-center gap-3">
              {perfilVisto.foto_url ? (
                <img src={perfilVisto.foto_url} alt="Avatar" className="w-14 h-14 rounded-full object-cover shrink-0" />
              ) : (
                <div
                  style={{ background: C.blue }}
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
                >
                  {(nombrePublico(perfilVisto) || "?").slice(0, 1).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold flex items-center gap-1" style={{ color: C.ink }}>
                  {nombrePublico(perfilVisto)}
                  {perfilVisto.vip && (
                    <span className="font-bold" style={{ color: "#B8860B" }}>
                      ★ VIP
                    </span>
                  )}
                </p>
                {perfilVisto.mostrar_cargo && perfilVisto.cargo && (
                  <p className="text-xs" style={{ color: C.mute }}>
                    {perfilVisto.cargo}
                  </p>
                )}
              </div>
            </div>
            {perfilVisto.mostrar_intereses && perfilVisto.intereses && (
              <p className="text-sm" style={{ color: C.ink }}>
                {perfilVisto.intereses}
              </p>
            )}
            {(perfilVisto.mostrar_seguidores || esUnoMismo) && (
              <p className="text-xs" style={{ color: C.mute }}>
                <strong style={{ color: C.ink }}>{numSeguidores}</strong> seguidores ·{" "}
                <strong style={{ color: C.ink }}>{numSiguiendo}</strong> siguiendo
              </p>
            )}
            {!esUnoMismo && (
              <div className="flex gap-2">
                {perfilVisto.permite_seguir !== false && (
                  <button
                    onClick={alternarSeguir}
                    disabled={procesando}
                    style={{
                      background: siguiendo ? C.white : C.blue,
                      color: siguiendo ? C.blue : C.white,
                      borderColor: C.blue,
                    }}
                    className="flex-1 border-2 font-semibold py-2 rounded-lg text-sm flex items-center justify-center gap-1.5"
                  >
                    <UserPlus size={16} />
                    {siguiendo ? "Dejar de seguir" : "Seguir"}
                  </button>
                )}
                <button
                  onClick={() => onMensaje(usuarioId)}
                  style={{ borderColor: C.line, color: C.ink }}
                  className="flex-1 border-2 font-semibold py-2 rounded-lg text-sm flex items-center justify-center gap-1.5"
                >
                  <Mail size={16} />
                  Mensaje
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}


function PendienteAprobacion({ onCerrarSesion }) {
  return (
    <div
      style={{ background: "#F3F6F9", position: "relative", zIndex: 0 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <MarcaAguaFondo />
      <div
        style={{ background: C.white, borderColor: C.line, position: "relative", zIndex: 1 }}
        className="rounded-2xl border shadow-xl p-6 max-w-md w-full text-center space-y-4"
      >
        <div className="mx-auto w-fit">
          <LogoUnderground size={77} />
        </div>
        <h1 className="text-lg font-bold" style={{ color: C.ink }}>
          Tu alta está pendiente de aprobación
        </h1>
        <p className="text-sm" style={{ color: C.mute }}>
          Un administrador tiene que confirmar que eres agente de Metro de Madrid antes de que puedas
          entrar al club. En cuanto la revisen, podrás acceder con normalidad.
        </p>
        <button
          onClick={onCerrarSesion}
          style={{ borderColor: C.line, color: C.ink }}
          className="border rounded-lg py-2.5 px-4 text-sm font-semibold"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}


function FormularioNuevoTema({ sesion, onCreado }) {
  const [ambito, setAmbito] = useState("general");
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function publicar() {
    if (!titulo.trim()) {
      setError("Ponle un título al tema.");
      return;
    }
    setError("");
    setEnviando(true);
    const { error } = await supabase.from("hilos").insert({
      ambito,
      titulo: titulo.trim(),
      texto: texto.trim(),
      autor_id: sesion.user.id,
    });
    setEnviando(false);
    if (error) {
      setError(error.message);
      return;
    }
    setTitulo("");
    setTexto("");
    onCreado();
  }

  return (
    <div style={{ background: C.white, borderColor: C.line }} className="rounded-xl border p-4 space-y-3">
      {error && (
        <p className="text-xs rounded-lg p-2" style={{ background: "#FCEBEA", color: C.red }}>
          {error}
        </p>
      )}
      <div>
        <label className="text-xs font-semibold block mb-1" style={{ color: C.ink }}>
          Categoría
        </label>
        <select
          value={ambito}
          onChange={(e) => setAmbito(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
          style={{ borderColor: C.line, color: C.ink }}
        >
          {AMBITOS.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold block mb-1" style={{ color: C.ink }}>
          Título
        </label>
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
          style={{ borderColor: C.line, color: C.ink }}
        />
      </div>
      <div>
        <label className="text-xs font-semibold block mb-1" style={{ color: C.ink }}>
          Mensaje (opcional)
        </label>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={3}
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none resize-none"
          style={{ borderColor: C.line, color: C.ink }}
        />
      </div>
      <button
        onClick={publicar}
        disabled={enviando}
        style={{ background: enviando ? "#B9C6D2" : C.red }}
        className="w-full text-white font-semibold py-2.5 rounded-lg text-sm"
      >
        {enviando ? "Publicando..." : "Publicar tema"}
      </button>
    </div>
  );
}


function Respuestas({ hiloId, sesion, onVerSocio, perfil }) {
  const [respuestas, setRespuestas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    cargar();
  }, [hiloId]);

  function cargar() {
    setCargando(true);
    supabase
      .from("respuestas")
      .select("*, perfiles(nombre, apellido, nickname, mostrar_nombre_real, vip)")
      .eq("hilo_id", hiloId)
      .order("creado_en", { ascending: true })
      .then(({ data, error }) => {
        if (!error) setRespuestas(data || []);
        setCargando(false);
      });
  }

  async function eliminarRespuesta(id) {
    const { error } = await supabase.from("respuestas").delete().eq("id", id);
    if (!error) cargar();
  }

  async function enviar() {
    if (!texto.trim()) return;
    setError("");
    setEnviando(true);
    const { error } = await supabase.from("respuestas").insert({
      hilo_id: hiloId,
      autor_id: sesion.user.id,
      texto: texto.trim(),
    });
    setEnviando(false);
    if (error) {
      setError(error.message);
      return;
    }
    setTexto("");
    cargar();
  }

  return (
    <div className="mt-3 pt-3 border-t" style={{ borderColor: C.line }}>
      {error && (
        <p className="text-xs rounded-lg p-2 mb-2" style={{ background: "#FCEBEA", color: C.red }}>
          {error}
        </p>
      )}

      {cargando && (
        <p className="text-xs" style={{ color: C.mute }}>
          Cargando respuestas...
        </p>
      )}

      {!cargando && respuestas.length === 0 && (
        <p className="text-xs" style={{ color: C.mute }}>
          Sin respuestas todavía.
        </p>
      )}

      <div className="space-y-2 mb-2">
        {respuestas.map((r) => (
          <div key={r.id} style={{ background: "#F3F6F9" }} className="rounded-lg p-2">
            <p className="text-xs font-semibold" style={{ color: C.ink }}>
              <button type="button" onClick={() => onVerSocio && onVerSocio(r.autor_id)} className="font-semibold">{nombrePublico(r.perfiles)}</button>{" "}
              <span className="font-normal" style={{ color: C.mute }}>
                · {new Date(r.creado_en).toLocaleString("es-ES")}
              </span>
              {perfil?.modo_dios && (
                <button
                  type="button"
                  onClick={() => eliminarRespuesta(r.id)}
                  className="font-semibold"
                  style={{ color: C.red }}
                >
                  {" "}
                  · Eliminar
                </button>
              )}
            </p>
            <p className="text-sm mt-0.5" style={{ color: C.ink }}>
              {r.texto}
            </p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe una respuesta..."
          className="flex-1 rounded-lg border px-3 py-2 text-xs outline-none"
          style={{ borderColor: C.line, color: C.ink }}
        />
        <button
          onClick={enviar}
          disabled={enviando}
          style={{ background: enviando ? "#B9C6D2" : C.blue }}
          className="text-white text-xs font-semibold rounded-lg px-4"
        >
          {enviando ? "..." : "Enviar"}
        </button>
      </div>
    </div>
  );
}


function BotonReaccion({ icon: Icon, color, activo, cantidad, onClick, label }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex flex-col items-center gap-0.5"
    >
      <Icon size={20} style={{ color: activo ? color : C.mute }} strokeWidth={activo ? 2.5 : 2} />
      <span className="text-xs font-semibold" style={{ color: activo ? color : C.mute }}>
        {cantidad}
      </span>
    </button>
  );
}


function BotonAmbito({ activo, onClick, icon: Icon = MessageSquare, nombre, descripcion }) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onClick}
        className="flex-1 min-w-0 text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5"
        style={{ background: activo ? "#EAF2F9" : "transparent" }}
      >
        <Icon size={20} className="shrink-0" style={{ color: activo ? C.blue : C.mute }} />
        <p className="text-sm font-semibold truncate" style={{ color: activo ? C.blueDark : C.ink }}>
          {nombre}
        </p>
      </button>
      {descripcion && <InfoAmbito texto={descripcion} />}
    </div>
  );
}


function InfoAmbito({ texto }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-label="Qué se publica aquí"
        style={{ color: C.mute }}
        className="p-1 rounded-full hover:bg-black/5"
      >
        <Info size={15} />
      </button>
      {abierto && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setAbierto(false)} />
          <div
            style={{ background: C.blueDarker }}
            className="absolute z-40 left-0 top-full mt-1 w-60 rounded-lg shadow-xl p-3 text-xs text-white leading-relaxed"
          >
            {texto}
          </div>
        </>
      )}
    </div>
  );
}


function SelectorFecha({ value, onChange, min, label }) {
  const hoyRef = new Date();
  const fechaValor = value ? new Date(value + "T00:00:00") : null;
  const [abierto, setAbierto] = useState(false);
  const [mesVisto, setMesVisto] = useState((fechaValor || hoyRef).getMonth());
  const [anoVisto, setAnoVisto] = useState((fechaValor || hoyRef).getFullYear());
  const botonRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const MESES = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];
  const DIAS_SEMANA = ["L", "M", "X", "J", "V", "S", "D"];

    function abrir() {
    const base = fechaValor || hoyRef;
    setMesVisto(base.getMonth());
    setAnoVisto(base.getFullYear());
    if (botonRef.current) {
      const r = botonRef.current.getBoundingClientRect();
      const ALTO_CALENDARIO = 360;
      const izq = Math.max(8, Math.min(r.left, window.innerWidth - 296));
      let arriba = r.bottom + 4;
      // Si no cabe hacia abajo (movil con teclado/barra de navegador), lo abrimos hacia arriba del boton
      if (arriba + ALTO_CALENDARIO > window.innerHeight - 8) {
        arriba = Math.max(8, r.top - ALTO_CALENDARIO - 4);
      }
      setPos({ top: arriba, left: izq });
    }
    setAbierto(true);
  }

  function cambiarMes(delta) {
    let m = mesVisto + delta;
    let a = anoVisto;
    if (m < 0) {
      m = 11;
      a -= 1;
    } else if (m > 11) {
      m = 0;
      a += 1;
    }
    setMesVisto(m);
    setAnoVisto(a);
  }

  function aIso(a, m, d) {
    return `${a}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  function seleccionarDia(d) {
    onChange(aIso(anoVisto, mesVisto, d));
    setAbierto(false);
  }

  const primerDiaSemana = (new Date(anoVisto, mesVisto, 1).getDay() + 6) % 7;
  const diasEnMes = new Date(anoVisto, mesVisto + 1, 0).getDate();
  const celdas = [];
  for (let i = 0; i < primerDiaSemana; i++) celdas.push(null);
  for (let d = 1; d <= diasEnMes; d++) celdas.push(d);

  const minDate = min ? new Date(min + "T00:00:00") : null;
  const hoyIso = aIso(hoyRef.getFullYear(), hoyRef.getMonth(), hoyRef.getDate());

  function formatear(v) {
    if (!v) return "Selecciona una fecha";
    const f = new Date(v + "T00:00:00");
    const texto = f.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  return (
    <div className="relative">
            <button
        ref={botonRef}
        type="button"
        onClick={() => (abierto ? setAbierto(false) : abrir())}
        className="w-full rounded-lg border px-3 py-2 text-sm outline-none flex items-center justify-between gap-2"
        style={{ borderColor: C.line, color: value ? C.ink : C.mute, background: C.white }}
      >
        <span className="truncate">{formatear(value)}</span>
        <Calendar size={16} style={{ color: C.blue }} className="shrink-0" />
      </button>
      {abierto && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setAbierto(false)} />
          <div
            style={{ background: C.white, borderColor: C.line, top: pos.top, left: pos.left, maxHeight: "calc(100vh - 16px)", overflowY: "auto" }}
            className="fixed z-50 border rounded-xl shadow-xl p-3 w-72 max-w-[80vw]"
          >
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={() => cambiarMes(-1)}
                aria-label="Mes anterior"
                style={{ color: C.blue }}
                className="p-1.5 rounded-full hover:bg-black/5"
              >
                <ChevronLeft size={18} />
              </button>
              <p className="text-sm font-semibold capitalize" style={{ color: C.ink }}>
                {MESES[mesVisto]} {anoVisto}
              </p>
              <button
                type="button"
                onClick={() => cambiarMes(1)}
                aria-label="Mes siguiente"
                style={{ color: C.blue }}
                className="p-1.5 rounded-full hover:bg-black/5"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {DIAS_SEMANA.map((d, i) => (
                <p key={i} className="text-center text-[10px] font-semibold" style={{ color: C.mute }}>
                  {d}
                </p>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {celdas.map((d, i) => {
                if (d === null) return <div key={i} />;
                const iso = aIso(anoVisto, mesVisto, d);
                const fechaCelda = new Date(anoVisto, mesVisto, d);
                const esSeleccionado = value === iso;
                const esHoy = iso === hoyIso;
                const deshabilitado = minDate && fechaCelda < minDate;
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={deshabilitado}
                    onClick={() => seleccionarDia(d)}
                    className="aspect-square rounded-full text-xs flex items-center justify-center"
                    style={{
                      background: esSeleccionado ? C.blue : "transparent",
                      color: deshabilitado ? "#C7D2DA" : esSeleccionado ? C.white : C.ink,
                      fontWeight: esHoy ? 700 : 400,
                      boxShadow: esHoy && !esSeleccionado ? `inset 0 0 0 1px ${C.blue}` : "none",
                      cursor: deshabilitado ? "not-allowed" : "pointer",
                    }}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}


function ModalOfertaCambio({ categoria, tipo, onCerrar, onCrear }) {
  const turnos = TURNOS[categoria] || [];
  const esServicio = tipo === "servicio";
  const esDiaLibre = tipo === "dia_libre";
  const esVacaciones = tipo === "vacaciones";

  const [diaOfrecido, setDiaOfrecido] = useState("");
  const [turnoOfrecido, setTurnoOfrecido] = useState("");
  const [turnosDeseados, setTurnosDeseados] = useState([]);
  const [lineasPreferidas, setLineasPreferidas] = useState([]);
  const [lineaEstacionConcreta, setLineaEstacionConcreta] = useState("");
  const [estacionConcreta, setEstacionConcreta] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [diaLibreQuiero, setDiaLibreQuiero] = useState("");
  const [diasLibreOfrezco, setDiasLibreOfrezco] = useState([]);
  const [nuevoDiaOfrecido, setNuevoDiaOfrecido] = useState("");

  const [vacTengoInicio, setVacTengoInicio] = useState("");
  const [vacTengoFin, setVacTengoFin] = useState("");
  const [vacQuieroInicio, setVacQuieroInicio] = useState("");
  const [vacQuieroFin, setVacQuieroFin] = useState("");
  const [vacTemporada, setVacTemporada] = useState("");
  const [vacModo, setVacModo] = useState("");

  const minStr = (() => {
    const m = new Date();
    m.setDate(m.getDate() + 1);
    return `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}-${String(m.getDate()).padStart(2, "0")}`;
  })();

  function elegirDiaOfrecido(v) {
    setDiaOfrecido(v < minStr ? minStr : v);
  }

  function anadirDiaOfrecido() {
    if (!nuevoDiaOfrecido) return;
    if (!diasLibreOfrezco.includes(nuevoDiaOfrecido)) {
      setDiasLibreOfrezco((prev) => [...prev, nuevoDiaOfrecido].sort());
    }
    setNuevoDiaOfrecido("");
  }

  function quitarDiaOfrecido(dia) {
    setDiasLibreOfrezco((prev) => prev.filter((d) => d !== dia));
  }

  function alternarTurnoDeseado(idTurno) {
    setTurnosDeseados((prev) =>
      prev.includes(idTurno) ? prev.filter((t) => t !== idTurno) : [...prev, idTurno]
    );
  }

  function alternarLineaPreferida(idLinea) {
    setLineasPreferidas((prev) =>
      prev.includes(idLinea) ? prev.filter((l) => l !== idLinea) : [...prev, idLinea]
    );
  }

  const ambosDias = esVacaciones
    ? vacTengoInicio &&
      vacTengoFin &&
      vacQuieroInicio &&
      vacQuieroFin &&
      vacTemporada &&
      (vacTemporada !== "ambas" || vacModo)
    : esServicio
    ? diaOfrecido &&
      turnoOfrecido &&
      (turnosDeseados.length > 0 ||
        lineasPreferidas.length > 0 ||
        (lineaEstacionConcreta && estacionConcreta))
    : diaLibreQuiero && diasLibreOfrezco.length > 0;

  const infoCategoriaCambio = CATEGORIAS_TURNO.find((c) => c.id === categoria) || {};
  const nombreCategoria = infoCategoriaCambio.nombre || categoria;
  const nombreCategoriaCorta = infoCategoriaCambio.corta || nombreCategoria;
  const tituloTipo = esServicio ? "servicio" : esDiaLibre ? "día libre" : "vacaciones";
  const tituloTipoCorta = esServicio ? "Servicio" : esDiaLibre ? "Día Libre" : "Vacaciones";

  function formatearFecha(f) {
    if (!f) return "";
    const [a, m, d] = f.split("-");
    return `${d}/${m}/${a}`;
  }

  function publicarOferta() {
    let titulo = "";
    const lineasTexto = [];

    if (esServicio) {
      const nombreTurnoTenido = turnos.find((t) => t.id === turnoOfrecido)?.nombre || turnoOfrecido;
      titulo = `Cambio día ${formatearFecha(diaOfrecido)} el turno ${turnoOfrecido} por:`;

      if (turnosDeseados.length > 0) {
        const nombres = turnosDeseados
          .map((id) => turnos.find((t) => t.id === id)?.nombre || id)
          .join(", ");
        lineasTexto.push(`Turnos que me valdrían: ${nombres}`);
      }
      if (lineasPreferidas.length > 0) {
        const nombres = lineasPreferidas.map((id) => LINEAS_METRO_ESTACIONES[id].nombre).join(", ");
        lineasTexto.push(`Líneas de preferencia: ${nombres}`);
      }
      if (lineaEstacionConcreta && estacionConcreta) {
        lineasTexto.push(
          `Estación en concreto: ${estacionConcreta} (${LINEAS_METRO_ESTACIONES[lineaEstacionConcreta].nombre})`
        );
      }
      lineasTexto.unshift(`Tengo: ${nombreTurnoTenido}, día ${formatearFecha(diaOfrecido)}`);
    } else if (esDiaLibre) {
      const diasFormateados = diasLibreOfrezco.map(formatearFecha).join(", ");
      titulo = `Cambio día libre: necesito librar el ${formatearFecha(diaLibreQuiero)}, ofrezco a cambio ${diasFormateados}`;
      lineasTexto.push(`Día que necesito librar: ${formatearFecha(diaLibreQuiero)}`);
      lineasTexto.push(`Día(s) que ofrezco a cambio: ${diasFormateados}`);
    } else {
      const nombreTemporada =
        vacTemporada === "verano" ? "Verano" : vacTemporada === "invierno" ? "Invierno" : "Verano e invierno";
      titulo = `Cambio de vacaciones (${nombreTemporada}): ${formatearFecha(vacTengoInicio)} - ${formatearFecha(vacTengoFin)} por ${formatearFecha(vacQuieroInicio)} - ${formatearFecha(vacQuieroFin)}`;
      lineasTexto.push(`Temporada: ${nombreTemporada}`);
      if (vacTemporada === "ambas") {
        lineasTexto.push(vacModo === "pack" ? "Se cambian las dos juntas, en pack" : "Se pueden cambiar por separado");
      }
      lineasTexto.push(`Periodo que tengo: del ${formatearFecha(vacTengoInicio)} al ${formatearFecha(vacTengoFin)}`);
      lineasTexto.push(`Periodo que quiero: del ${formatearFecha(vacQuieroInicio)} al ${formatearFecha(vacQuieroFin)}`);
    }

    if (descripcion.trim()) lineasTexto.push("", descripcion.trim());

    onCrear({
      ambito: "cambios",
      titulo,
      texto: lineasTexto.join("\n"),
      categoria,
      tipo,
      etiquetaCambio: `${nombreCategoriaCorta} | ${tituloTipoCorta}`,
    });
    onCerrar();
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center z-30 p-0 sm:p-4">
      <div
        style={{ background: C.white, maxHeight: "88vh" }}
        className="w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col"
      >
        <div style={{ background: C.blueDark }} className="p-4 rounded-t-2xl flex items-center justify-between shrink-0">
          <div className="text-white">
            <p className="font-bold text-sm">Ofertar cambio de {tituloTipo}</p>
            <p className="text-xs opacity-80">{nombreCategoria}</p>
          </div>
          <button onClick={onCerrar} className="text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto">
          {esServicio && (
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: C.ink }}>
              Día del cambio
            </label>
            <SelectorFecha value={diaOfrecido} min={minStr} onChange={elegirDiaOfrecido} />
          </div>
          )}

          {esDiaLibre && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: C.ink }}>
                  Día que quieres/necesitas librar
                </label>
                <SelectorFecha
                  value={diaLibreQuiero}
                  min={minStr}
                  onChange={(v) => setDiaLibreQuiero(v < minStr ? minStr : v)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: C.ink }}>
                  Día(s) que ofreces a cambio
                </label>
                <div className="flex gap-2">
                                    <div className="flex-1">
                    <SelectorFecha
                      value={nuevoDiaOfrecido}
                      min={minStr}
                      onChange={(v) => setNuevoDiaOfrecido(v < minStr ? minStr : v)}
                    />
                  </div>
                  <button
                    onClick={anadirDiaOfrecido}
                    disabled={!nuevoDiaOfrecido}
                    style={{ background: nuevoDiaOfrecido ? C.blue : "#B9C6D2" }}
                    className="text-white text-sm font-semibold px-4 rounded-lg shrink-0"
                  >
                    Añadir
                  </button>
                </div>

                {diasLibreOfrezco.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {diasLibreOfrezco.map((d) => (
                      <span
                        key={d}
                        style={{ background: "#EAF2F9", color: C.blueDark }}
                        className="text-xs font-semibold px-2.5 py-1.5 rounded-full flex items-center gap-1.5"
                      >
                        {formatearFecha(d)}
                        <button onClick={() => quitarDiaOfrecido(d)} aria-label="Quitar día">
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {esVacaciones && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold mb-1.5" style={{ color: C.ink }}>
                  Periodo que tienes
                </p>
                <div className="grid grid-cols-2 gap-2">
                                    <SelectorFecha
                    value={vacTengoInicio}
                    min={minStr}
                    onChange={(v) => setVacTengoInicio(v < minStr ? minStr : v)}
                  />
                  <SelectorFecha
                    value={vacTengoFin}
                    min={vacTengoInicio || minStr}
                    onChange={(v) => setVacTengoFin(v < minStr ? minStr : v)}
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold mb-1.5" style={{ color: C.ink }}>
                  Periodo que quieres
                </p>
                <div className="grid grid-cols-2 gap-2">
                                    <SelectorFecha
                    value={vacQuieroInicio}
                    min={minStr}
                    onChange={(v) => setVacQuieroInicio(v < minStr ? minStr : v)}
                  />
                  <SelectorFecha
                    value={vacQuieroFin}
                    min={vacQuieroInicio || minStr}
                    onChange={(v) => setVacQuieroFin(v < minStr ? minStr : v)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: C.ink }}>
                  ¿Verano o invierno?
                </label>
                <select
                  value={vacTemporada}
                  onChange={(e) => {
                    setVacTemporada(e.target.value);
                    setVacModo("");
                  }}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                  style={{ borderColor: C.line, color: C.ink }}
                >
                  <option value="">Selecciona...</option>
                  <option value="verano">Verano</option>
                  <option value="invierno">Invierno</option>
                  <option value="ambas">Las dos</option>
                </select>
              </div>

              {vacTemporada === "ambas" && (
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: C.ink }}>
                    ¿Cambias las dos en pack o por separado?
                  </label>
                  <select
                    value={vacModo}
                    onChange={(e) => setVacModo(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                    style={{ borderColor: C.line, color: C.ink }}
                  >
                    <option value="">Selecciona...</option>
                    <option value="pack">En pack (las dos juntas)</option>
                    <option value="separado">Por separado (vale una sola)</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {esServicio && diaOfrecido && (
            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: C.ink }}>
                Turno que tienes ese día
              </label>
              <select
                value={turnoOfrecido}
                onChange={(e) => setTurnoOfrecido(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                style={{ borderColor: C.line, color: C.ink }}
              >
                <option value="">Selecciona...</option>
                {turnos.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          {esServicio && turnoOfrecido && (
            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: C.ink }}>
                Turno(s) que te valdrían ese mismo día
              </label>
              <div className="space-y-1.5">
                {turnos.map((t) => (
                  <label
                    key={t.id}
                    className="flex items-center gap-2 text-sm rounded-lg border px-3 py-2"
                    style={{ borderColor: C.line, color: C.ink }}
                  >
                    <input
                      type="checkbox"
                      checked={turnosDeseados.includes(t.id)}
                      onChange={() => alternarTurnoDeseado(t.id)}
                      className="w-4 h-4"
                    />
                    {t.nombre}
                  </label>
                ))}
              </div>
            </div>
          )}

          {esServicio && turnoOfrecido && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: C.ink }}>
                  ¿Alguna estación en concreto? (opcional)
                </label>
                <select
                  value={lineaEstacionConcreta}
                  onChange={(e) => {
                    setLineaEstacionConcreta(e.target.value);
                    setEstacionConcreta("");
                  }}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                  style={{ borderColor: C.line, color: C.ink }}
                >
                  <option value="">Selecciona una línea...</option>
                  {Object.entries(LINEAS_METRO_ESTACIONES).map(([id, l]) => (
                    <option key={id} value={id}>
                      {l.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {lineaEstacionConcreta && (
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: C.ink }}>
                    Estación
                  </label>
                  <select
                    value={estacionConcreta}
                    onChange={(e) => setEstacionConcreta(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                    style={{ borderColor: C.line, color: C.ink }}
                  >
                    <option value="">Selecciona...</option>
                    {LINEAS_METRO_ESTACIONES[lineaEstacionConcreta].estaciones.map((est) => (
                      <option key={est} value={est}>
                        {est}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {ambosDias && (
            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: C.ink }}>
                Cuéntanos más (opcional)
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ej: prefiero mañanas por temas familiares, línea 6 mejor que otras..."
                rows={3}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none resize-none"
                style={{ borderColor: C.line, color: C.ink }}
              />
            </div>
          )}
        </div>

        <div className="p-4 border-t shrink-0" style={{ borderColor: C.line }}>
          <button
            disabled={!ambosDias}
            onClick={publicarOferta}
            style={{ background: ambosDias ? C.blue : "#B9C6D2" }}
            className="w-full text-white font-semibold py-2.5 rounded-lg text-sm"
          >
            Publicar oferta
          </button>
        </div>
      </div>
    </div>
  );
}


function CambiosSelector({ activo, categoria, tipo, onAbrir, onCategoria, onTipo, onContinuar, onVerCambios }) {
  constt [abierto, setAbierto] = useState(false);
  const [accion, setAccion] = useState("");

  const [categoriasVisibles, setCategoriasVisibles] = useState(["sector", "maquinista"]);

  useEffect(() => {
    supabase
      .from("ajustes_club")
      .select("categorias_cambios_visibles")
      .eq("id", true)
      .single()
      .then(({ data }) => {
        if (data?.categorias_cambios_visibles?.length) {
          setCategoriasVisibles(data.categorias_cambios_visibles);
        }
      });
  }, []);

  const CATEGORIAS = CATEGORIAS_TURNO.filter((c) => categoriasVisibles.includes(c.id));
  const TIPOS = [
    { id: "servicio", nombre: "Servicio" },
    { id: "dia_libre", nombre: "Día libre" },
    { id: "vacaciones", nombre: "Vacaciones" },
  ];

  return (
    <div>
      <button
        onClick={() => {
          setAbierto(!abierto);
          onAbrir();
        }}
        className="w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5"
        style={{ background: activo ? "#EAF2F9" : "transparent" }}
      >
        <Repeat size={20} className="shrink-0" style={{ color: activo ? C.blue : C.mute }} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate" style={{ color: activo ? C.blueDark : C.ink }}>
            Cambios
          </p>
        </div>
        <ChevronRight
          size={16}
          className="shrink-0"
          style={{ color: C.mute, transform: abierto ? "rotate(90deg)" : "none" }}
        />
      </button>

      {abierto && (
        <div className="pl-8 pr-2 pb-2 pt-1 space-y-2">
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: C.mute }}>
              ¿Qué quieres hacer?
            </p>
            <select
              value={accion}
              onChange={(e) => {
                const v = e.target.value;
                setAccion(v);
                if (v === "ver") onVerCambios();
              }}
              className="w-full rounded-lg border px-2.5 py-1.5 text-xs outline-none"
              style={{ borderColor: C.line, color: C.ink }}
            >
              <option value="">Selecciona...</option>
              <option value="ver">Ver cambios</option>
              <option value="solicitar">Solicitar cambio</option>
            </select>
          </div>

          {accion === "solicitar" && (
            <>
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: C.mute }}>
                  1. Elige tu categoría
                </p>
                <select
                  value={categoria}
                  onChange={(e) => onCategoria(e.target.value)}
                  className="w-full rounded-lg border px-2.5 py-1.5 text-xs outline-none"
                  style={{ borderColor: C.line, color: C.ink }}
                >
                  <option value="">Selecciona...</option>
                  {CATEGORIAS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {categoria && (
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: C.mute }}>
                    2. ¿Qué quieres ofertar?
                  </p>
                  <select
                    value={tipo}
                    onChange={(e) => onTipo(e.target.value)}
                    className="w-full rounded-lg border px-2.5 py-1.5 text-xs outline-none"
                    style={{ borderColor: C.line, color: C.ink }}
                >
                    <option value="">Selecciona...</option>
                    {TIPOS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {categoria && tipo && (
                <div className="flex justify-center pt-1">
                  <button
                    onClick={onContinuar}
                    style={{ background: C.blue }}
                    className="text-white text-xs font-semibold px-5 py-2 rounded-lg"
                  >
                    Continuar
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

