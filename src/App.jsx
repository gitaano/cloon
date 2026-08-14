import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { LogIn, UserPlus, Eye, EyeOff, ArrowLeft, ShieldCheck } from "lucide-react";

const C = {
  blueDarker: "#02284D",
  blueDark: "#003D73",
  blue: "#0B63B0",
  red: "#E30613",
  ink: "#1C2733",
  mute: "#6B7A8D",
  line: "#E2E7EC",
  white: "#FFFFFF",
};

export default function App() {
  const [sesion, setSesion] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSesion(data.session);
      setCargando(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => {
      setSesion(nuevaSesion);
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

  if (!sesion) {
    return <Acceso />;
  }

  return <ClubProvisional sesion={sesion} />;
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
      className="min-h-screen w-full flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 style={{ color: C.white }} className="text-2xl font-bold">
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
              <Campo label="Puesto / categoría" value={regCargo} onChange={setRegCargo} placeholder="Ej: Jefe/a de Sector" />
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

function ClubProvisional({ sesion }) {
  const [perfil, setPerfil] = useState(null);
  const [hilos, setHilos] = useState([]);
  const [cargandoHilos, setCargandoHilos] = useState(true);
  const [formAbierto, setFormAbierto] = useState(false);

  useEffect(() => {
    supabase
      .from("perfiles")
      .select("*")
      .eq("id", sesion.user.id)
      .single()
      .then(({ data }) => setPerfil(data));
    cargarHilos();
  }, [sesion]);

  function cargarHilos() {
    setCargandoHilos(true);
    supabase
      .from("hilos")
      .select("*, perfiles(nombre, apellido)")
      .order("creado_en", { ascending: false })
      .then(({ data, error }) => {
        if (!error) setHilos(data || []);
        setCargandoHilos(false);
      });
  }

  return (
    <div style={{ background: "#F3F6F9" }} className="min-h-screen">
      <div style={{ background: C.blueDarker }} className="px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-white font-bold text-sm">Underground</p>
          {perfil && (
            <p className="text-xs" style={{ color: "#BFD9EE" }}>
              {perfil.nombre} {perfil.apellido} · {perfil.cargo}
            </p>
          )}
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          style={{ borderColor: "rgba(255,255,255,0.35)" }}
          className="text-white text-xs font-semibold border rounded-full px-3 py-1.5"
        >
          Cerrar sesión
        </button>
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
                {`${h.perfiles?.nombre || ""} ${h.perfiles?.apellido || ""}`} ·{" "}
                {new Date(h.creado_en).toLocaleString("es-ES")}
              </p>
              {h.texto && (
                <p className="text-sm mt-2" style={{ color: C.ink }}>
                  {h.texto}
                </p>
              )}
              <Respuestas hiloId={h.id} sesion={sesion} />
            </div>
          ))}
        </div>
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
      .select("*, perfiles(nombre, apellido)")
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
              {`${r.perfiles?.nombre || ""} ${r.perfiles?.apellido || ""}`}{" "}
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
