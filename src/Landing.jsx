import React, { useState } from "react";
import { Check, X, ShieldCheck, Repeat, ShoppingBag, FileText, Bot, Calendar } from "lucide-react";
import { C, MarcaAguaFondo, LogoMetroColor } from "./App.jsx";

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

export function NormasContenido({ normasLeidas, onConfirmar }) {
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

export default function Landing({ onAcceder, normasLeidas, onConfirmarNormas }) {
  const PUNTOS = [
    { icon: Calendar, texto: "Lleva tu día a día: turnos, incidencias, desplazamientos y todo lo tuyo en tu calendario personal" },
    { icon: Repeat, texto: "Oferta y encuentra cambios de turno, día libre o vacaciones con tu misma categoría" },
    { icon: ShoppingBag, texto: "Compra, vende o alquila entre compañeros en el Mercadillo" },
    { icon: FileText, texto: "Consulta el convenio y los manuales internos en la Biblioteca, siempre a mano" },
    { icon: Bot, texto: "Resuelve dudas rápidas (permisos, vacaciones...)" },
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
          problemas del día a día, hablar de las cosas que pasan en nuestro trabajo y estar al tanto
          de lo importante, sin jefes de por medio.
        </p>

        <div style={{ background: C.white }} className="rounded-2xl shadow-2xl p-6 mt-8 text-left space-y-4">
          {PUNTOS.map((p, i) => (
            <div key={i} className="flex items-start gap-3">
              <div style={{ background: C.chipBg }} className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0">
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
