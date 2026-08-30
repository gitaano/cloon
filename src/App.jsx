import React, { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";
import { LogIn, UserPlus, Eye, EyeOff, ArrowLeft, ShieldCheck, ThumbsUp, Meh, Angry, Users, TrainFront, Wrench, Monitor, Repeat, ShoppingBag, Handshake, MessageSquare, ChevronRight, ChevronLeft, X, Ban, Contact, Settings, Plus, Calendar, Send, Mail, FileText, Upload, Bot, Check, Lightbulb, ChevronDown, Bell, Megaphone, Search, LogOut, Zap, Star } from "lucide-react";

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

function LogoMetroColor({ size = 48, className, style }) {
  return (
    <img
      src="/logo_color_mini.png"
      width={size}
      height={size * 0.6}
      className={className}
      style={{ objectFit: "contain", ...style }}
      alt="Underground"
    />
  );
}

function LogoUnderground({ size = 48, className, style }) {
  return <LogoMetroColor size={size} className={className} style={style} />;
}

function MarcaAguaFondo() {
  return (
    <div
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, zIndex: -1, overflow: "hidden", pointerEvents: "none" }}
    >
      <LogoMetroPlata
        id="marcaAguaFondo"
        size={1800}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(-16deg)",
          opacity: 0.06,
        }}
      />
    </div>
  );
}

function LogoMetroPlata({ size = 480, className, style }) {
  return (
    <img
      src="/logo_plata_mini.png"
      width={size}
      height={size * 0.6}
      className={className}
      style={{ objectFit: "contain", ...style }}
      alt=""
    />
  );
}

export default function App() {
  const [sesion, setSesion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [recuperandoPass, setRecuperandoPass] = useState(false);
  const [pantallaInicial, setPantallaInicial] = useState("landing");
  const [normasLeidas, setNormasLeidas] = useState(false);

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
    if (pantallaInicial === "landing") {
      return (
        <Landing
          onAcceder={() => setPantallaInicial("acceso")}
          normasLeidas={normasLeidas}
          onConfirmarNormas={() => setNormasLeidas(true)}
        />
      );
    }
    return <Acceso normasLeidas={normasLeidas} onConfirmarNormas={() => setNormasLeidas(true)} />;
  }

  return <>
      <ClubProvisional sesion={sesion} />
      <ChatBotFlotante />
    </>;
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
      style={{ background: `linear-gradient(160deg, ${C.blueDarker}, ${C.blue})`, position: "relative", zIndex: 0, overflow: "hidden" }}
      className="min-h-screen w-full flex items-center justify-center p-4"
    >
      <MarcaAguaFondo />
      <div className="w-full max-w-md" style={{ position: "relative", zIndex: 1 }}>
        <div className="text-center mb-6">
          <div className="mx-auto w-fit drop-shadow-lg">
            <LogoUnderground size={86} />
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

function Acceso({ normasLeidas, onConfirmarNormas } = {}) {
  const [normasAbiertas, setNormasAbiertas] = useState(false);
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
    if (!normasLeidas) { setNormasAbiertas(true); return; }
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
            <LogoUnderground size={106} />
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
                <LogIn size={19} /> Entrar
              </button>
              <button
                onClick={() => { setModo("registro"); setMensaje(null); }}
                className="flex-1 py-2.5 text-sm font-semibold flex items-center justify-center gap-2"
                style={{ background: modo === "registro" ? C.blue : C.white, color: modo === "registro" ? C.white : C.mute }}
              >
                <UserPlus size={19} /> Darse de alta
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
<option>Mantenimiento de Vía</option>
<option>Talleres Centrales</option>
<option>Instalaciones (Ascensores/Escaleras)</option>
<option>Técnico/a administrativo</option>
<option>Guardias Técnicos</option>
<option>Otro</option>
                </select>
              </div>
              <Campo label="Correo electrónico" type="email" value={regEmail} onChange={setRegEmail} placeholder="tucorreo@ejemplo.com" />
              <CampoPass verPass={verPass} setVerPass={setVerPass} value={regPass} onChange={setRegPass} />
              <p className="text-xs rounded-lg p-2.5 flex gap-2" style={{ background: "#EAF2F9", color: C.blueDark }}>
                <ShieldCheck size={29} className="shrink-0" />
                Tus datos solo los ve el equipo de administración — nunca se muestran en el foro.
              </p>
              <BotonPrincipal
              onClick={() => (normasLeidas ? registrar() : setNormasAbiertas(true))}
              cargando={cargando}
            >
              {normasLeidas ? "Solicitar alta" : "Leer y aceptar las normas"}
            </BotonPrincipal>
            </div>
          )}

          {modo === "recuperar" && (
            <div className="space-y-4">
              <button onClick={() => { setModo("login"); setMensaje(null); }} className="text-xs flex items-center gap-1" style={{ color: C.blue }}>
                <ArrowLeft size={17} /> Volver
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
      {normasAbiertas && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-40 p-0 sm:p-4">
          <div style={{ background: C.white, maxHeight: "88vh" }} className="w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col">
            <div style={{ background: C.blueDarker }} className="p-4 rounded-t-2xl flex items-center justify-between shrink-0">
              <p className="text-white font-bold text-sm">Normas del club</p>
              <button onClick={() => setNormasAbiertas(false)} className="text-white">
                <X size={24} />
              </button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto">
              <NormasContenido
                normasLeidas={normasLeidas}
                onConfirmar={() => {
                  onConfirmarNormas();
                  setNormasAbiertas(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
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
    { id: "M", nombre: "M (06:00-14:00)" },
    { id: "T", nombre: "T (14:00-22:00)" },
    { id: "S", nombre: "S (18:00-02:00)" },
    { id: "P", nombre: "P · Partido (14:00-18:00 y 22:00-02:00)" },
  ],
  maquinista: [
    { id: "M0530", nombre: "M0530 (05:30-13:00)" },
    { id: "M0550", nombre: "M0550 (05:50-13:20)" },
    { id: "M0600", nombre: "M0600 (06:00-13:30)" },
    { id: "M0615", nombre: "M0615 (06:15-13:45)" },
    { id: "M0630", nombre: "M0630 (06:30-14:00)" },
    { id: "M0645", nombre: "M0645 (06:45-14:15)" },
    { id: "D0600", nombre: "D0600 · Mañana FDS (06:00-13:30)" },
    { id: "D0630", nombre: "D0630 · Mañana FDS (06:30-14:00)" },
    { id: "F0600", nombre: "F0600 · Flexible (06:00-14:30)" },
    { id: "F0645", nombre: "F0645 · Flexible (06:45-15:15)" },
    { id: "T1415", nombre: "T1415 (14:15-21:45)" },
    { id: "T1430", nombre: "T1430 (14:30-22:00)" },
    { id: "T1445", nombre: "T1445 (14:45-22:15)" },
    { id: "T1500", nombre: "T1500 (15:00-22:30)" },
    { id: "T1530", nombre: "T1530 (15:30-23:00)" },
    { id: "D1500", nombre: "D1500 · Tarde FDS (15:00-22:30)" },
    { id: "P20", nombre: "P20 · Partido (13:00-17:30 y 20:50-23:50)" },
    { id: "F1330", nombre: "F1330 · Flexible (13:30-22:00)" },
    { id: "F1415", nombre: "F1415 · Flexible (14:15-22:45)" },
    { id: "N2230", nombre: "N2230 · Noche (22:30-06:00)" },
    { id: "SN1730", nombre: "SN1730 · Seminoche (17:30-01:30)" },
    { id: "SN1800", nombre: "SN1800 · Seminoche (18:00-02:00)" },
  ],
  mantenimiento: [
    { id: "MT-D07", nombre: "MT-D07 (07:00-14:30)" },
    { id: "MT-T14", nombre: "MT-T14 (14:00-21:30)" },
    { id: "MT-N23", nombre: "MT-N23 (23:00-06:30)" },
  ],
  talleres: [
    { id: "TC-M08", nombre: "TC-M08 (08:00-15:30)" },
    { id: "TC-T15", nombre: "TC-T15 (15:00-22:30)" },
    { id: "TC-N22", nombre: "TC-N22 (22:00-05:30)" },
  ],
  instalaciones: [
    { id: "IE-M09", nombre: "IE-M09 · Partido (09:00-13:30 y 15:30-18:30)" },
    { id: "IE-S07", nombre: "IE-S07 · Fin de semana (07:20-14:50)" },
  ],
  tecnico: [
    { id: "AT-D09", nombre: "AT-D09 · Partido (09:00-13:30 y 15:30-18:30 aprox.)" },
  ],
  guardias: [
    { id: "GU-N22", nombre: "GU-N22 · Guardia (22:00-08:00)" },
  ],
};

const CATEGORIAS_TURNO = [
  { id: "sector", nombre: "Jefe/a de Sector", corta: "J.Sector" },
  { id: "maquinista", nombre: "Maquinista de Tracción Eléctrica", corta: "Maquinista" },
  { id: "mantenimiento", nombre: "Mantenimiento de Vía", corta: "Mant.Vía" },
  { id: "talleres", nombre: "Talleres Centrales", corta: "Talleres" },
  { id: "instalaciones", nombre: "Instalaciones (Asc./Esc.)", corta: "Instalaciones" },
  { id: "tecnico", nombre: "Técnico/a administrativo", corta: "Técnico" },
  { id: "guardias", nombre: "Guardias Técnicos", corta: "Guardias" },
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
  if (p.mostrar_nombre_real) return `${p.nombre || ""} ${p.apellido || ""}`.trim() || "Socio";
  if (p.nickname) return p.nickname;
  return "Socio";
}

function ClubProvisional({ sesion }) {
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
                nombre={a.nombre}
              />
            )
          )}
        </aside>

        <div className="flex-1 min-w-0 space-y-4">
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
                                {perfil?.modo_dios && (
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

function BloqueDesplegable({ titulo, abierto, onToggle, children }) {
  return (
    <div style={{ background: C.white, borderColor: C.line }} className="rounded-xl border overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <span className="text-xs font-semibold" style={{ color: C.ink }}>
          {titulo}
        </span>
        <ChevronDown
          size={19}
          style={{
            color: C.mute,
            transform: abierto ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s ease",
          }}
        />
      </button>
      {abierto && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}

function MiPerfil({ sesion, perfil, onVolver, onActualizado }) {
  const [nickname, setNickname] = useState("");
  const [nombreReal, setNombreReal] = useState("");
  const [apellidoReal, setApellidoReal] = useState("");
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
  const [estacionPreferente, setEstacionPreferente] = useState("");
  const [turnoPreferente, setTurnoPreferente] = useState("");
  const [categoriaTurnos, setCategoriaTurnos] = useState("sector");
  const [categoriaAbierta, setCategoriaAbierta] = useState(false);
  const [indicadoresAbiertos, setIndicadoresAbiertos] = useState(false);
  const [queVenAbierto, setQueVenAbierto] = useState(false);
  const [indicadoresCalendario, setIndicadoresCalendario] = useState(INDICADORES_CALENDARIO.map((i) => i.id));
  const [numSeguidores, setNumSeguidores] = useState(0);
  const [numSiguiendo, setNumSiguiendo] = useState(0);

  useEffect(() => {
    if (!perfil) return;
    setNickname(perfil.nickname || "");
    setNombreReal(perfil.nombre || "");
    setApellidoReal(perfil.apellido || "");
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
    setEstacionPreferente((perfil.estaciones_preferentes && perfil.estaciones_preferentes[0]) || "");
    setTurnoPreferente(perfil.turno_preferente || "");
    setCategoriaTurnos(
      perfil.categoria_turnos || ((perfil.cargo || "").toLowerCase().includes("maquinista") ? "maquinista" : "sector")
    );
    setIndicadoresCalendario(perfil.indicadores_calendario || INDICADORES_CALENDARIO.map((i) => i.id));
  }, [perfil]);

  useEffect(() => {
    supabase
      .from("seguidores")
      .select("id", { count: "exact", head: true })
      .eq("seguido_id", sesion.user.id)
      .then(({ count }) => setNumSeguidores(count || 0));
    supabase
      .from("seguidores")
      .select("id", { count: "exact", head: true })
      .eq("seguidor_id", sesion.user.id)
      .then(({ count }) => setNumSiguiendo(count || 0));
  }, [sesion.user.id]);

  function toggleIndicador(id) {
    setIndicadoresCalendario((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  async function guardar() {
    setMensaje(null);
    if (!nombreReal.trim() || !apellidoReal.trim()) {
      setMensaje({ tipo: "error", texto: "El nombre y el apellido no pueden quedar vacíos." });
      return;
    }
    setCargando(true);
    const { data, error } = await supabase
      .from("perfiles")
      .update({
        nombre: nombreReal.trim(),
        apellido: apellidoReal.trim(),
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
        estaciones_preferentes: estacionPreferente ? [estacionPreferente] : [],
        turno_preferente: turnoPreferente,
        categoria_turnos: categoriaTurnos,
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
    <div style={{ background: "#F3F6F9", position: "relative", zIndex: 0 }} className="min-h-screen">
      <MarcaAguaFondo />
      <div style={{ background: C.blueDarker }} className="px-4 py-3 flex items-center gap-3">
        <button onClick={onVolver} className="text-white text-xs font-semibold flex items-center gap-1">
          <ArrowLeft size={17} /> Volver
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
              <p className="text-xs" style={{ color: C.mute }}>
                <strong style={{ color: C.ink }}>{numSeguidores}</strong> seguidores ·{" "}
                <strong style={{ color: C.ink }}>{numSiguiendo}</strong> siguiendo
              </p>
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

          <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: C.ink }}>
                  Nombre
                </label>
                <input
                  value={nombreReal}
                  onChange={(e) => setNombreReal(e.target.value)}
                  placeholder="Ej: Ana"
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                  style={{ borderColor: C.line, color: C.ink }}
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: C.ink }}>
                  Apellido
                </label>
                <input
                  value={apellidoReal}
                  onChange={(e) => setApellidoReal(e.target.value)}
                  placeholder="Ej: Ruiz"
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                  style={{ borderColor: C.line, color: C.ink }}
                />
              </div>
            </div>

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

          <div className="relative">
            <label className="text-xs font-semibold block mb-1" style={{ color: C.ink }}>
              Puesto / categoría
            </label>
            <select
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none appearance-none pr-8"
              style={{ borderColor: C.line, color: C.ink }}
            >
              <option value="">Selecciona...</option>
<option>Jefe/a de Sector</option>
<option>Maquinista de Tracción Eléctrica</option>
<option>Mantenimiento de Vía</option>
<option>Talleres Centrales</option>
<option>Instalaciones (Ascensores/Escaleras)</option>
<option>Técnico/a administrativo</option>
<option>Guardias Técnicos</option>
<option>Otro</option>
            </select>
            <ChevronDown size={19} style={{ color: C.mute }} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" />
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

          <BloqueDesplegable
            titulo="Qué ven los demás socios de ti"
            abierto={queVenAbierto}
            onToggle={() => setQueVenAbierto((v) => !v)}
          >
            <CasillaPerfil label="Mostrar mi nombre real (en vez de solo el nick)" checked={mostrarNombreReal} onChange={setMostrarNombreReal} />
            <CasillaPerfil label="Mostrar mi DNE" checked={mostrarDne} onChange={setMostrarDne} />
            <CasillaPerfil label="Mostrar mi puesto / categoría" checked={mostrarCargo} onChange={setMostrarCargo} />
            <CasillaPerfil label="Mostrar lo que he escrito en 'Sobre ti'" checked={mostrarIntereses} onChange={setMostrarIntereses} />
            <CasillaPerfil label="Mostrar mi lista de seguidores" checked={mostrarSeguidores} onChange={setMostrarSeguidores} />
            <CasillaPerfil label="Permitir que otros socios me sigan" checked={permiteSeguir} onChange={setPermiteSeguir} />
            <CasillaPerfil label="Notificarme cuando respondan a mis temas" checked={notificarComentarios} onChange={setNotificarComentarios} />
          </BloqueDesplegable>
        </div>

        <div style={{ background: C.white, borderColor: C.line }} className="rounded-xl border p-4 space-y-3">
<p className="text-xs font-semibold" style={{ color: C.ink }}>
            Preferencias del calendario
          </p>
          <div className="relative">
            <label className="text-xs font-semibold block mb-1" style={{ color: C.ink }}>
              Línea preferente
            </label>
            <select
              value={lineaPreferente}
              onChange={(e) => setLineaPreferente(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none appearance-none pr-8"
              style={{ borderColor: C.line, color: C.ink }}
            >
              <option value="">Sin preferencia</option>
              {LINEAS_METRO.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nombre}
                </option>
              ))}
            </select>
            <ChevronDown size={19} style={{ color: C.mute }} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" />
          </div>
          {lineaPreferente && LINEAS_METRO_ESTACIONES[lineaPreferente] && (
            <div className="relative">
              <label className="text-xs font-semibold block mb-1" style={{ color: C.ink }}>
                Estación preferente
              </label>
              <select
                value={estacionPreferente}
                onChange={(e) => setEstacionPreferente(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none appearance-none pr-8"
                style={{ borderColor: C.line, color: C.ink }}
              >
                <option value="">Sin preferencia</option>
                {LINEAS_METRO_ESTACIONES[lineaPreferente].estaciones.map((est) => (
                  <option key={est} value={est}>
                    {est}
                  </option>
                ))}
              </select>
            <ChevronDown size={19} style={{ color: C.mute }} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" />
            </div>
          )}

          <BloqueDesplegable
                titulo="Mi categoría"
                abierto={categoriaAbierta}
                onToggle={() => setCategoriaAbierta((v) => !v)}
              >
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIAS_TURNO.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoriaTurnos(cat.id)}
                      style={{
                        background: categoriaTurnos === cat.id ? C.blue : C.white,
                        borderColor: C.line,
                        color: categoriaTurnos === cat.id ? C.white : C.ink,
                      }}
                      className="border rounded-lg py-2 text-xs font-semibold"
                    >
                      {cat.nombre}
                    </button>
                  ))}
                </div>
              </BloqueDesplegable>

          <div className="relative">
            <label className="text-xs font-semibold block mb-1" style={{ color: C.ink }}>
              Turno preferente
            </label>
            <select
              value={turnoPreferente}
              onChange={(e) => setTurnoPreferente(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none appearance-none pr-8"
              style={{ borderColor: C.line, color: C.ink }}
            >
              <option value="">Sin preferencia</option>
              {(TURNOS[categoriaTurnos] || []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
            <ChevronDown size={19} style={{ color: C.mute }} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" />
          </div>
          <BloqueDesplegable
                titulo="Qué apartados quiero ver marcados"
                abierto={indicadoresAbiertos}
                onToggle={() => setIndicadoresAbiertos((v) => !v)}
              >
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
              </BloqueDesplegable>
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
              nombre: nombreReal,
              apellido: apellidoReal,
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

function BotonAmbito({ activo, onClick, icon: Icon = MessageSquare, nombre }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5"
      style={{ background: activo ? "#EAF2F9" : "transparent" }}
    >
      <Icon size={20} className="shrink-0" style={{ color: activo ? C.blue : C.mute }} />
      <p className="text-sm font-semibold truncate" style={{ color: activo ? C.blueDark : C.ink }}>
        {nombre}
      </p>
    </button>
  );
}

function SelectorFecha({ value, onChange, min, label }) {
  const hoyRef = new Date();
  const fechaValor = value ? new Date(value + "T00:00:00") : null;
  const [abierto, setAbierto] = useState(false);
  const [mesVisto, setMesVisto] = useState((fechaValor || hoyRef).getMonth());
  const [anoVisto, setAnoVisto] = useState((fechaValor || hoyRef).getFullYear());

  const MESES = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];
  const DIAS_SEMANA = ["L", "M", "X", "J", "V", "S", "D"];

  function abrir() {
    const base = fechaValor || hoyRef;
    setMesVisto(base.getMonth());
    setAnoVisto(base.getFullYear());
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
            style={{ background: C.white, borderColor: C.line }}
            className="absolute z-50 mt-1 border rounded-xl shadow-xl p-3 w-72 max-w-[80vw]"
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

function PanelAdmin({ sesion, perfil, onVolver }) {
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
  const esAdmin = perfil?.rol === "admin";

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
    { id: "baneos", nombre: "Peticiones de baneo", icon: Ban, badge: solicitudesBaneo.length },
  ];

  return (
    <div style={{ background: C.bg }} className="min-h-screen">
      <div style={{ background: C.blueDarker }} className="px-4 py-3 flex items-center gap-3">
        <button onClick={onVolver} className="text-white text-xs font-semibold flex items-center gap-1">
          <ArrowLeft size={17} /> Volver
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
                          ★ VIP
                        </span>
                      )}{" "}
                      {!u.aprobado && (
                <span className="text-xs font-bold" style={{ color: C.blueDark }}>
                  {" "}(pendiente de aprobación)
                </span>
              )}{" "}
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
                    No hay altas pendientes de aprobación.
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
                        DNE: {u.dne} · {u.cargo}
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
                  Categorías visibles en "Cambios"
                </p>
                <p className="text-xs" style={{ color: C.mute }}>
                  Elige qué categorías aparecen al elegir categoría para ofertar un cambio. Las que
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
                  Les llegará como notificación del club (no como mensaje directo).
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
                    Todavía no hay mensajes en el buzón.
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
                        · DNE {s.perfiles?.dne} · {new Date(s.creado_en).toLocaleString("es-ES")}
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

  const [categoriaTurnos, setCategoriaTurnos] = useState(
    (perfil?.cargo || "").toLowerCase().includes("maquinista") ? "maquinista" : "sector"
  );

  return (
    <div style={{ background: "#F3F6F9", position: "relative", zIndex: 0 }} className="min-h-screen">
      <MarcaAguaFondo />
      <div style={{ background: C.blueDarker }} className="px-4 py-3 flex items-center gap-3">
        <button onClick={onVolver} className="text-white text-xs font-semibold flex items-center gap-1">
          <ArrowLeft size={17} /> Volver
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
            setCategoriaTurnos={setCategoriaTurnos}
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
  setCategoriaTurnos,
  indicadoresVisibles,
}) {
  const [categoriaAbierta, setCategoriaAbierta] = useState(false);
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
    compensa: "#EAB308",
  };

  function colorFondoDia(fecha, estado, tieneTurnoRegistrado) {
    if (estado && ESTADOS[estado]) return ESTADOS[estado];
    if (tieneTurnoRegistrado) return "#AEB8C4";
    return fecha < hoyStr ? "#D9DEE3" : C.white;
  }

  function resumenDia(r, estadoDia) {
    if (!r && !estadoDia) return "";
    const partes = [];
    if (estadoDia) {
      const info = INDICADORES_CALENDARIO.find((i) => i.id === estadoDia);
      partes.push(info ? info.nombre : estadoDia);
    }
    if (r?.turno) partes.push(`Turno ${r.turno}`);
    if (r?.estado === "baja" && r.baja_inicio) {
      partes.push(
        `Desde ${r.baja_inicio}` + (r.baja_abierta ? " (sigue de baja)" : r.baja_fin ? ` hasta ${r.baja_fin}` : "")
      );
    }
    if (r?.estado === "vacaciones" && r.vacaciones_inicio && r.vacaciones_fin) {
      partes.push(`Del ${r.vacaciones_inicio} al ${r.vacaciones_fin}`);
    }
    if (r?.desplazamiento) partes.push("Desplazamiento");
    if (r?.reconocimiento_medico) partes.push("Reconocimiento médico");
    if (r?.notas) partes.push(r.notas);
    return partes.join(" · ");
  }

  const ABREV_ESTADO = {
    libranza: "L", pap: "PR", pap_no_remunerado: "PN", rj: "RJ", baja: "B",
    vacaciones: "V", trabajo_permuta: "TP", descanso_permuta: "DP", compensa: "CP",
  };

  return (
    <div className="space-y-4">
      <BloqueDesplegable
        titulo="Mi categoría"
        abierto={categoriaAbierta}
        onToggle={() => setCategoriaAbierta((v) => !v)}
      >
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIAS_TURNO.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoriaTurnos(cat.id)}
              style={{
                background: categoriaTurnos === cat.id ? C.blue : C.white,
                borderColor: C.line,
                color: categoriaTurnos === cat.id ? C.white : C.ink,
              }}
              className="border rounded-lg py-2 text-xs font-semibold"
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      </BloqueDesplegable>

      <div style={{ background: C.white, borderColor: C.line }} className="rounded-xl border p-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => cambiarMes(-1)} style={{ color: C.blueDark }} className="p-1.5">
            <ChevronLeft size={22} />
          </button>
          <p className="text-sm font-bold" style={{ color: C.ink }}>
            {NOMBRES_MES[mesVisto]} {anoVisto}
          </p>
          <button onClick={() => cambiarMes(1)} style={{ color: C.blueDark }} className="p-1.5">
            <ChevronRight size={22} />
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
                title={resumenDia(r, estadoDia)}
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
                    <Plus size={11} strokeWidth={3.5} style={{ color: "#B91C1C" }} />
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
          resumen={resumenDia(
            registros[diaSeleccionado],
            estadoEfectivo(diaSeleccionado, registros[diaSeleccionado])
          )}
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

function EditorDia({ fecha, registro, resumen, categoriaTurnos, indicadoresVisibles, onGuardar, onCerrar }) {
  const turnosDisponibles = TURNOS[categoriaTurnos] || [];
  const [estado, setEstado] = useState(registro?.estado || "");
  const [turno, setTurno] = useState(registro?.turno || "");
  const [desplazamiento, setDesplazamiento] = useState(!!registro?.desplazamiento);
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
      estado: null, turno: null, desplazamiento: false, reconocimiento_medico: false,
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

      {resumen && (
        <div style={{ background: "#F3F6F9" }} className="rounded-lg p-3">
          <p className="text-xs font-semibold mb-1" style={{ color: C.mute }}>
            Lo que tienes registrado ese día
          </p>
          <p className="text-sm" style={{ color: C.ink }}>
            {resumen}
          </p>
        </div>
      )}

      <div className="relative">
        <label className="text-xs font-semibold block mb-1" style={{ color: C.ink }}>
          Estado del día
        </label>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none appearance-none pr-8"
          style={{ borderColor: C.line, color: C.ink }}
        >
          <option value="">Trabajado / normal</option>
          {INDICADORES_CALENDARIO.filter(
            (ind) => ind.id !== "desplazamiento" && ind.id !== "horasExtra" && ind.id !== "reconocimientoMedico"
          ).map((ind) => (
            <option key={ind.id} value={ind.id}>
              {ind.nombre}
            </option>
          ))}
        </select>
            <ChevronDown size={19} style={{ color: C.mute }} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" />
      </div>

      {!estado && (
        <div className="relative">
          <label className="text-xs font-semibold block mb-1" style={{ color: C.ink }}>
            Turno (opcional)
          </label>
          <select
            value={turno}
            onChange={(e) => setTurno(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none appearance-none pr-8"
            style={{ borderColor: C.line, color: C.ink }}
          >
            <option value="">Sin especificar</option>
            {turnosDisponibles.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </select>
            <ChevronDown size={19} style={{ color: C.mute }} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" />
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
function VistaNotificaciones({ sesion, onVolver }) {
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargar();
  }, []);

  function cargar() {
    setCargando(true);
    supabase
      .from("notificaciones")
      .select("*")
      .eq("usuario_id", sesion.user.id)
      .order("creado_en", { ascending: false })
      .then(({ data }) => {
        setNotificaciones(data || []);
        setCargando(false);
      });
  }

  async function marcarLeida(id) {
    await supabase.from("notificaciones").update({ leida: true }).eq("id", id);
    setNotificaciones((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)));
  }

  function iconoTipo(tipo) {
    if (tipo === "nuevo_seguidor") return UserPlus;
    if (tipo === "anuncio") return Megaphone;
    return MessageSquare;
  }

  return (
    <div style={{ background: "#F3F6F9", position: "relative", zIndex: 0 }} className="min-h-screen">
      <MarcaAguaFondo />
      <div style={{ background: C.blueDarker }} className="px-4 py-3 flex items-center gap-3">
        <button onClick={onVolver} className="text-white text-xs font-semibold flex items-center gap-1">
          <ArrowLeft size={17} /> Volver
        </button>
        <p className="text-white font-bold text-sm">Notificaciones del club</p>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-2">
        {cargando && (
          <p className="text-sm text-center" style={{ color: C.mute }}>
            Cargando...
          </p>
        )}
        {!cargando && notificaciones.length === 0 && (
          <p className="text-sm text-center py-8" style={{ color: C.mute }}>
            Todavía no tienes notificaciones.
          </p>
        )}
        {notificaciones.map((n) => {
          const Icono = iconoTipo(n.tipo);
          return (
            <button
              key={n.id}
              onClick={() => !n.leida && marcarLeida(n.id)}
              style={{ background: n.leida ? C.white : "#EAF2F9", borderColor: C.line }}
              className="w-full text-left rounded-xl border p-3 flex items-start gap-3"
            >
              <div style={{ background: n.leida ? C.line : C.blue }} className="rounded-full p-2 shrink-0">
                <Icono size={16} color={n.leida ? C.mute : C.white} />
              </div>
              <div className="min-w-0">
                <p className="text-sm" style={{ color: C.ink, fontWeight: n.leida ? 400 : 600 }}>
                  {n.texto}
                </p>
                <p className="text-xs mt-0.5" style={{ color: C.mute }}>
                  {new Date(n.creado_en).toLocaleString("es-ES")}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}


function VistaMensajes({ sesion, perfil, conversacionInicial, onVolver }) {
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
    <div style={{ background: "#F3F6F9" }} className="min-h-screen flex flex-col">
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
          <button onClick={abrirNuevoMensaje} className="ml-auto text-white">
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

function VistaBiblioteca({ sesion, perfil, onVolver }) {
  const [documentos, setDocumentos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState(null);
    const [subirComoPrivado, setSubirComoPrivado] = useState(false);
  const [verTexto, setVerTexto] = useState(null);
  const inputArchivoRef = useRef(null);

  const esAdminODev = perfil?.rol === "admin" || perfil?.rol === "dev";

  useEffect(() => {
    cargarDocumentos();
  }, []);

  function cargarDocumentos() {
    setCargando(true);
    supabase
      .from("documentos")
      .select("*")
      .order("creado_en", { ascending: false })
      .then(({ data }) => {
        setDocumentos(data || []);
        setCargando(false);
      });
  }

  async function subirArchivo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendo(true);
    setMensaje(null);
    const ruta = `${sesion.user.id}/${Date.now()}_${file.name}`;
    const { error: errorSubida } = await supabase.storage.from("biblioteca").upload(ruta, file);
    if (errorSubida) {
      setMensaje({ tipo: "error", texto: "No se pudo subir el archivo." });
      setSubiendo(false);
      return;
    }
    const { error: errorFila } = await supabase.from("documentos").insert({
      nombre: file.name,
      tipo: file.type || file.name.split(".").pop(),
      url_archivo: ruta,
      autor_id: sesion.user.id,
      aprobado: false,
      privado: esAdminODev ? subirComoPrivado : false,
    });
    setSubiendo(false);
    if (errorFila) {
      setMensaje({ tipo: "error", texto: "No se pudo registrar el documento." });
    } else {
      setMensaje({ tipo: "ok", texto: "Documento subido. Un admin debe aprobarlo para que sea visible." });
      cargarDocumentos();
    }
    if (inputArchivoRef.current) inputArchivoRef.current.value = "";
  }

  async function abrirDocumento(doc) {
    if (!doc.url_archivo) {
      setVerTexto(doc);
      return;
    }
    const { data, error } = await supabase.storage.from("biblioteca").createSignedUrl(doc.url_archivo, 3600);
    if (!error && data) window.open(data.signedUrl, "_blank");
  }

  async function alternarPrivado(doc) {
    await supabase.from("documentos").update({ privado: !doc.privado }).eq("id", doc.id);
    cargarDocumentos();
  }

  async function aprobarDocumento(id) {
    await supabase.from("documentos").update({ aprobado: true }).eq("id", id);
    cargarDocumentos();
  }

  async function eliminarDocumento(doc) {
    if (!confirm("¿Eliminar este documento?")) return;
    if (doc.url_archivo) {
      await supabase.storage.from("biblioteca").remove([doc.url_archivo]);
    }
    await supabase.from("documentos").delete().eq("id", doc.id);
    cargarDocumentos();
  }

  const pendientes = documentos.filter((d) => !d.aprobado);
  const publicosAprobados = documentos.filter((d) => d.aprobado && !d.privado);
  const privadosAprobados = documentos.filter((d) => d.aprobado && d.privado);

  return (
    <div style={{ background: "#F3F6F9", position: "relative", zIndex: 0 }} className="min-h-screen">
      <MarcaAguaFondo />
      <div style={{ background: C.blueDarker }} className="px-4 py-3 flex items-center gap-3">
        <button onClick={onVolver} className="text-white text-xs font-semibold flex items-center gap-1">
          <ArrowLeft size={17} /> Volver
        </button>
        <p className="text-white font-bold text-sm">Biblioteca de documentos</p>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <div style={{ background: C.white, borderColor: C.line }} className="rounded-xl border p-4">
          <input ref={inputArchivoRef} type="file" onChange={subirArchivo} className="hidden" id="archivo-biblioteca" disabled={subiendo} />
          <label
            htmlFor="archivo-biblioteca"
            style={{ background: subiendo ? "#B9C6D2" : C.blue }}
            className="w-full text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Upload size={19} />
            {subiendo ? "Subiendo..." : "Subir documento"}
          </label>
          {esAdminODev && (
            <label className="flex items-center gap-2 text-xs mt-3" style={{ color: C.ink }}>
              <input
                type="checkbox"
                checked={subirComoPrivado}
                onChange={(e) => setSubirComoPrivado(e.target.checked)}
                className="w-4 h-4"
              />
              Documento privado (solo lo usa el asistente virtual, no lo ven los socios)
            </label>
          )}
          <p className="text-xs mt-2" style={{ color: C.mute }}>
            Tras subirlo, un admin debe aprobarlo para que sea visible.
          </p>
          {mensaje && (
            <p
              className="text-xs mt-2 rounded-lg p-2"
              style={{
                background: mensaje.tipo === "error" ? "#FCEBEA" : "#E9F7EF",
                color: mensaje.tipo === "error" ? C.red : "#1E8449",
              }}
            >
              {mensaje.texto}
            </p>
          )}
        </div>

        {cargando && (
          <p className="text-sm" style={{ color: C.mute }}>
            Cargando...
          </p>
        )}

        {!cargando && esAdminODev && pendientes.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: C.mute }}>
              Pendientes de aprobación
            </p>
            {pendientes.map((doc) => (
              <div key={doc.id} style={{ background: C.white, borderColor: C.line }} className="rounded-xl border p-3 flex items-center gap-3">
                <FileText size={24} style={{ color: C.mute }} className="shrink-0" />
                <button onClick={() => abrirDocumento(doc)} className="min-w-0 flex-1 text-left">
                  <p className="text-sm font-semibold truncate" style={{ color: C.ink }}>
                    {doc.nombre}
                    {doc.privado && (
                      <span className="font-bold" style={{ color: C.blueDark }}>
                        {" "}· privado
                      </span>
                    )}
                  </p>
                </button>
                <button
                  onClick={() => aprobarDocumento(doc.id)}
                  style={{ background: "#22C55E" }}
                  className="text-white rounded-lg p-1.5 shrink-0"
                  aria-label="Aprobar"
                >
                  <Check size={18} />
                </button>
                <button onClick={() => alternarPrivado(doc)} style={{ color: C.blueDark }} className="shrink-0" aria-label={doc.privado ? "Marcar como público" : "Marcar como privado"} title={doc.privado ? "Hacer público" : "Hacer privado"}>{doc.privado ? <Eye size={20} /> : <EyeOff size={20} />}</button>
              <button onClick={() => eliminarDocumento(doc)} style={{ color: C.red }} className="shrink-0" aria-label="Eliminar">
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>
        )}

        {!cargando && (
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: C.mute }}>
              Biblioteca pública
            </p>
            {publicosAprobados.length === 0 && (
              <p className="text-sm" style={{ color: C.mute }}>
                Todavía no hay documentos disponibles.
              </p>
            )}
            {publicosAprobados.map((doc) => (
              <div key={doc.id} style={{ background: C.white, borderColor: C.line }} className="rounded-xl border p-3 flex items-center gap-3">
                <FileText size={24} style={{ color: C.blue }} className="shrink-0" />
                <button onClick={() => abrirDocumento(doc)} className="min-w-0 flex-1 text-left">
                  <p className="text-sm font-semibold truncate" style={{ color: C.ink }}>
                    {doc.nombre}
                  </p>
                </button>
                {esAdminODev && (<>
                  <button onClick={() => alternarPrivado(doc)} style={{ color: C.blueDark }} className="shrink-0" aria-label={doc.privado ? "Marcar como público" : "Marcar como privado"} title={doc.privado ? "Hacer público" : "Hacer privado"}>{doc.privado ? <Eye size={20} /> : <EyeOff size={20} />}</button>
              <button onClick={() => eliminarDocumento(doc)} style={{ color: C.red }} className="shrink-0" aria-label="Eliminar">
                    <X size={20} />
                  </button>
                </>)}
              </div>
            ))}
          </div>
        )}

        {!cargando && esAdminODev && (
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: C.mute }}>
              Biblioteca privada (solo dev/admin y el asistente virtual)
            </p>
            <p className="text-xs" style={{ color: C.mute }}>
              Estos documentos no los ven los socios en el foro, pero el chat de dudas los usa para responder.
            </p>
            {privadosAprobados.length === 0 && (
              <p className="text-sm" style={{ color: C.mute }}>
                Todavía no hay documentos privados.
              </p>
            )}
            {privadosAprobados.map((doc) => (
              <div key={doc.id} style={{ background: C.white, borderColor: C.line }} className="rounded-xl border p-3 flex items-center gap-3">
                <FileText size={24} style={{ color: C.blueDark }} className="shrink-0" />
                <button onClick={() => abrirDocumento(doc)} className="min-w-0 flex-1 text-left">
                  <p className="text-sm font-semibold truncate" style={{ color: C.ink }}>
                    {doc.nombre}
                  </p>
                </button>
                <button onClick={() => alternarPrivado(doc)} style={{ color: C.blueDark }} className="shrink-0" aria-label={doc.privado ? "Marcar como público" : "Marcar como privado"} title={doc.privado ? "Hacer público" : "Hacer privado"}>{doc.privado ? <Eye size={20} /> : <EyeOff size={20} />}</button>
              <button onClick={() => eliminarDocumento(doc)} style={{ color: C.red }} className="shrink-0" aria-label="Eliminar">
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
          
      {verTexto && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-40 p-0 sm:p-4" onClick={() => setVerTexto(null)}>
          <div
            style={{ background: C.white, maxHeight: "88vh" }}
            className="w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ background: C.blueDarker }} className="p-4 rounded-t-2xl flex items-center justify-between shrink-0">
              <p className="text-white font-bold text-sm">{verTexto.nombre}</p>
              <button onClick={() => setVerTexto(null)} className="text-white">
                <X size={22} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-3">
              {(verTexto.contenido_texto || "Este documento todavía no tiene contenido.").split("\n").map((linea, i) =>
                linea.trim() ? (
                  <p key={i} className="text-sm" style={{ color: C.ink, lineHeight: 1.6 }}>
                    {linea}
                  </p>
                ) : null
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function VistaSugerencias({ sesion, perfil, onVolver }) {
  const [sugerencias, setSugerencias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    cargarSugerencias();
  }, []);

  function cargarSugerencias() {
    setCargando(true);
    supabase
      .from("sugerencias")
      .select("*")
      .eq("autor_id", sesion.user.id)
      .order("creado_en", { ascending: false })
      .then(({ data }) => {
        setSugerencias(data || []);
        setCargando(false);
      });
  }

  async function enviar() {
    if (!texto.trim()) return;
    setEnviando(true);
    setMensaje(null);
    const { error } = await supabase.from("sugerencias").insert({
      autor_id: sesion.user.id,
      texto: texto.trim(),
    });
    setEnviando(false);
    if (error) {
      setMensaje({ tipo: "error", texto: error.message });
      return;
    }
    setTexto("");
    setMensaje({ tipo: "ok", texto: "Enviado. El equipo de admin/dev lo revisará en breve." });
    cargarSugerencias();
  }

  return (
    <div style={{ background: "#F3F6F9", position: "relative", zIndex: 0 }} className="min-h-screen">
      <MarcaAguaFondo />
      <div style={{ background: C.blueDarker }} className="px-4 py-3 flex items-center gap-3">
        <button onClick={onVolver} className="text-white text-xs font-semibold flex items-center gap-1">
          <ArrowLeft size={17} /> Volver
        </button>
        <p className="text-white font-bold text-sm">Buzón de sugerencias</p>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <div style={{ background: C.white, borderColor: C.line }} className="rounded-xl border p-4 space-y-3">
          <p className="text-xs" style={{ color: C.mute }}>
            Escribe directamente a admin/dev: sugerencias, problemas con la web, o cualquier cosa que
            quieras contarles en privado. Solo lo ven ellos.
          </p>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={4}
            placeholder="Escribe aquí tu sugerencia o problema..."
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none resize-none"
            style={{ borderColor: C.line, color: C.ink }}
          />
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
          <button
            onClick={enviar}
            disabled={!texto.trim() || enviando}
            style={{ background: texto.trim() ? C.blue : "#B9C6D2" }}
            className="w-full text-white font-semibold py-2.5 rounded-lg text-sm"
          >
            {enviando ? "Enviando..." : "Enviar"}
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: C.mute }}>
            Tus mensajes anteriores
          </p>
          {cargando && (
            <p className="text-sm" style={{ color: C.mute }}>
              Cargando...
            </p>
          )}
          {!cargando && sugerencias.length === 0 && (
            <p className="text-sm" style={{ color: C.mute }}>
              Todavía no has enviado nada al buzón.
            </p>
          )}
          {sugerencias.map((s) => (
            <div key={s.id} style={{ background: C.white, borderColor: C.line }} className="rounded-xl border p-3 space-y-2">
              <p className="text-sm" style={{ color: C.ink }}>
                {s.texto}
              </p>
              <p className="text-xs" style={{ color: C.mute }}>
                {new Date(s.creado_en).toLocaleString("es-ES")}
                {s.resuelto ? " · Resuelto" : " · Pendiente de respuesta"}
              </p>
              {s.respuesta && (
                <div style={{ background: "#EAF2F9" }} className="rounded-lg p-2.5">
                  <p className="text-xs font-semibold mb-1" style={{ color: C.blueDark }}>
                    Respuesta de admin/dev
                  </p>
                  <p className="text-sm" style={{ color: C.ink }}>
                    {s.respuesta}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const RESPUESTAS_BOT = [
  {
    match: ["madre", "padre", "hospital", "grave", "enfermedad grave", "familiar"],
    respuesta:
      "Por accidente o enfermedad grave, hospitalización o intervención quirúrgica de un familiar hasta 2º grado (padre, madre, hijos, hermanos, etc.) corresponden 5 días naturales de permiso retribuido. Si hace falta desplazarse fuera de la provincia, se amplía. (Art. 37.3.b del Estatuto de los Trabajadores, recogido en el convenio, cláusula 11ª). Esto es orientativo — confírmalo siempre con RR.HH.",
  },
  {
    match: ["asuntos propios", "pap", "días libres"],
    respuesta:
      "Tienes 11 días anuales para asuntos propios, de los cuales 7 son retribuidos. Se pueden coger seguidos o sueltos, avisando con al menos 48h de antelación (72h en algunas áreas operativas).",
  },
  {
    match: ["boda", "matrimonio", "pareja de hecho"],
    respuesta: "Por matrimonio o registro de pareja de hecho corresponden 15 días naturales de permiso.",
  },
  {
    match: ["mudanza", "traslado", "domicilio"],
    respuesta: "Por traslado del domicilio habitual corresponde 1 día natural de permiso.",
  },
  {
    match: ["líneas", "cuántas líneas", "km", "kilómetros", "estaciones tiene", "cifras", "cuántos empleados"],
    respuesta:
      "Metro de Madrid tiene 12 líneas, un Ramal (Ópera-Príncipe Pío) y una línea de Metro Ligero (ML1), con 296 km de red y 303 estaciones — la cuarta red del mundo occidental por número de estaciones. Más de 7.000 personas trabajan en la compañía, y en 2024 la usaron 715,2 millones de viajeros. Se inauguró el 17 de octubre de 1919 entre Cuatro Caminos y Sol.",
  },
  {
    match: ["bicicleta", "bici"],
    respuesta:
      "Las bicicletas plegadas se pueden llevar siempre. Sin plegar, el acceso está limitado a ciertos horarios, líneas y tramos concretos de la red (fuera de horas punta); conviene consultar siempre el reglamento de viajeros actualizado para la línea concreta.",
  },
  {
    match: ["perro", "mascota", "animal", "animales domésticos", "perro guía", "perro de asistencia"],
    respuesta:
      "Se permite viajar con un animal doméstico pequeño en transportín o bolsa cerrada, y con perros de tamaño mediano/grande sujetos con correa corta y bozal en las condiciones que marque el reglamento. Los perros de asistencia/guía tienen acceso garantizado sin las restricciones anteriores.",
  },
  {
    match: ["globo", "globos metálicos"],
    respuesta: "El acceso con globos metálicos (los de helio, tipo mylar) está prohibido en toda la red, ya que pueden provocar cortocircuitos en la catenaria e instalaciones.",
  },
  {
    match: ["tarjeta multi", "tarjeta personal", "tarjeta infantil", "tarjeta azul", "tarjeta virtual", "título de transporte", "abono"],
    respuesta:
      "Los títulos de transporte se cargan sobre distintos soportes: Tarjeta Multi (no personal, 2,50€, recargable, dura 10 años), Tarjeta Personal (necesaria para bonificaciones de familia numerosa o discapacidad ≥65%), Tarjeta Infantil, Tarjeta Azul y Tarjeta Virtual (en el móvil). Cada una admite distintos tipos de billetes y abonos según el caso.",
  },
  {
    match: ["primeros auxilios", "emergencia médica", "socorrista", "desmayo", "accidente en la estación"],
    respuesta:
      "Ante una urgencia médica en la estación, lo primero es garantizar tu seguridad y la de la persona afectada, avisar de inmediato al Puesto de Mando/servicios de emergencia y no mover a la persona salvo peligro inminente. El número de recursos de primeros auxilios necesarios depende de factores como el turno, la afluencia y la distancia a servicios médicos — consulta siempre el protocolo interno vigente para el procedimiento exacto.",
  },
  {
    match: ["riesgos laborales", "prevención de riesgos", "prl"],
    respuesta:
      "La prevención de riesgos laborales en Metro cubre desde ergonomía y ruido hasta procedimientos ante emergencias según el puesto (Jefe/a de Sector, Maquinista, etc.). Para el detalle completo consulta el Manual de Riesgos Laborales disponible en la Biblioteca.",
  },
  {
    match: ["reglamento de viajeros", "normas para viajar", "normas del viajero"],
    respuesta:
      "El Reglamento de Viajeros de Metro de Madrid regula el uso correcto de las instalaciones y trenes: validación de títulos, comportamiento en estaciones y andenes, objetos permitidos y prohibidos (bicicletas, animales, globos metálicos...) y sanciones por incumplimiento. Está disponible completo en la Biblioteca.",
  },
  {
    match: ["temario", "examen de acceso", "nuevo ingreso", "oposición", "convocatoria"],
    respuesta:
      "En la Biblioteca tienes disponible el Temario de Nuevo Ingreso para Jefe/a de Sector y Maquinista de Tracción Eléctrica: historia de Metro, tarifas, reglamento de viajeros, CRTM, prevención de riesgos y primeros auxilios, entre otros temas.",
  },
];

function respuestaBot(pregunta) {
  const q = pregunta.toLowerCase();
  const encontrada = RESPUESTAS_BOT.find((r) => r.match.some((k) => q.includes(k)));
  return (
    encontrada?.respuesta ||
    "No tengo una respuesta para eso todavía. Puedes preguntar sobre permisos, vacaciones, el reglamento de viajeros, objetos permitidos, datos de Metro o el temario de nuevo ingreso — o consultar la Biblioteca de documentos."
  );
}

function ChatBotFlotante() {
  const [chatAbierto, setChatAbierto] = useState(false);
  const [asistenteOculto, setAsistenteOculto] = useState(false);
  const [mensajes, setMensajes] = useState([
    { de: "bot", texto: "¡Hola! Pregúntame sobre permisos, vacaciones, el reglamento de viajeros o datos de Metro." },
  ]);
  const [pregunta, setPregunta] = useState("");

  async function buscarEnDocumentos(pregunta) {
    const { data, error } = await supabase.rpc("buscar_documentos", { termino: pregunta });
    if (error || !data || data.length === 0) return null;
    const mejor = data[0];
    if (mejor.rango < 0.01) return null;
    const extracto = mejor.extracto.replace(/<\/?b>/g, "**");
    return `Encontré esto en "${mejor.nombre}":\n\n"${extracto}"\n\nPuedes leer el documento completo en la Biblioteca.`;
  }

  async function enviarPregunta() {
    if (!pregunta.trim()) return;
    const preguntaActual = pregunta;
    const nueva = { de: "user", texto: preguntaActual };
    setMensajes((m) => [...m, nueva]);
    setPregunta("");
    const enDocumentos = await buscarEnDocumentos(preguntaActual);
    const texto = enDocumentos || respuestaBot(preguntaActual);
    setMensajes((m) => [...m, { de: "bot", texto }]);
  }

  return (
    <>
      {!chatAbierto && !asistenteOculto && (
        <div className="fixed bottom-5 right-5 z-40 flex flex-col items-center gap-1.5">
          <style>{`
            @keyframes reboteAsistente {
              0%   { transform: translateY(0); }
              4%   { transform: translateY(-14px); }
              8%   { transform: translateY(0); }
              12%  { transform: translateY(-14px); }
              16%  { transform: translateY(0); }
              100% { transform: translateY(0); }
            }
          `}</style>
          <div className="relative">
            <button
              onClick={() => setAsistenteOculto(true)}
              style={{ background: C.white, color: C.mute, borderColor: C.line }}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full border flex items-center justify-center shadow z-10"
              aria-label="Ocultar asistente"
            >
              <X size={13} />
            </button>
            <button
              onClick={() => setChatAbierto(true)}
              style={{
                background: "rgba(0, 61, 115, 0.85)",
                backdropFilter: "blur(14px) saturate(180%)",
                WebkitBackdropFilter: "blur(14px) saturate(180%)",
                animation: "reboteAsistente 12s ease-in-out infinite",
              }}
              className="text-white rounded-full pl-3 pr-4 py-3 flex items-center gap-2 shadow-2xl hover:opacity-90 transition"
            >
              <div style={{ background: C.white }} className="w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                <TrainFront size={20} style={{ color: C.blueDark }} />
              </div>
              <span className="text-sm font-bold hidden sm:inline">Pregúntame dudas</span>
            </button>
          </div>
          <span
            style={{ background: C.white, color: C.blueDark, borderColor: C.line }}
            className="text-xs font-bold px-2.5 py-1 rounded-full border shadow text-center leading-tight"
          >
            Chat virtual
            <br />
            dudas Metro
          </span>
        </div>
      )}

      {asistenteOculto && (
        <button
          onClick={() => setAsistenteOculto(false)}
          style={{ background: C.blueDark }}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 text-white pl-2 pr-1 py-3 rounded-l-lg shadow-lg flex flex-col items-center gap-1"
          aria-label="Mostrar el chat de ayuda"
        >
          <TrainFront size={19} />
          <ChevronLeft size={17} />
        </button>
      )}

      {chatAbierto && (
        <div className="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center z-30 p-0 sm:p-4">
          <div
            style={{ background: C.white, height: "80vh", maxHeight: 600 }}
            className="w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col"
          >
            <div style={{ background: C.blueDark }} className="p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Bot size={22} />
                <span className="font-bold text-sm">Asistente de dudas</span>
              </div>
              <button onClick={() => setChatAbierto(false)} className="text-white">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">
              {mensajes.map((m, i) => (
                <div
                  key={i}
                  className={"text-sm px-3.5 py-2.5 rounded-2xl " + (m.de === "bot" ? "self-start rounded-tl-sm" : "self-end rounded-tr-sm ml-auto")}
                  style={{
                    background: m.de === "bot" ? "#EAF2F9" : C.blue,
                    color: m.de === "bot" ? C.ink : C.white,
                    maxWidth: "85%",
                  }}
                >
                  {m.texto}
                </div>
              ))}
            </div>
            <div className="p-3 border-t flex gap-2" style={{ borderColor: C.line }}>
              <input
                value={pregunta}
                onChange={(e) => setPregunta(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && enviarPregunta()}
                placeholder="Escribe tu duda..."
                className="flex-1 rounded-full border px-4 py-2 text-sm outline-none"
                style={{ borderColor: C.line }}
              />
              <button onClick={enviarPregunta} style={{ background: C.blue }} className="w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                <Send size={19} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const NORMAS_SECCIONES = [
  {
    titulo: "Qué es Underground",
    parrafos: [
      "Underground es un espacio creado por y para trabajadores del Metro de Madrid. No es un canal oficial de la empresa: aquí podemos debatir, contarnos cosas, pedir y ofrecer cambios de turno, día libre o vacaciones, y ayudarnos entre compañeros.",
      "Nada de lo que se publique en este club tiene validez oficial. Cualquier cambio, incidencia o gestión debe comprobarse y formalizarse siempre a través de los canales y herramientas de la empresa. Underground es un apoyo entre compañeros, no un sustituto de esos canales.",
    ],
  },
  {
    titulo: "Buen rollo y respeto",
    parrafos: [
      "Queremos que este sea un sitio con buen ambiente. Trátanos como te gustaría que te trataran: con respeto, aunque no estés de acuerdo con alguien. Las discrepancias se pueden expresar sin faltar al respeto ni descalificar a nadie.",
      "No se permite lenguaje ofensivo, insultos, discriminación (por origen, sexo, orientación, categoría profesional o cualquier otro motivo), ni contenido ilegal o que incite a la violencia.",
    ],
  },
  {
    titulo: "Disputas, conflictos y acoso",
    parrafos: [
      "Cualquier disputa, problema o caso de acoso, en cualquiera de sus formas, será motivo de revisión por parte de los administradores y creadores del club. Tras esa revisión, podrá derivar en la expulsión temporal o definitiva del club para la persona responsable.",
      "Si vives o presencias una situación así, puedes reportarla desde el propio mensaje o solicitar la intervención de administración desde el perfil de la persona implicada. Todos los socios pueden bloquear a otro usuario para dejar de recibir mensajes privados suyos en cualquier momento, sin necesidad de justificarlo.",
    ],
  },
  {
    titulo: "Responsabilidad a título personal",
    parrafos: [
      "Cada socio participa a título personal. La información que compartas sobre tus servicios, descansos o incidencias es responsabilidad tuya, y el uso que hagas de la información publicada por otros compañeros también lo es.",
      "Este club nace para ayudarnos a controlar y organizarnos mejor entre todos, pero no representa ningún tipo de responsabilidad legal ni laboral por parte de sus creadores o administradores si hay o hubiera algún error, fallo o mal funcionamiento del propio diseño de la web.",
    ],
  },
  {
    titulo: "Privacidad y datos de los compañeros",
    parrafos: [
      "No compartas datos personales de otros compañeros (nombre real, DNE, teléfono, dirección, turno, etc.) sin su permiso, aunque los conozcas por otro medio. Cada uno decide qué información suya es pública u oculta en su propio perfil.",
      "Los mensajes privados entre socios se tratan como algo privado. El acceso excepcional a ellos por parte del equipo técnico solo puede darse en casos justificados, y queda siempre registrado.",
    ],
  },
  {
    titulo: "Biblioteca y documentación",
    parrafos: [
      "La Biblioteca es para compartir documentación útil para todos: convenio, manuales, protocolos... Antes de aparecer, cualquier documento subido pasa por la revisión de un administrador.",
      "No se debe subir documentación confidencial de la empresa que no esté ya disponible públicamente o autorizada para su difusión interna entre trabajadores.",
    ],
  },
  {
    titulo: "Altas, bajas y moderación",
    parrafos: [
      "El acceso al club está reservado a empleados de Metro de Madrid de nivel medio y base. Las solicitudes de alta las revisa y aprueba un administrador.",
      "Los administradores y el equipo de desarrollo pueden eliminar contenido que incumpla estas normas y banear cuentas cuando así lo justifiquen los hechos. Los socios no pueden banear a otros socios directamente, pero sí pueden solicitar la revisión de un caso a administración.",
    ],
  },
  {
    titulo: "Estas normas pueden actualizarse",
    parrafos: [
      "Este documento podrá revisarse y ampliarse con el tiempo, según lo que la propia comunidad necesite. Cualquier cambio importante se anunciará en un tema fijado por administración.",
    ],
  },
];

function NormasContenido({ normasLeidas, onConfirmar }) {
  const [heLeido, setHeLeido] = useState(normasLeidas);
  return (
    <>
      <div style={{ background: "#FCEBEA", borderColor: "#F3B8B8" }} className="rounded-xl border p-3 flex items-start gap-2.5">
        <ShieldCheck size={22} style={{ color: C.red }} className="shrink-0 mt-0.5" />
        <p className="text-xs" style={{ color: "#7A1518" }}>
          Underground <strong>no es un canal oficial</strong> de Metro de Madrid. Nada de lo publicado aquí
          sustituye a los cauces y herramientas oficiales de la empresa.
        </p>
      </div>

      {NORMAS_SECCIONES.map((s, i) => (
        <div key={i} style={{ background: C.white, borderColor: C.line }} className="rounded-xl border p-4 space-y-2">
          <h2 className="text-sm font-bold" style={{ color: C.blueDark }}>
            {i + 1}. {s.titulo}
          </h2>
          {s.parrafos.map((p, j) => (
            <p key={j} className="text-sm leading-relaxed" style={{ color: C.ink }}>
              {p}
            </p>
          ))}
        </div>
      ))}

      <div
        style={{ background: normasLeidas ? "#E7F7EE" : C.white, borderColor: normasLeidas ? "#22C55E" : C.line }}
        className="rounded-xl border p-4 space-y-3"
      >
        {normasLeidas ? (
          <p className="text-sm font-semibold flex items-center gap-2" style={{ color: "#15803D" }}>
            <Check size={19} /> Ya has confirmado que has leído las normas del club.
          </p>
        ) : (
          <>
            <label className="flex items-start gap-2.5 text-sm" style={{ color: C.ink }}>
              <input
                type="checkbox"
                checked={heLeido}
                onChange={(e) => setHeLeido(e.target.checked)}
                className="w-4 h-4 mt-0.5 shrink-0"
              />
              He leído y acepto las normas del club. Hasta que no las confirme, no podré publicar temas,
              responder ni subir documentos.
            </label>
            <button
              onClick={onConfirmar}
              disabled={!heLeido}
              style={{ background: heLeido ? C.blue : "#B9C6D2" }}
              className="w-full text-white font-semibold py-2.5 rounded-lg text-sm"
            >
              Confirmar lectura
            </button>
          </>
        )}
      </div>

      <p className="text-xs text-center pb-2" style={{ color: C.mute }}>
        Al registrarte y usar Underground aceptas estas normas.
      </p>
    </>
  );
}

function Landing({ onAcceder, normasLeidas, onConfirmarNormas }) {
  const PUNTOS = [
    { icon: Repeat, texto: "Oferta y encuentra cambios de turno, día libre o vacaciones con tu misma categoría" },
    { icon: ShoppingBag, texto: "Compra, vende o alquila entre compañeros en el Mercadillo" },
    { icon: FileText, texto: "Consulta el convenio y los manuales internos en la Biblioteca, siempre a mano" },
    { icon: Bot, texto: "Resuelve dudas rápidas (permisos, vacaciones...) con el chat virtual" },
  ];

  const [normasAbiertas, setNormasAbiertas] = useState(false);

  return (
    <div
      style={{ background: `linear-gradient(160deg, ${C.blueDarker}, ${C.blue})`, position: "relative", zIndex: 0, overflow: "hidden" }}
      className="min-h-screen w-full flex flex-col items-center px-4 py-12"
    >
      <MarcaAguaFondo />
      <div className="w-full max-w-xl text-center" style={{ position: "relative", zIndex: 1 }}>
        <div className="mx-auto w-fit drop-shadow-lg">
          <LogoMetroColor size={132} />
        </div>
        <h1 style={{ color: C.white }} className="text-3xl font-bold mt-5">
          Underground
        </h1>
        <p style={{ color: "#BFD9EE" }} className="text-base mt-3 leading-relaxed">
          El espacio privado, hecho por y para trabajadores de Metro. Un sitio donde plantear
          problemas del día a día, ayudarte con compañeros de tu misma categoría y estar al tanto
          de lo importante, sin jefes de por medio.
        </p>

        <div style={{ background: C.white }} className="rounded-2xl shadow-2xl p-6 mt-8 text-left space-y-4">
          {PUNTOS.map((p, i) => (
            <div key={i} className="flex items-start gap-3">
              <div style={{ background: "#EAF2F9" }} className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0">
                <p.icon size={22} style={{ color: C.blue }} />
              </div>
              <p className="text-sm pt-1.5" style={{ color: C.ink }}>
                {p.texto}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={() => setNormasAbiertas(true)}
          style={{
            background: normasLeidas ? "rgba(34,197,94,0.18)" : "rgba(255,255,255,0.12)",
            borderColor: normasLeidas ? "#22C55E" : "rgba(255,255,255,0.35)",
          }}
          className="w-full border rounded-xl p-4 mt-4 flex items-center gap-3 text-left"
        >
          <div
            style={{ background: normasLeidas ? "#22C55E" : C.white }}
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          >
            {normasLeidas ? (
              <Check size={22} style={{ color: C.white }} />
            ) : (
              <ShieldCheck size={22} style={{ color: C.blueDark }} />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold" style={{ color: C.white }}>
              {normasLeidas ? "Normas del club leídas y confirmadas" : "Lee las normas del club antes de entrar"}
            </p>
            <p className="text-xs" style={{ color: "#BFD9EE" }}>
              {normasLeidas ? "Puedes volver a consultarlas cuando quieras" : "Tócalo para leerlas y confirmarlas"}
            </p>
          </div>
        </button>

        <button
          onClick={onAcceder}
          style={{ background: C.red }}
          className="w-full text-white font-bold py-3.5 rounded-xl text-base mt-4 shadow-lg hover:opacity-90 transition"
        >
          Acceder al club
        </button>

        <p className="text-xs mt-5" style={{ color: "#BFD9EE" }}>
          Solo para empleados de Metro. Iniciativa entre compañeros — no es un canal oficial de
          Metro de Madrid.
        </p>
      </div>

      {normasAbiertas && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-40 p-0 sm:p-4">
          <div
            style={{ background: C.white, maxHeight: "88vh" }}
            className="w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col"
          >
            <div style={{ background: C.blueDarker }} className="p-4 rounded-t-2xl flex items-center justify-between shrink-0">
              <p className="text-white font-bold text-sm">Normas del club</p>
              <button onClick={() => setNormasAbiertas(false)} className="text-white">
                <X size={24} />
              </button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto">
              <NormasContenido
                normasLeidas={normasLeidas}
                onConfirmar={() => {
                  onConfirmarNormas();
                  setNormasAbiertas(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
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
          {verPass ? <EyeOff size={22} /> : <Eye size={22} />}
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
