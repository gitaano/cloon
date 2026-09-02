import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { C, CATEGORIAS_TURNO, LINEAS_METRO, LINEAS_METRO_ESTACIONES, TURNOS, INDICADORES_CALENDARIO, nombrePublico, BloqueDesplegable, BotonPrincipal, MarcaAguaFondo } from "./App.jsx";

export default function MiPerfil({ sesion, perfil, onVolver, onActualizado }) {
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
                <span className="text-white text-xs leading-none">â</span>
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
                titulo="Configurar mi calendario"
                abierto={indicadoresAbiertos}
                onToggle={() => setIndicadoresAbiertos((v) => !v)}
              >
                <p className="text-xs mb-2" style={{ color: C.mute }}>Elige los apartados que quieres tener visibles</p><div className="grid grid-cols-2 gap-x-3">
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

