import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { ArrowLeft } from "lucide-react";
import { C, MarcaAguaFondo } from "./App.jsx";

export default function VistaSugerencias({ sesion, perfil, onVolver }) {
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

