import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { ArrowLeft, UserPlus, Megaphone, MessageSquare } from "lucide-react";
import { C, MarcaAguaFondo } from "./App.jsx";

export default function VistaNotificaciones({ sesion, onVolver }) {
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
