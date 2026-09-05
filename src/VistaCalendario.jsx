import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { ArrowLeft, ChevronRight, ChevronLeft, X, Plus, ChevronDown } from "lucide-react";
import { C, CATEGORIAS_TURNO, TURNOS, INDICADORES_CALENDARIO, BloqueDesplegable, MarcaAguaFondo, EsqueletoLista } from "./App.jsx";

export default function VistaCalendario({ sesion, perfil, onVolver }) {
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
    <div style={{ background: C.bg, position: "relative", zIndex: 0 }} className="min-h-screen">
      <MarcaAguaFondo />
      <div style={{ background: C.blueDarker }} className="px-4 py-3 flex items-center gap-3">
        <button onClick={onVolver} className="text-white text-xs font-semibold flex items-center gap-1">
          <ArrowLeft size={17} /> Volver
        </button>
        <p className="text-white font-bold text-sm">Calendario de turnos</p>
      </div>
      <div className="max-w-2xl mx-auto p-4">
        {cargando ? (
          <EsqueletoLista filas={2} alto="h-40" />
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
    if (tieneTurnoRegistrado) return C.diaTrabajado;
    return fecha < hoyStr ? C.diaVacio : C.white;
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
        <div style={{ background: C.bg }} className="rounded-lg p-3">
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
