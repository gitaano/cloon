import React, { useState } from "react";
import { supabase } from "./supabaseClient";
import { LogIn, UserPlus, ArrowLeft, ShieldCheck, X } from "lucide-react";
import { C, MarcaAguaFondo, LogoUnderground, BotonPrincipal, Campo, CampoPass } from "./App.jsx";
import { NormasContenido } from "./Landing.jsx";

export function NuevaContrasena({ onListo }) {
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

export default function Acceso({ normasLeidas, onConfirmarNormas } = {}) {
  const [normasAbiertas, setNormasAbiertas] = useState(false);
  const [modo, setModo] = useState("login");
  const [verPass, setVerPass] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState(""); const [recordar, setRecordar] = useState(true);

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
    if (error) setMensaje({ tipo: "error", texto: "Email o contraseña incorrectos." }); if (!error) { localStorage.setItem("ug_login_ts", String(Date.now())); localStorage.setItem("ug_recordar", recordar ? "1" : "0"); }
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
              <CampoPass verPass={verPass} setVerPass={setVerPass} value={loginPass} onChange={setLoginPass} /><label className="flex items-center gap-2 text-xs" style={{ color: C.ink }}><input type="checkbox" checked={recordar} onChange={(e) => setRecordar(e.target.checked)} />Recordarme en este dispositivo</label>
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
              <p className="text-xs rounded-lg p-2.5 flex gap-2" style={{ background: C.chipBg, color: C.blueDark }}>
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
