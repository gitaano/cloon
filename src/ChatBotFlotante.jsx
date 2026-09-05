import React, { useState } from "react";
import { supabase } from "./supabaseClient";
import { Bot, X, Send, TrainFront, ChevronLeft } from "lucide-react";
import { C } from "./App.jsx";

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

export default function ChatBotFlotante() {
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
              <button onClick={enviarPregunta} style={{ background: C.blue }} className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" aria-label="Enviar pregunta">
                <Send size={19} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
