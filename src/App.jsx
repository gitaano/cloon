import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { LogIn, UserPlus, Eye, EyeOff, ArrowLeft, ShieldCheck, ThumbsUp, Meh, Angry } from "lucide-react";

const C = {
  blue: "#0060A9",
  blueDark: "#003D73",
  blueDarker: "#02284D",
  red: "#E30613",
  white: "#FFFFFF",
  bg: "#F3F6F9",
  ink: "#152A3D",
  mute: "#5C7185",
  line: "#DCE4EC",
};

function LogoUnderground({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" fill={C.red} />
      <circle cx="50" cy="50" r="46" fill="none" stroke={C.white} strokeWidth="6" />
      <circle cx="50" cy="50" r="30" fill={C.white} />
      <circle cx="50" cy="50" r="21" fill={C.blue} />
    </svg>
  );
}

export default function App() {
  const [sesion, setSesion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [recuperandoPass, setRecuperandoPass] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSesion(data.session);
      setCargando(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((evento, nuevaSesion) => {
      setSesion(nuevaSesion);
      if (evento === "PASSWORD_RECOVERY") {
        setRecuperandoPass(true);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (cargando) {
    return (
      <div style={{ background: C.blueDarker }} className="min-h-screen flex items-center justify-center">
        <p className="text-white text-sm">Cargando...</p>
      </div>
    );
  }

  if (recuperandoPass) {
    return <NuevaContrasena onListo={() => setRecuperandoPass(false)} />;
  }

  if (!sesion) {
    return <Acceso />;
  }

  return <ClubProvisional sesion={sesion} />;
}

function NuevaContrasena({ onListo }) {
  const [pass, setPass] = useState("");
  const [verPass, setVerPass] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  async function guardar() {
    setMensaje(null);
    if (pass.length < 6) {
      setMensaje({ tipo: "error", texto: "La contraseña debe tener al menos 6 caracteres." });
      return;
    }
    setCargando(true);
    const { error } = await supabase.auth.updateUser({ password: pass });
    setCargando(false);
    if (error) {
      setMensaje({ tipo: "error", texto: error.message });
      return;
    }
    setMensaje({ tipo: "ok", texto: "¡Contraseña actualizada! Ya puedes continuar." });
  }

  return (
    <div
      style={{ background: `linear-gradient(160deg, ${C.blueDarker}, ${C.blue})` }}
      className="min-h-screen w-full flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto w-fit drop-shadow-lg">
            <LogoUnderground size={72} />
          </div>
          <h1 style={{ color: C.white }} className="text-2xl font-bold mt-4">
            Nueva contraseña
          </h1>
          <p style={{ color: "#BFD9EE" }} className="text-sm mt-1">
            Elige una contraseña nueva para tu cuenta
          </p>
        </div>
        <div style={{ background: C.white }} className="rounded-2xl shadow-2xl p-6 space-y-4">
          {mensaje && (
            <p
              className="text-xs rounded-lg p-2.5"
              style={{
                background: mensaje.tipo === "error" ? "#FCEBEA" : "#E7F7EE",
                color: mensaje.tipo === "error" ? C.red : "#15803D",
              }}
            >
              {mensaje.texto}
            </p>
          )}
          {mensaje?.tipo === "ok" ? (
            <BotonPrincipal onClick={onListo} cargando={false}>
              Continuar
            </BotonPrincipal>
          ) : (
            <>
              <CampoPass verPass={verPass} setVerPass={setVerPass} value={pass} onChange={setPass} />
              <BotonPrincipal onClick={guardar} cargando={cargando}>
                Guardar contraseña
              </BotonPrincipal>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Acceso() {
  const [modo, setModo] = useState("login");
  const [verPass, setVerPass] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");

  const [regNombre, setRegNombre] = useState("");
  const [regApellido, setRegApellido] = useState("");
  const [regDne, setRegDne] = useState("");
  const [regCargo, setRegCargo] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");

  const [recEmail, setRecEmail] = useState("");

  async function entrar() {
    setMensaje(null);
    if (!loginEmail || !loginPass) {
      setMensaje({ tipo: "error", texto: "Rellena el email y la contraseña." });
      return;
    }
    setCargando(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPass,
    });
    setCargando(false);
    if (error) setMensaje({ tipo: "error", texto: "Email o contraseña incorrectos." });
  }

  async function registrar() {
    setMensaje(null);
    if (!regNombre || !regApellido || !regDne || !regCargo || !regEmail || !regPass) {
      setMensaje({ tipo: "error", texto: "Rellena todos los campos." });
      return;
    }
    if (regPass.length < 6) {
      setMensaje({ tipo: "error", texto: "La contraseña debe tener al menos 6 caracteres." });
      return;
    }
    setCargando(true);

    const { error } = await supabase.auth.signUp({
      email: regEmail,
      password: regPass,
      options: {
        data: {
          nombre: regNombre,
          apellido: regApellido,
          dne: regDne,
          cargo: regCargo,
        },
      },
    });

    setCargando(false);

    if (error) {
      setMensaje({ tipo: "error", texto: error.message });
      return;
    }

    setMensaje({
      tipo: "ok",
      texto: "¡Cuenta creada! Revisa tu correo para confirmar la dirección antes de entrar.",
    });
  }

  async function recuperar() {
    setMensaje(null);
    if (!recEmail) {
      setMensaje({ tipo: "error", texto: "Escribe tu correo electrónico." });
      return;
    }
    setCargando(true);
    const { error } = await supabase.auth.resetPasswordForEmail(recEmail);
    setCargando(false);
    if (error) {
      setMensaje({ tipo: "error", texto: error.message });
    } else {
      setMensaje({
        tipo: "ok",
        texto: "Si ese correo está registrado, te hemos enviado un enlace para restablecer tu contraseña.",
      });
    }
  }

  return (
    <div
      style={{ background: `linear-gradient(160deg, ${C.blueDarker}, ${C.blue})` }}
      className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden"
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          width: 520,
          height: 520,
          background: C.red,
          transform: "rotate(45deg)",
          top: -220,
          right: -220,
          opacity: 0.15,
          borderRadius: 24,
        }}
      />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto w-fit drop-shadow-lg">
            <LogoUnderground size={88} />
          </div>
          <h1 style={{ color: C.white }} className="text-2xl font-bold mt-4">
            Underground
          </h1>
          <p style={{ color: "#BFD9EE" }} className="text-sm mt-1">
            Espacio privado para trabajadores de Metro de Madrid
          </p>
        </div>

        <div style={{ background: C.white }} className="rounded-2xl shadow-2xl p-6">
          {modo !== "recuperar" && (
            <div className="flex mb-6 rounded-xl overflow-hidden border" style={{ borderColor: C.line }}>
              <button
                onClick={() => { setModo("login"); setMensaje(null); }}
                className="flex-1 py-2.5 text-sm font-semibold flex items-center justify-center gap-2"
                style={{ background: modo === "login" ? C.blue : C.white, color: modo === "login" ? C.white : C.mute }}
              >
                <LogIn size={16} /> Entrar
              </button>
              <button
                onClick={() => { setModo("registro"); setMensaje(null); }}
                className="flex-1 py-2.5 text-sm font-semibold flex items-center justify-center gap-2"
                style={{ background: modo === "registro" ? C.blue : C.white, color: modo === "registro" ? C.white : C.mute }}
              >
                <UserPlus size={16} /> Darse de alta
              </button>
            </div>
          )}

          {mensaje && (
            <p
              className="text-xs rounded-lg p-2.5 mb-4"
              style={{
                background: mensaje.tipo === "error" ? "#FCEBEA" : "#E7F7EE",
                color: mensaje.tipo === "error" ? C.red : "#15803D",
              }}
            >
              {mensaje.texto}
            </p>
          )}

          {modo === "login" && (
            <div className="space-y-4">
              <Campo label="Email" type="email" value={loginEmail} onChange={setLoginEmail} placeholder="tucorreo@ejemplo.com" />
              <CampoPass verPass={verPass} setVerPass={setVerPass} value={loginPass} onChange={setLoginPass} />
              <BotonPrincipal onClick={entrar} cargando={cargando}>Entrar</BotonPrincipal>
              <button onClick={() => { setModo("recuperar"); setMensaje(null); }} className="text-xs text-center w-full" style={{ color: C.blue }}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          {modo === "registro" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Campo label="Nombre" value={regNombre} onChange={setRegNombre} placeholder="Ej: Ana" />
                <Campo label="Apellido" value={regApellido} onChange={setRegApellido} placeholder="Ej: Ruiz" />
              </div>
              <Campo label="DNE (nº de trabajador)" value={regDne} onChange={setRegDne} placeholder="Ej: 004521" />
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: C.ink }}>
                  Puesto / categoría
                </label>
                <select
                  value={regCargo}
                  onChange={(e) => setRegCargo(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
                  style={{ borderColor: C.line, color: C.ink }}
                >
                  <option value="">Selecciona...</option>
                  <option>Jefe/a de Sector</option>
                  <option>Maquinista de Tracción Eléctrica</option>
                  <option>Mantenimiento (Vía / Instalaciones / Material Móvil)</option>
                  <option>Técnico/a administrativo</option>
                  <option>Técnico/a informático</option>
                  <option>Otro</option>
                </select>
              </div>
              <Campo label="Correo electrónico" type="email" value={regEmail} onChange={setRegEmail} placeholder="tucorreo@ejemplo.com" />
              <CampoPass verPass={verPass} setVerPass={setVerPass} value={regPass} onChange={setRegPass} />
              <p className="text-xs rounded-lg p-2.5 flex gap-2" style={{ background: "#EAF2F9", color: C.blueDark }}>
                <ShieldCheck size={24} className="shrink-0" />
                Tus datos solo los ve el equipo de administración — nunca se muestran en el foro.
              </p>
              <BotonPrincipal onClick={registrar} cargando={cargando}>Solicitar alta</BotonPrincipal>
            </div>
          )}

          {modo === "recuperar" && (
            <div className="space-y-4">
              <button onClick={() => { setModo("login"); setMensaje(null); }} className="text-xs flex items-center gap-1" style={{ color: C.blue }}>
                <ArrowLeft size={14} /> Volver
              </button>
              <p className="text-sm" style={{ color: C.ink }}>
                Escribe el correo con el que te diste de alta y te mandaremos un enlace para elegir una contraseña nueva.
              </p>
              <Campo label="Correo electrónico" type="email" value={recEmail} onChange={setRecEmail} placeholder="tucorreo@ejemplo.com" />
              <BotonPrincipal onClick={recuperar} cargando={cargando}>Enviar enlace de recuperación</BotonPrincipal>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const AMBITOS = [
  { id: "anden", nombre: "Estaciones" },
  { id: "conduccion", nombre: "Vías" },
  { id: "mantenimiento", nombre: "Mantenimiento" },
  { id: "oficinas", nombre: "Oficinas y técnicos" },
  { id: "cambios", nombre: "Cambios" },
  { id: "mercadillo", nombre: "Mercadillo" },
  { id: "sindicatos", nombre: "Sindicatos" },
  { id: "general", nombre: "General / Café" },
];

const LINEAS_METRO = [
  { id: "L1", nombre: "Línea 1" },
  { id: "L2", nombre: "Línea 2" },
  { id: "L3", nombre: "Línea 3" },
  { id: "L4", nombre: "Línea 4" },
  { id: "L5", nombre: "Línea 5" },
  { id: "L6", nombre: "Línea 6 (Circular)" },
  { id: "L7", nombre: "Línea 7" },
  { id: "L8", nombre: "Línea 8" },
  { id: "L9", nombre: "Línea 9" },
  { id: "L10", nombre: "Línea 10" },
  { id: "L11", nombre: "Línea 11" },
  { id: "L12", nombre: "Línea 12 (MetroSur)" },
  { id: "R", nombre: "Ramal" },
];

const INDICADORES_CALENDARIO = [
  { id: "libranza", nombre: "Libranza" },
  { id: "pap", nombre: "PAP remunerado" },
  { id: "pap_no_remunerado", nombre: "PAP no remunerado" },
  { id: "rj", nombre: "Reducción jornada" },
  { id: "baja", nombre: "Baja" },
  { id: "vacaciones", nombre: "Vacaciones" },
  { id: "trabajo_permuta", nombre: "Trabajo por permuta" },
  { id: "descanso_permuta", nombre: "Descanso por permuta" },
  { id: "compensa", nombre: "Compensa" },
  { id: "desplazamiento", nombre: "Desplazamiento" },
  { id: "horasExtra", nombre: "Horas extra" },
  { id: "reconocimientoMedico", nombre: "Reconoc. médico" },
];

function nombrePublico(p) {
  if (!p) return "";
  if (p.nickname) return p.nickname;
  if (p.mostrar_nombre_real) return `${p.nombre || ""} ${p.apellido || ""}`.trim();
  return "Socio";
}

function ClubProvisional({ sesion }) {
  const [perfil, setPerfil] = useState(null);
  const [hilos, setHilos] = useState([]);
  const [cargandoHilos, setCargandoHilos] = useState(true);
  const [formAbierto, setFormAbierto] = useState(false);
  const [vista, setVista] = useState("foro");

  useEffect(() => {
    cargarPerfil();
    cargarHilos();
  }, [sesion]);

  function cargarPerfil() {
    supabase
      .from("perfiles")
      .select("*")
      .eq("id", sesion.user.id)
      .single()
      .then(({ data }) => setPerfil(data));
  }

  function cargarHilos() {
    setCargandoHilos(true);
    supabase
      .from("hilos")
      .select("*, perfiles(nombre, apellido, nickname, mostrar_nombre_real)")
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

  return (
    <div style={{ background: "#F3F6F9" }} className="min-h-screen">
      <div style={{ background: C.blueDarker }} className="px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-white font-bold text-sm">Underground</p>
          {perfil && (
            <p className="text-xs" style={{ color: "#BFD9EE" }}>
              {nombrePublico(perfil)} · {perfil.cargo}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVista("perfil")}
            style={{ borderColor: "rgba(255,255,255,0.35)" }}
            className="text-white text-xs font-semibold border rounded-full px-3 py-1.5"
          >
            Mi perfil
          </button>
          <button
            onClick={() => supabase.auth.signOut()}
            style={{ borderColor: "rgba(255,255,255,0.35)" }}
            className="text-white text-xs font-semibold border rounded-full px-3 py-1.5"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <button
          onClick={() => setFormAbierto((v) => !v)}
          style={{ background: C.blue }}
          className="w-full text-white font-semibold py-2.5 rounded-lg text-sm"
        >
          {formAbierto ? "Cancelar" : "+ Crear nuevo tema"}
        </button>

        {formAbierto && <FormularioNuevoTema sesion={sesion} onCreado={() => { setFormAbierto(false); cargarHilos(); }} />}

        {cargandoHilos && <p className="text-sm text-center" style={{ color: C.mute }}>Cargando temas...</p>}

        {!cargandoHilos && hilos.length === 0 && (
          <p className="text-sm text-center py-8" style={{ color: C.mute }}>
            Todavía no hay ningún tema. ¡Sé el primero en publicar!
          </p>
        )}

        <div className="space-y-2">
          {hilos.map((h) => (
            <div key={h.id} style={{ background: C.white, borderColor: C.line }} className="rounded-xl border p-4">
              <p className="text-xs font-semibold" style={{ color: C.blue }}>
                {AMBITOS.find((a) => a.id === h.ambito)?.nombre || h.ambito}
              </p>
              <p className="text-sm font-semibold" style={{ color: C.ink }}>
                {h.titulo}
              </p>
              <p className="text-xs mt-1" style={{ color: C.mute }}>
                {nombrePublico(h.perfiles)} ·{" "}
                {new Date(h.creado_en).toLocaleString("es-ES")}
              </p>
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
              <Respuestas hiloId={h.id} sesion={sesion} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MiPerfil({ sesion, perfil, onVolver, onActualizado }) {
  const [nickname, setNickname] = useState("");
  const [cargo, setCargo] = useState("");
  const [intereses, setIntereses] = useState("");
  const [mostrarNombreReal, setMostrarNombreReal] = useState(false);
  const [mostrarDne, setMostrarDne] = useState(false);
  const [mostrarCargo, setMostrarCargo] = useState(true);
  const [mostrarIntereses, setMostrarIntereses] = useState(true);
  const [permiteSeguir, setPermiteSeguir] = useState(true);
  const [notificarComentarios, setNotificarComentarios] = useState(true);
  const [mostrarSeguidores, setMostrarSeguidores] = useState(true);
  const [mostrarPreview, setMostrarPreview] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [fotoUrl, setFotoUrl] = useState("");
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [lineaPreferente, setLineaPreferente] = useState("");
  const [indicadoresCalendario, setIndicadoresCalendario] = useState(INDICADORES_CALENDARIO.map((i) => i.id));

  useEffect(() => {
    if (!perfil) return;
    setNickname(perfil.nickname || "");
    setCargo(perfil.cargo || "");
    setIntereses(perfil.intereses || "");
    setMostrarNombreReal(!!perfil.mostrar_nombre_real);
    setMostrarDne(!!perfil.mostrar_dne);
    setMostrarCargo(perfil.mostrar_cargo !== false);
    setMostrarIntereses(perfil.mostrar_intereses !== false);
    setPermiteSeguir(perfil.permite_seguir !== false);
    setNotificarComentarios(perfil.notificar_comentarios !== false);
    setMostrarSeguidores(perfil.mostrar_seguidores !== false);
    setFotoUrl(perfil.foto_url || "");
    setLineaPreferente(perfil.linea_preferente || "");
    setIndicadoresCalendario(perfil.indicadores_calendario || INDICADORES_CALENDARIO.map((i) => i.id));
  }, [perfil]);

  function toggleIndicador(id) {
    setIndicadoresCalendario((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  async function guardar() {
    setMensaje(null);
    setCargando(true);
    const { data, error } = await supabase
      .from("perfiles")
      .update({
        nickname: nickname.trim() || null,
        cargo,
        intereses: intereses.trim(),
        mostrar_nombre_real: mostrarNombreReal,
        mostrar_dne: mostrarDne,
        mostrar_cargo: mostrarCargo,
        mostrar_intereses: mostrarIntereses,
        permite_seguir: permiteSeguir,
        notificar_comentarios: notificarComentarios,
        mostrar_seguidores: mostrarSeguidores,
        linea_preferente: lineaPreferente,
        indicadores_calendario: indicadoresCalendario,
      })
      .eq("id", sesion.user.id)
      .select()
      .single();
    setCargando(false);
    if (error) {
      setMensaje({ tipo: "error", texto: error.message });
      return;
    }
    setMensaje({ tipo: "ok", texto: "Perfil actualizado." });
    onActualizado(data);
  }

  async function subirFoto(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setMensaje(null);
    setSubiendoFoto(true);
    const ext = file.name.split(".").pop();
    const ruta = `${sesion.user.id}/avatar.${ext}`;
    const { error: errorSubida } = await supabase.storage
      .from("avatares")
      .upload(ruta, file, { upsert: true });
    if (errorSubida) {
      setSubiendoFoto(false);
      setMensaje({ tipo: "error", texto: errorSubida.message });
      return;
    }
    const { data } = supabase.storage.from("avatares").getPublicUrl(ruta);
    const urlConCache = data.publicUrl + "?t=" + Date.now();
    setFotoUrl(urlConCache);
    setSubiendoFoto(false);
    const { error: errorGuardado } = await supabase
      .from("perfiles")
      .update({ foto_url: data.publicUrl })
      .eq("id", sesion.user.id);
    if (errorGuardado) {
      setMensaje({ tipo: "error", texto: errorGuardado.message });
    }
  }

  if (!perfil) {
    return (
      <div style={{ background: "#F3F6F9" }} className="min-h-screen flex items-center justify-center">
        <p className="text-sm" style={{ color: C.mute }}>Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div style={{ background: "#F3F6F9" }} className="min-h-screen">
      <div style={{ background: C.blueDarker }} className="px-4 py-3 flex items-center gap-3">
        <button onClick={onVolver} className="text-white text-xs font-semibold flex items-center gap-1">
          <ArrowLeft size={14} /> Volver
        </button>
        <p className="text-white font-bold text-sm">Mi perfil</p>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <div style={{ background: C.white, borderColor: C.line }} className="rounded-xl border p-4 space-y-3">
          <div className="flex items-center gap-3 mb-1">
            <div className="relative shrink-0">
              {fotoUrl ? (
                <img
                  src={fotoUrl}
                  alt="Tu avatar"
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                <div
                  style={{ background: C.blue }}
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg"
                >
                  {(perfil.nickname || perfil.nombre || "?").slice(0, 1).toUpperCase()}
                </div>
              )}
              <label
                style={{ background: C.red, borderColor: C.white }}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer"
              >
                <input type="file" accept="image/*" onChange={subirFoto} className="hidden" />
                <span className="text-white text-xs leading-none">✎</span>
              </label>
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: C.ink }}>
                {perfil.nombre} {perfil.apellido}
              </p>
              <p className="text-xs" style={{ color: C.mute }}>DNE: {perfil.dne}</p>
            </div>
          </div>
          <p className="text-xs rounded-lg p-2.5" style={{ background: "#EAF2F9", color: C.blueDark }}>
            Tu nombre real y tu DNE solo los ve el equipo de administración, salvo que actives
            aquí que se muestren.
          </p>

          {mensaje && (
            <p
              className="text-xs rounded-lg p-2.5"
              style={{
                background: mensaje.tipo === "error" ? "#FCEBEA" : "#E7F7EE",
                color: mensaje.tipo === "error" ? C.red : "#15803D",
              }}
            >
              {mensaje.texto}
            </p>
          )}

          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: C.ink }}>
              Nick (como te verán los demás)
            </label>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Ej: SectorNorte84"
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
              style={{ borderColor: C.line, color: C.ink }}
            />
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: C.ink }}>
              Puesto / categoría
            </label>
            <select
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
              style={{ borderColor: C.line, color: C.ink }}
            >
              <option value="">Selecciona...</option>
              <option>Jefe/a de Sector</option>
              <option>Maquinista de Tracción Eléctrica</option>
              <option>Mantenimiento (Vía / Instalaciones / Material Móvil)</option>
              <option>Técnico/a administrativo</option>
              <option>Técnico/a informático</option>
              <option>Otro</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: C.ink }}>
              Sobre ti (opcional)
            </label>
            <textarea
              value={intereses}
              onChange={(e) => setIntereses(e.target.value)}
              rows={2}
              placeholder="Ej: aficionado al ciclismo, madrugador..."
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none resize-none"
              style={{ borderColor: C.line, color: C.ink }}
            />
          </div>
        </div>

        <div style={{ background: C.white, borderColor: C.line }} className="rounded-xl border p-4 space-y-1">
          <p className="text-xs font-semibold mb-2" style={{ color: C.ink }}>
            Qué ven los demás socios de ti
          </p>
          <CasillaPerfil label="Mostrar mi nombre real (en vez de solo el nick)" checked={mostrarNombreReal} onChange={setMostrarNombreReal} />
          <CasillaPerfil label="Mostrar mi DNE" checked={mostrarDne} onChange={setMostrarDne} />
          <CasillaPerfil label="Mostrar mi puesto / categoría" checked={mostrarCargo} onChange={setMostrarCargo} />
          <CasillaPerfil label="Mostrar lo que he escrito en 'Sobre ti'" checked={mostrarIntereses} onChange={setMostrarIntereses} />
          <CasillaPerfil label="Mostrar mi lista de seguidores" checked={mostrarSeguidores} onChange={setMostrarSeguidores} />
          <CasillaPerfil label="Permitir que otros socios me sigan" checked={permiteSeguir} onChange={setPermiteSeguir} />
          <CasillaPerfil label="Notificarme cuando respondan a mis temas" checked={notificarComentarios} onChange={setNotificarComentarios} />

        <div style={{ background: C.white, borderColor: C.line }} className="rounded-xl border p-4 space-y-3">
          <p className="text-xs font-semibold" style={{ color: C.ink }}>
            Preferencias del futuro calendario
          </p>
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: C.ink }}>
              Línea preferente
            </label>
            <select
              value={lineaPreferente}
              onChange={(e) => setLineaPreferente(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
              style={{ borderColor: C.line, color: C.ink }}
            >
              <option value="">Sin preferencia</option>
              {LINEAS_METRO.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: C.ink }}>
              Qué apartados quiero ver marcados
            </p>
            <div className="grid grid-cols-2 gap-x-3">
              {INDICADORES_CALENDARIO.map((ind) => (
                <CasillaPerfil
                  key={ind.id}
                  label={ind.nombre}
                  checked={indicadoresCalendario.includes(ind.id)}
                  onChange={() => toggleIndicador(ind.id)}
                />
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => setMostrarPreview((v) => !v)}
          style={{ borderColor: C.blue, color: C.blue }}
          className="w-full border-2 font-semibold py-2.5 rounded-lg text-sm bg-white"
        >
          {mostrarPreview ? "Ocultar" : "Ver mi tarjeta como la ven otros"}
        </button>

        {mostrarPreview && (
          <TarjetaSocioPreview
            perfilPreview={{
              nombre: perfil.nombre,
              apellido: perfil.apellido,
              dne: perfil.dne,
              nickname,
              cargo,
              intereses,
              foto_url: fotoUrl,
              mostrar_nombre_real: mostrarNombreReal,
              mostrar_dne: mostrarDne,
              mostrar_cargo: mostrarCargo,
              mostrar_intereses: mostrarIntereses,
            }}
          />
        )}
        </div>

        <BotonPrincipal onClick={guardar} cargando={cargando}>
          Guardar cambios
        </BotonPrincipal>
      </div>
    </div>
  );
}

function TarjetaSocioPreview({ perfilPreview }) {
  const p = perfilPreview;
  return (
    <div style={{ background: C.blueDarker }} className="rounded-xl p-4">
      <p className="text-xs font-semibold mb-3" style={{ color: "#BFD9EE" }}>
        Así te ven los demás socios:
      </p>
      <div style={{ background: C.white }} className="rounded-xl p-4">
        <div className="flex items-center gap-3">
          {p.foto_url ? (
            <img
              src={p.foto_url}
              alt="Avatar"
              className="w-12 h-12 rounded-full object-cover shrink-0"
            />
          ) : (
            <div
              style={{ background: C.blue }}
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
            >
              {(nombrePublico(p) || "?").slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold" style={{ color: C.ink }}>
              {nombrePublico(p)}
            </p>
            {p.mostrar_cargo && p.cargo && (
              <p className="text-xs" style={{ color: C.mute }}>
                {p.cargo}
              </p>
            )}
          </div>
        </div>
        {p.mostrar_dne && p.dne && (
          <p className="text-xs mt-2" style={{ color: C.mute }}>
            DNE: {p.dne}
          </p>
        )}
        {p.mostrar_intereses && p.intereses && (
          <p className="text-sm mt-2" style={{ color: C.ink }}>
            {p.intereses}
          </p>
        )}
      </div>
    </div>
  );
}

function CasillaPerfil({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm py-1.5" style={{ color: C.ink }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4"
      />
      {label}
    </label>
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

function Respuestas({ hiloId, sesion }) {
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
      .select("*, perfiles(nombre, apellido, nickname, mostrar_nombre_real)")
      .eq("hilo_id", hiloId)
      .order("creado_en", { ascending: true })
      .then(({ data, error }) => {
        if (!error) setRespuestas(data || []);
        setCargando(false);
      });
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
              {nombrePublico(r.perfiles)}{" "}
              <span className="font-normal" style={{ color: C.mute }}>
                · {new Date(r.creado_en).toLocaleString("es-ES")}
              </span>
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
      <Icon size={17} style={{ color: activo ? color : C.mute }} strokeWidth={activo ? 2.5 : 2} />
      <span className="text-xs font-semibold" style={{ color: activo ? color : C.mute }}>
        {cantidad}
      </span>
    </button>
  );
}

function Campo({ label, value, onChange, placeholder, type }) {
  return (
    <div>
      <label className="text-xs font-semibold block mb-1" style={{ color: C.ink }}>
        {label}
      </label>
      <input
        type={type || "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
        style={{ borderColor: C.line, color: C.ink }}
      />
    </div>
  );
}

function CampoPass({ verPass, setVerPass, value, onChange }) {
  return (
    <div>
      <label className="text-xs font-semibold block mb-1" style={{ color: C.ink }}>
        Contraseña
      </label>
      <div className="relative">
        <input
          type={verPass ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none pr-10"
          style={{ borderColor: C.line, color: C.ink }}
        />
        <button type="button" onClick={() => setVerPass(!verPass)} className="absolute right-3 top-2.5" style={{ color: C.mute }}>
          {verPass ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

function BotonPrincipal({ onClick, children, cargando }) {
  return (
    <button
      onClick={onClick}
      disabled={cargando}
      style={{ background: cargando ? "#B9C6D2" : C.red }}
      className="w-full text-white font-bold py-3 rounded-xl text-sm"
    >
      {cargando ? "Un momento..." : children}
    </button>
  );
}
