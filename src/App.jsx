import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { LogIn, UserPlus, Eye, EyeOff, ArrowLeft, ShieldCheck, ThumbsUp, Meh, Angry, Users, TrainFront, Wrench, Monitor, Repeat, ShoppingBag, Handshake, MessageSquare, ChevronRight, ChevronLeft, X, Ban, Contact, Settings, Plus, Calendar } from "lucide-react";

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
  { id: "anden", nombre: "Estaciones", icon: Users },
  { id: "conduccion", nombre: "Vías", icon: TrainFront },
  { id: "mantenimiento", nombre: "Mantenimiento", icon: Wrench },
  { id: "oficinas", nombre: "Oficinas y técnicos", icon: Monitor },
  { id: "cambios", nombre: "Cambios", icon: Repeat },
  { id: "mercadillo", nombre: "Mercadillo", icon: ShoppingBag },
  { id: "sindicatos", nombre: "Sindicatos", icon: Handshake },
  { id: "general", nombre: "General / Café", icon: MessageSquare },
];

const LINEAS_METRO_ESTACIONES = {
  L1: { nombre: "Línea 1", estaciones: ["Pinar de Chamartín", "Bambú", "Chamartín", "Plaza de Castilla", "Valdeacederas", "Tetuán", "Estrecho", "Alvarado", "Cuatro Caminos", "Ríos Rosas", "Iglesia", "Bilbao", "Tribunal", "Gran Vía", "Sol", "Tirso de Molina", "Antón Martín", "Estación del Arte", "Atocha Renfe", "Menéndez Pelayo", "Pacífico", "Puente de Vallecas", "Nueva Numancia", "Portazgo", "Buenos Aires", "Alto del Arenal", "Miguel Hernández", "Sierra de Guadalupe", "Villa de Vallecas", "Congosto", "La Gavia", "Las Suertes", "Valdecarros"] },
  L2: { nombre: "Línea 2", estaciones: ["Las Rosas", "Avenida de Guadalajara", "Alsacia", "La Almudena", "La Elipa", "Ventas", "Manuel Becerra", "Goya", "Príncipe de Vergara", "Retiro", "Banco de España", "Sevilla", "Sol", "Ópera", "Santo Domingo", "Noviciado", "San Bernardo", "Quevedo", "Canal", "Cuatro Caminos"] },
  L3: { nombre: "Línea 3", estaciones: ["Moncloa", "Argüelles", "Ventura Rodríguez", "Plaza de España", "Callao", "Sol", "Lavapiés", "Embajadores", "Palos de la Frontera", "Delicias", "Legazpi", "Almendrales", "Hospital 12 de Octubre", "San Fermín-Orcasur", "Ciudad de los Ángeles", "Villaverde Bajo-Cruce", "San Cristóbal", "Villaverde Alto", "El Casar"] },
  L4: { nombre: "Línea 4", estaciones: ["Argüelles", "San Bernardo", "Bilbao", "Alonso Martínez", "Colón", "Serrano", "Velázquez", "Goya", "Lista", "Diego de León", "Avenida de América", "Prosperidad", "Alfonso XIII", "Avenida de la Paz", "Arturo Soria", "Esperanza", "Canillas", "Mar de Cristal", "San Lorenzo", "Parque de Santa María", "Hortaleza", "Manoteras", "Pinar de Chamartín"] },
  L5: { nombre: "Línea 5", estaciones: ["Alameda de Osuna", "El Capricho", "Canillejas", "Torre Arias", "Suanzes", "Ciudad Lineal", "Pueblo Nuevo", "Quintana", "El Carmen", "Ventas", "Diego de León", "Núñez de Balboa", "Rubén Darío", "Alonso Martínez", "Chueca", "Gran Vía", "Callao", "Ópera", "La Latina", "Puerta de Toledo", "Acacias", "Pirámides", "Marqués de Vadillo", "Urgel", "Oporto", "Vista Alegre", "Carabanchel", "Eugenia de Montijo", "Aluche", "Empalme", "Campamento", "Casa de Campo"] },
  L6: { nombre: "Línea 6 (Circular)", estaciones: ["Laguna", "Carpetana", "Oporto", "Opañel", "Plaza Elíptica", "Usera", "Legazpi", "Arganzuela-Planetario", "Méndez Álvaro", "Pacífico", "Conde de Casal", "Sainz de Baranda", "O'Donnell", "Manuel Becerra", "Diego de León", "Avenida de América", "República Argentina", "Nuevos Ministerios", "Cuatro Caminos", "Guzmán el Bueno", "Metropolitano", "Ciudad Universitaria", "Moncloa", "Argüelles", "Príncipe Pío", "Puerta del Ángel", "Alto de Extremadura", "Lucero"] },
  L7: { nombre: "Línea 7", estaciones: ["Hospital del Henares", "Henares", "Jarama", "San Fernando", "La Rambla", "Coslada Central", "Barrio del Puerto", "Estadio Metropolitano", "Las Musas", "San Blas", "Simancas", "García Noblejas", "Ascao", "Pueblo Nuevo", "Barrio de la Concepción", "Parque de las Avenidas", "Cartagena", "Avenida de América", "Gregorio Marañón", "Alonso Cano", "Canal", "Islas Filipinas", "Guzmán el Bueno", "Francos Rodríguez", "Valdezarza", "Antonio Machado", "Peñagrande", "Avenida de la Ilustración", "Lacoma", "Pitis"] },
  L8: { nombre: "Línea 8", estaciones: ["Nuevos Ministerios", "Colombia", "Pinar del Rey", "Mar de Cristal", "Campo de las Naciones", "Aeropuerto T1-T2-T3", "Barajas", "Aeropuerto T4"] },
  L9: { nombre: "Línea 9", estaciones: ["Paco de Lucía", "Mirasierra", "Herrera Oria", "Barrio del Pilar", "Ventilla", "Plaza de Castilla", "Duque de Pastrana", "Pío XII", "Colombia", "Concha Espina", "Cruz del Rayo", "Avenida de América", "Núñez de Balboa", "Príncipe de Vergara", "Ibiza", "Sainz de Baranda", "Estrella", "Vinateros", "Artilleros", "Pavones", "Valdebernardo", "Vicálvaro", "San Cipriano", "Puerta de Arganda", "Rivas Urbanizaciones", "Rivas Futura", "Rivas Vaciamadrid", "La Poveda", "Arganda del Rey"] },
  L10: { nombre: "Línea 10", estaciones: ["Hospital Infanta Sofía", "Reyes Católicos", "Baunatal", "Manuel de Falla", "Marqués de la Valdavia", "La Moraleja", "La Granja", "Ronda de la Comunicación", "Las Tablas", "Montecarmelo", "Tres Olivos", "Fuencarral", "Begoña", "Chamartín", "Plaza de Castilla", "Cuzco", "Santiago Bernabéu", "Nuevos Ministerios", "Gregorio Marañón", "Alonso Martínez", "Tribunal", "Plaza de España", "Príncipe Pío", "Lago", "Batán", "Casa de Campo", "Colonia Jardín", "Aviación Española", "Cuatro Vientos", "Joaquín Vilumbrales", "Puerta del Sur"] },
  L11: { nombre: "Línea 11", estaciones: ["Plaza Elíptica", "Abrantes", "Pan Bendito", "San Francisco", "Carabanchel Alto", "La Peseta", "La Fortuna"] },
  L12: { nombre: "Línea 12 (MetroSur)", estaciones: ["Puerta del Sur", "Parque Lisboa", "Alcorcón Central", "Parque Oeste", "Universidad Rey Juan Carlos", "Móstoles Central", "Pradillo", "Hospital de Móstoles", "Manuela Malasaña", "Loranca", "Hospital de Fuenlabrada", "Parque Europa", "Fuenlabrada Central", "Parque de los Estados", "Arroyo Culebro", "Conservatorio", "Alonso de Mendoza", "Getafe Central", "Juan de la Cierva", "El Casar", "Los Espartales", "El Bercial", "El Carrascal", "Julián Besteiro", "Casa del Reloj", "Hospital Severo Ochoa", "Leganés Central", "San Nicasio", "Puerta del Sur"] },
  R: { nombre: "Ramal", estaciones: ["Ópera", "Príncipe Pío"] },
};

const TURNOS = {
  sector: [
    { id: "M", nombre: "M" },
    { id: "T", nombre: "T" },
    { id: "S", nombre: "S" },
    { id: "P", nombre: "P" },
  ],
  maquinista: [
    { id: "M0530", nombre: "M0530" },
    { id: "M0550", nombre: "M0550" },
    { id: "M0600", nombre: "M0600" },
    { id: "M0615", nombre: "M0615" },
    { id: "M0630", nombre: "M0630" },
    { id: "M0645", nombre: "M0645" },
    { id: "M0700", nombre: "M0700" },
    { id: "M0715", nombre: "M0715" },
    { id: "P0730", nombre: "P0730" },
    { id: "T1245", nombre: "T1245" },
    { id: "T1300", nombre: "T1300" },
    { id: "T1315", nombre: "T1315" },
    { id: "T1320", nombre: "T1320" },
    { id: "T1330", nombre: "T1330" },
    { id: "T1345", nombre: "T1345" },
    { id: "T1400", nombre: "T1400" },
    { id: "T1415", nombre: "T1415" },
    { id: "T1430", nombre: "T1430" },
    { id: "T1500", nombre: "T1500" },
    { id: "T1530", nombre: "T1530" },
    { id: "T1600", nombre: "T1600" },
    { id: "S1700", nombre: "S1700" },
    { id: "S1730", nombre: "S1730" },
    { id: "S1745", nombre: "S1745" },
    { id: "S1830", nombre: "S1830" },
    { id: "S1845", nombre: "S1845" },
    { id: "N2230", nombre: "N2230" },
    { id: "D0600", nombre: "D0600" },
    { id: "D0630", nombre: "D0630" },
    { id: "RVA", nombre: "RVA" },
  ],
};

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
  const [ambitoActivo, setAmbitoActivo] = useState("todos");
  const [cambiosCategoria, setCambiosCategoria] = useState("");
  const [cambiosTipo, setCambiosTipo] = useState("");
  const [modalCambioAbierto, setModalCambioAbierto] = useState(false);

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
            onClick={() => setVista("calendario")}
            style={{ borderColor: "rgba(255,255,255,0.35)" }}
            className="text-white text-xs font-semibold border rounded-full px-3 py-1.5 flex items-center gap-1"
          >
            <Calendar size={13} />
            Calendario
          </button>
          {perfil && (perfil.rol === "admin" || perfil.rol === "dev") && (
            <button
              onClick={() => setVista("admin")}
              style={{ borderColor: "rgba(255,255,255,0.35)" }}
              className="text-white text-xs font-semibold border rounded-full px-3 py-1.5 flex items-center gap-1"
            >
              <Settings size={13} />
              Panel admin
            </button>
          )}
          <button
            onClick={() => supabase.auth.signOut()}
            style={{ borderColor: "rgba(255,255,255,0.35)" }}
            className="text-white text-xs font-semibold border rounded-full px-3 py-1.5"
          >
            Cerrar sesión
          </button>
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
                nombre={a.nombre}
              />
            )
          )}
        </aside>

        <div className="flex-1 min-w-0 space-y-4">
        <button
          onClick={() => setFormAbierto((v) => !v)}
          style={{ background: C.blue }}
          className="w-full text-white font-semibold py-2.5 rounded-lg text-sm"
        >
          {formAbierto ? "Cancelar" : "+ Crear nuevo tema"}
        </button>

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

        <div className="space-y-2">
          {hilos.filter((h) => ambitoActivo === "todos" || h.ambito === ambitoActivo).map((h) => (
            <div key={h.id} style={{ background: C.white, borderColor: C.line }} className="rounded-xl border p-4">
              <p className="text-xs font-semibold flex items-center gap-1" style={{ color: C.blue }}>
                {(() => {
                  const ambInfo = AMBITOS.find((a) => a.id === h.ambito);
                  const IconoAmb = ambInfo ? ambInfo.icon : MessageSquare;
                  return (
                    <>
                      <IconoAmb size={13} />
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

function BotonAmbito({ activo, onClick, icon: Icon = MessageSquare, nombre }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5"
      style={{ background: activo ? "#EAF2F9" : "transparent" }}
    >
      <Icon size={17} className="shrink-0" style={{ color: activo ? C.blue : C.mute }} />
      <p className="text-sm font-semibold truncate" style={{ color: activo ? C.blueDark : C.ink }}>
        {nombre}
      </p>
    </button>
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

  const nombreCategoria = categoria === "sector" ? "Jefe/a de Sector" : "Maquinista";
  const nombreCategoriaCorta = categoria === "sector" ? "J.Sector" : "Maquinista";
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
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto">
          {esServicio && (
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: C.ink }}>
              Día del cambio
            </label>
            <input
              type="date"
              min={minStr}
              value={diaOfrecido}
              onChange={(e) => elegirDiaOfrecido(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
              style={{ borderColor: C.line, color: C.ink }}
            />
          </div>
          )}

          {esDiaLibre && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: C.ink }}>
                  Día que quieres/necesitas librar
                </label>
                <input
                  type="date"
                  min={minStr}
                  value={diaLibreQuiero}
                  onChange={(e) => setDiaLibreQuiero(e.target.value < minStr ? minStr : e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                  style={{ borderColor: C.line, color: C.ink }}
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: C.ink }}>
                  Día(s) que ofreces a cambio
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    min={minStr}
                    value={nuevoDiaOfrecido}
                    onChange={(e) => setNuevoDiaOfrecido(e.target.value < minStr ? minStr : e.target.value)}
                    className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none"
                    style={{ borderColor: C.line, color: C.ink }}
                  />
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
                          <X size={12} />
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
                  <input
                    type="date"
                    min={minStr}
                    value={vacTengoInicio}
                    onChange={(e) => setVacTengoInicio(e.target.value < minStr ? minStr : e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                    style={{ borderColor: C.line, color: C.ink }}
                  />
                  <input
                    type="date"
                    min={vacTengoInicio || minStr}
                    value={vacTengoFin}
                    onChange={(e) => setVacTengoFin(e.target.value < minStr ? minStr : e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                    style={{ borderColor: C.line, color: C.ink }}
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold mb-1.5" style={{ color: C.ink }}>
                  Periodo que quieres
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    min={minStr}
                    value={vacQuieroInicio}
                    onChange={(e) => setVacQuieroInicio(e.target.value < minStr ? minStr : e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                    style={{ borderColor: C.line, color: C.ink }}
                  />
                  <input
                    type="date"
                    min={vacQuieroInicio || minStr}
                    value={vacQuieroFin}
                    onChange={(e) => setVacQuieroFin(e.target.value < minStr ? minStr : e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                    style={{ borderColor: C.line, color: C.ink }}
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
                      className="w-4 h-4"
                    />
                    {l.nombre}
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
  const [abierto, setAbierto] = useState(false);
  const [accion, setAccion] = useState("");

  const CATEGORIAS = [
    { id: "sector", nombre: "Jefe/a de Sector" },
    { id: "maquinista", nombre: "Maquinista" },
  ];
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
        <Repeat size={17} className="shrink-0" style={{ color: activo ? C.blue : C.mute }} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate" style={{ color: activo ? C.blueDark : C.ink }}>
            Cambios
          </p>
        </div>
        <ChevronRight
          size={13}
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

function PanelAdmin({ sesion, perfil, onVolver }) {
  const [tab, setTab] = useState("usuarios");
  const [usuarios, setUsuarios] = useState([]);
  const [reportes, setReportes] = useState([]);
  const [solicitudesBaneo, setSolicitudesBaneo] = useState([]);
  const [baneadosIds, setBaneadosIds] = useState(new Set());
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState(null);
  const [baneandoId, setBaneandoId] = useState(null);
  const [motivoBaneo, setMotivoBaneo] = useState("");

  const esDev = perfil?.rol === "dev";

  useEffect(() => {
    cargarTodo();
  }, []);

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

  const TABS = [
    { id: "usuarios", nombre: "Usuarios", icon: Contact, badge: 0 },
    { id: "reportes", nombre: "Reportes", icon: ShieldCheck, badge: reportes.length },
    { id: "baneos", nombre: "Peticiones de baneo", icon: Ban, badge: solicitudesBaneo.length },
  ];

  return (
    <div style={{ background: C.bg }} className="min-h-screen">
      <div style={{ background: C.blueDarker }} className="px-4 py-3 flex items-center gap-3">
        <button onClick={onVolver} className="text-white text-xs font-semibold flex items-center gap-1">
          <ArrowLeft size={14} /> Volver
        </button>
        <p className="text-white font-bold text-sm">Panel de administración</p>
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
                <Icono size={17} style={{ color: activo ? C.blue : C.mute }} />
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
                      {baneadosIds.has(u.id) && (
                        <span className="text-xs font-bold" style={{ color: C.red }}>
                          (baneado)
                        </span>
                      )}
                    </p>
                    <p className="text-xs" style={{ color: C.mute }}>
                      DNE: {u.dne} · {u.cargo}
                    </p>
                  </div>
                  {esDev ? (
                    <select
                      value={u.rol || "socio"}
                      onChange={(e) => cambiarRol(u.id, e.target.value)}
                      className="rounded-lg border px-2 py-1.5 text-xs outline-none"
                      style={{ borderColor: C.line, color: C.ink }}
                    >
                      <option value="socio">Socio</option>
                      <option value="admin">Admin</option>
                      <option value="dev">Dev</option>
                    </select>
                  ) : (
                    <span className="text-xs font-semibold" style={{ color: C.mute }}>
                      {u.rol || "socio"}
                    </span>
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

          {!cargando && tab === "baneos" && (
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
        </div>
      )}
    </div>
  );
}

function VistaCalendario({ sesion, perfil, onVolver }) {
  const hoy = new Date();
  const [mesVisto, setMesVisto] = useState(hoy.getMonth());
  const [anoVisto, setAnoVisto] = useState(hoy.getFullYear());
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [registros, setRegistros] = useState({});
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarRegistros();
  }, [anoVisto]);

  function cargarRegistros() {
    setCargando(true);
    supabase
      .from("registros_calendario")
      .select("*")
      .eq("usuario_id", sesion.user.id)
      .gte("fecha", `${anoVisto}-01-01`)
      .lte("fecha", `${anoVisto}-12-31`)
      .then(({ data, error }) => {
        if (!error) {
          const porFecha = {};
          (data || []).forEach((r) => {
            porFecha[r.fecha] = r;
          });
          setRegistros(porFecha);
        }
        setCargando(false);
      });
  }

  async function guardarRegistroDia(fecha, cambios) {
    await supabase
      .from("registros_calendario")
      .upsert({ usuario_id: sesion.user.id, fecha, ...cambios }, { onConflict: "usuario_id,fecha" });
    cargarRegistros();
  }

  const indicadoresVisibles = {};
  (perfil?.indicadores_calendario || []).forEach((id) => {
    indicadoresVisibles[id] = true;
  });
  INDICADORES_CALENDARIO.forEach((ind) => {
    if (indicadoresVisibles[ind.id] === undefined) indicadoresVisibles[ind.id] = false;
  });

  const categoriaTurnos = (perfil?.cargo || "").toLowerCase().includes("maquinista") ? "maquinista" : "sector";

  return (
    <div style={{ background: "#F3F6F9" }} className="min-h-screen">
      <div style={{ background: C.blueDarker }} className="px-4 py-3 flex items-center gap-3">
        <button onClick={onVolver} className="text-white text-xs font-semibold flex items-center gap-1">
          <ArrowLeft size={14} /> Volver
        </button>
        <p className="text-white font-bold text-sm">Calendario de turnos</p>
      </div>
      <div className="max-w-2xl mx-auto p-4">
        {cargando ? (
          <p className="text-sm" style={{ color: C.mute }}>
            Cargando...
          </p>
        ) : (
          <CalendarioTurnos
            mesVisto={mesVisto}
            anoVisto={anoVisto}
            setMesVisto={setMesVisto}
            setAnoVisto={setAnoVisto}
            registros={registros}
            diaSeleccionado={diaSeleccionado}
            setDiaSeleccionado={setDiaSeleccionado}
            onGuardar={guardarRegistroDia}
            categoriaTurnos={categoriaTurnos}
            indicadoresVisibles={indicadoresVisibles}
          />
        )}
      </div>
    </div>
  );
}

function CalendarioTurnos({
  mesVisto,
  anoVisto,
  setMesVisto,
  setAnoVisto,
  registros,
  diaSeleccionado,
  setDiaSeleccionado,
  onGuardar,
  categoriaTurnos,
  indicadoresVisibles,
}) {
  const NOMBRES_MES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];
  const DIAS_SEMANA = ["L", "M", "X", "J", "V", "S", "D"];
  const IV = indicadoresVisibles || {};
  const visible = (id) => IV[id] !== false;

  function idDia(dia) {
    const mm = String(mesVisto + 1).padStart(2, "0");
    const dd = String(dia).padStart(2, "0");
    return `${anoVisto}-${mm}-${dd}`;
  }

  const primerDiaSemana = (new Date(anoVisto, mesVisto, 1).getDay() + 6) % 7;
  const diasEnMes = new Date(anoVisto, mesVisto + 1, 0).getDate();
  const celdas = [...Array(primerDiaSemana).fill(null), ...Array.from({ length: diasEnMes }, (_, i) => i + 1)];

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
    setDiaSeleccionado(null);
  }

  function estadoEfectivo(fecha, r) {
    if (r?.estado) return r.estado;
    for (const otro of Object.values(registros)) {
      if (
        otro.estado === "baja" &&
        otro.baja_inicio &&
        fecha >= otro.baja_inicio &&
        (otro.baja_abierta || !otro.baja_fin || fecha <= otro.baja_fin)
      ) {
        return "baja";
      }
      if (
        otro.estado === "vacaciones" &&
        otro.vacaciones_inicio &&
        otro.vacaciones_fin &&
        fecha >= otro.vacaciones_inicio &&
        fecha <= otro.vacaciones_fin
      ) {
        return "vacaciones";
      }
    }
    return "";
  }

  const hoyStr = (() => {
    const h = new Date();
    return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, "0")}-${String(h.getDate()).padStart(2, "0")}`;
  })();

  const ESTADOS = {
    libranza: "#3B82F6",
    pap: "#E30613",
    pap_no_remunerado: "#0D9488",
    rj: "#F472B6",
    baja: "#8B5CF6",
    vacaciones: "#22C55E",
    trabajo_permuta: "#F97316",
    descanso_permuta: "#7DD3FC",
    compensa: "#6366F1",
  };

  function colorFondoDia(fecha, estado, tieneTurnoRegistrado) {
    if (estado && ESTADOS[estado]) return ESTADOS[estado];
    if (tieneTurnoRegistrado) return "#AEB8C4";
    return fecha < hoyStr ? "#D9DEE3" : C.white;
  }

  const ABREV_ESTADO = {
    libranza: "L", pap: "PR", pap_no_remunerado: "PN", rj: "RJ", baja: "B",
    vacaciones: "V", trabajo_permuta: "TP", descanso_permuta: "DP", compensa: "CP",
  };

  return (
    <div className="space-y-4">
      <div style={{ background: C.white, borderColor: C.line }} className="rounded-xl border p-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => cambiarMes(-1)} style={{ color: C.blueDark }} className="p-1.5">
            <ChevronLeft size={18} />
          </button>
          <p className="text-sm font-bold" style={{ color: C.ink }}>
            {NOMBRES_MES[mesVisto]} {anoVisto}
          </p>
          <button onClick={() => cambiarMes(1)} style={{ color: C.blueDark }} className="p-1.5">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {DIAS_SEMANA.map((d) => (
            <span key={d} className="text-xs font-bold" style={{ color: C.mute }}>
              {d}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {celdas.map((dia, i) => {
            if (!dia) return <div key={i} />;
            const fecha = idDia(dia);
            const r = registros[fecha];
            const seleccionado = diaSeleccionado === fecha;
            const estadoDia = estadoEfectivo(fecha, r);
            const fondo = colorFondoDia(fecha, estadoDia, !!r?.turno);
            const textoOscuroSobreClaro = !estadoDia;
            return (
              <button
                key={i}
                onClick={() => setDiaSeleccionado(fecha)}
                className="aspect-square rounded-lg flex flex-col items-center justify-center text-xs relative border"
                style={{
                  background: seleccionado ? C.blue : fondo,
                  borderColor: seleccionado ? C.blue : C.line,
                  color: seleccionado ? C.white : textoOscuroSobreClaro ? C.ink : C.white,
                  fontWeight: seleccionado ? 700 : 500,
                }}
              >
                {dia}
                {r?.turno && !estadoDia && (
                  <span style={{ fontSize: 12, fontWeight: 800, color: seleccionado ? C.white : C.blueDark }}>
                    {r.turno}
                  </span>
                )}
                {estadoDia && ABREV_ESTADO[estadoDia] && (
                  <span style={{ fontSize: 12, fontWeight: 800, color: seleccionado ? C.white : "rgba(255,255,255,0.9)" }}>
                    {ABREV_ESTADO[estadoDia]}
                  </span>
                )}
                {visible("reconocimientoMedico") && r?.reconocimiento_medico && (
                  <span
                    style={{ background: C.white, borderColor: "#B91C1C" }}
                    className="absolute bottom-0.5 left-0.5 w-3.5 h-3.5 rounded-sm border flex items-center justify-center"
                  >
                    <Plus size={9} strokeWidth={3.5} style={{ color: "#B91C1C" }} />
                  </span>
                )}
                {visible("desplazamiento") && r?.desplazamiento && (
                  <span
                    aria-label="Desplazamiento ese día"
                    style={{
                      position: "absolute", top: 0, right: 0, width: 0, height: 0,
                      borderStyle: "solid", borderWidth: "0 14px 14px 0",
                      borderColor: "transparent #B91C1C transparent transparent",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 mt-4 pt-3 border-t" style={{ borderColor: C.line }}>
          <LeyendaCalendario color={C.white} borde={C.line} texto="Por trabajar" />
          <LeyendaCalendario color="#D9DEE3" texto="Sin registros" />
          <LeyendaCalendario color="#AEB8C4" texto="Trabajado" />
          {visible("libranza") && <LeyendaCalendario color={ESTADOS.libranza} texto="Libranza" />}
          {visible("pap") && <LeyendaCalendario color={ESTADOS.pap} texto="PAP remunerado" />}
          {visible("pap_no_remunerado") && <LeyendaCalendario color={ESTADOS.pap_no_remunerado} texto="PAP no remunerado" />}
          {visible("rj") && <LeyendaCalendario color={ESTADOS.rj} texto="Reducción de jornada" />}
          {visible("baja") && <LeyendaCalendario color={ESTADOS.baja} texto="Baja" />}
          {visible("vacaciones") && <LeyendaCalendario color={ESTADOS.vacaciones} texto="Vacaciones" />}
          {visible("trabajo_permuta") && <LeyendaCalendario color={ESTADOS.trabajo_permuta} texto="Trabajo por permuta" />}
          {visible("descanso_permuta") && <LeyendaCalendario color={ESTADOS.descanso_permuta} texto="Descanso por permuta" />}
          {visible("compensa") && <LeyendaCalendario color={ESTADOS.compensa} texto="Compensa" />}
        </div>
      </div>

      {diaSeleccionado && (
        <EditorDia
          fecha={diaSeleccionado}
          registro={registros[diaSeleccionado]}
          categoriaTurnos={categoriaTurnos}
          indicadoresVisibles={IV}
          onGuardar={onGuardar}
          onCerrar={() => setDiaSeleccionado(null)}
        />
      )}
    </div>
  );
}

function LeyendaCalendario({ color, borde, texto }) {
  return (
    <div className="flex items-center gap-2">
      <span
        style={{ background: color, borderColor: borde || color }}
        className="w-4 h-4 rounded shrink-0 border"
      />
      <span className="text-xs" style={{ color: C.ink }}>
        {texto}
      </span>
    </div>
  );
}

function EditorDia({ fecha, registro, categoriaTurnos, indicadoresVisibles, onGuardar, onCerrar }) {
  const turnosDisponibles = TURNOS[categoriaTurnos] || [];
  const [estado, setEstado] = useState(registro?.estado || "");
  const [turno, setTurno] = useState(registro?.turno || "");
  const [desplazamiento, setDesplazamiento] = useState(!!registro?.desplazamiento);
  const [horasExtra, setHorasExtra] = useState(!!registro?.horas_extra);
  const [reconocimientoMedico, setReconocimientoMedico] = useState(!!registro?.reconocimiento_medico);
  const [notas, setNotas] = useState(registro?.notas || "");
  const [bajaInicio, setBajaInicio] = useState(registro?.baja_inicio || "");
  const [bajaFin, setBajaFin] = useState(registro?.baja_fin || "");
  const [bajaAbierta, setBajaAbierta] = useState(!!registro?.baja_abierta);
  const [vacacionesInicio, setVacacionesInicio] = useState(registro?.vacaciones_inicio || "");
  const [vacacionesFin, setVacacionesFin] = useState(registro?.vacaciones_fin || "");

  const visible = (id) => indicadoresVisibles[id] !== false;

  function guardar() {
    onGuardar(fecha, {
      estado: estado || null,
      turno: turno || null,
      desplazamiento,
      horas_extra: horasExtra,
      reconocimiento_medico: reconocimientoMedico,
      notas: notas.trim() || null,
      baja_inicio: estado === "baja" ? bajaInicio || null : null,
      baja_fin: estado === "baja" && !bajaAbierta ? bajaFin || null : null,
      baja_abierta: estado === "baja" ? bajaAbierta : false,
      vacaciones_inicio: estado === "vacaciones" ? vacacionesInicio || null : null,
      vacaciones_fin: estado === "vacaciones" ? vacacionesFin || null : null,
    });
    onCerrar();
  }

  function borrar() {
    onGuardar(fecha, {
      estado: null, turno: null, desplazamiento: false, horas_extra: false, reconocimiento_medico: false,
      notas: null, baja_inicio: null, baja_fin: null, baja_abierta: false,
      vacaciones_inicio: null, vacaciones_fin: null,
    });
    onCerrar();
  }

  return (
    <div style={{ background: C.white, borderColor: C.line }} className="rounded-xl border p-4 space-y-3">
      <p className="text-sm font-bold" style={{ color: C.ink }}>
        {fecha}
      </p>
      <div>
        <label className="text-xs font-semibold block mb-1" style={{ color: C.ink }}>
          Estado del día
        </label>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
          style={{ borderColor: C.line, color: C.ink }}
        >
          <option value="">Trabajado / normal</option>
          {INDICADORES_CALENDARIO.filter(
            (ind) => visible(ind.id) && ind.id !== "desplazamiento" && ind.id !== "horasExtra" && ind.id !== "reconocimientoMedico"
          ).map((ind) => (
            <option key={ind.id} value={ind.id}>
              {ind.nombre}
            </option>
          ))}
        </select>
      </div>

      {!estado && (
        <div>
          <label className="text-xs font-semibold block mb-1" style={{ color: C.ink }}>
            Turno (opcional)
          </label>
          <select
            value={turno}
            onChange={(e) => setTurno(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
            style={{ borderColor: C.line, color: C.ink }}
          >
            <option value="">Sin especificar</option>
            {turnosDisponibles.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      {estado === "baja" && (
        <div className="space-y-2">
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: C.ink }}>
              Desde
            </label>
            <input
              type="date"
              value={bajaInicio}
              onChange={(e) => setBajaInicio(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
              style={{ borderColor: C.line, color: C.ink }}
            />
          </div>
          <label className="flex items-center gap-2 text-sm" style={{ color: C.ink }}>
            <input type="checkbox" checked={bajaAbierta} onChange={(e) => setBajaAbierta(e.target.checked)} className="w-4 h-4" />
            Sigo de baja (sin fecha de fin)
          </label>
          {!bajaAbierta && (
            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: C.ink }}>
                Hasta
              </label>
              <input
                type="date"
                value={bajaFin}
                onChange={(e) => setBajaFin(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                style={{ borderColor: C.line, color: C.ink }}
              />
            </div>
          )}
        </div>
      )}

      {estado === "vacaciones" && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: C.ink }}>
              Desde
            </label>
            <input
              type="date"
              value={vacacionesInicio}
              onChange={(e) => setVacacionesInicio(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
              style={{ borderColor: C.line, color: C.ink }}
            />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: C.ink }}>
              Hasta
            </label>
            <input
              type="date"
              value={vacacionesFin}
              onChange={(e) => setVacacionesFin(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
              style={{ borderColor: C.line, color: C.ink }}
            />
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        {visible("desplazamiento") && (
          <label className="flex items-center gap-2 text-sm" style={{ color: C.ink }}>
            <input type="checkbox" checked={desplazamiento} onChange={(e) => setDesplazamiento(e.target.checked)} className="w-4 h-4" />
            Desplazamiento ese día
          </label>
        )}
        {visible("horasExtra") && (
          <label className="flex items-center gap-2 text-sm" style={{ color: C.ink }}>
            <input type="checkbox" checked={horasExtra} onChange={(e) => setHorasExtra(e.target.checked)} className="w-4 h-4" />
            Horas extra
          </label>
        )}
        {visible("reconocimientoMedico") && (
          <label className="flex items-center gap-2 text-sm" style={{ color: C.ink }}>
            <input
              type="checkbox"
              checked={reconocimientoMedico}
              onChange={(e) => setReconocimientoMedico(e.target.checked)}
              className="w-4 h-4"
            />
            Reconocimiento médico
          </label>
        )}
      </div>

      <div>
        <label className="text-xs font-semibold block mb-1" style={{ color: C.ink }}>
          Notas (opcional)
        </label>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={2}
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none resize-none"
          style={{ borderColor: C.line, color: C.ink }}
        />
      </div>

      <div className="flex gap-2">
        <button onClick={onCerrar} style={{ borderColor: C.line, color: C.ink }} className="flex-1 border text-sm font-semibold py-2 rounded-lg">
          Cerrar
        </button>
        <button onClick={borrar} style={{ borderColor: C.red, color: C.red }} className="flex-1 border text-sm font-semibold py-2 rounded-lg">
          Borrar
        </button>
        <button onClick={guardar} style={{ background: C.blue }} className="flex-1 text-white text-sm font-semibold py-2 rounded-lg">
          Guardar
        </button>
      </div>
    </div>
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
