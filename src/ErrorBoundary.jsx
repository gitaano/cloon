import React from "react";
import { C, LogoUnderground, MarcaAguaFondo } from "./App.jsx";
import { AlertTriangle, RotateCw } from "lucide-react";

// Captura cualquier error inesperado al renderizar la web (un fallo de
// programación, un dato mal formado, etc.) y muestra una pantalla amigable
// en vez de dejar al usuario con la pantalla en blanco de siempre.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Se deja constancia en la consola del navegador para poder depurarlo
    // si el usuario nos manda una captura de pantalla.
    console.error("Error atrapado por ErrorBoundary:", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div
        style={{ background: C.bg, position: "relative", zIndex: 0 }}
        className="min-h-screen flex items-center justify-center p-4"
      >
        <MarcaAguaFondo />
        <div
          style={{ background: C.white, borderColor: C.line, position: "relative", zIndex: 1 }}
          className="rounded-2xl border shadow-xl p-6 max-w-md w-full text-center space-y-4"
        >
          <div className="mx-auto w-fit">
            <LogoUnderground size={64} />
          </div>
          <div
            style={{ background: C.errorBg }}
            className="mx-auto w-fit rounded-full p-3"
          >
            <AlertTriangle size={28} style={{ color: C.red }} />
          </div>
          <h1 className="text-lg font-bold" style={{ color: C.ink }}>
            Vaya, algo ha salido mal
          </h1>
          <p className="text-sm" style={{ color: C.mute }}>
            Ha ocurrido un error inesperado. No es culpa tuya — prueba a recargar
            la página; si el problema sigue, avisa a la dirección del club
            contando qué estabas haciendo cuando ha pasado.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ background: C.blue }}
            className="text-white font-semibold py-2.5 px-5 rounded-lg text-sm flex items-center justify-center gap-2 mx-auto"
          >
            <RotateCw size={16} />
            Recargar la página
          </button>
        </div>
      </div>
    );
  }
}
