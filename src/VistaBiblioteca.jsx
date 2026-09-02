import React, { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";
import { ArrowLeft, Eye, EyeOff, X, FileText, Upload, Check, Megaphone } from "lucide-react";
import { C, MarcaAguaFondo } from "./App.jsx";

export default function VistaBiblioteca({ sesion, perfil, onVolver }) {
  const [documentos, setDocumentos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState(null);
    const [subirComoPrivado, setSubirComoPrivado] = useState(false); const [categoriaSubida, setCategoriaSubida] = useState("");
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
      privado: esAdminODev ? subirComoPrivado : false, categoria: categoriaSubida || null,
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
  const publicosAprobados = documentos.filter((d) => d.aprobado && !d.privado); const circulares = publicosAprobados.filter((d) => d.categoria === "circular"); const generales = publicosAprobados.filter((d) => d.categoria !== "circular");
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
          <select value={categoriaSubida} onChange={(e) => setCategoriaSubida(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm outline-none mb-3" style={{ borderColor: C.line, color: C.ink }}><option value="">Documento general</option><option value="circular">Circular o aviso (empresa / sindicatos)</option></select><input ref={inputArchivoRef} type="file" onChange={subirArchivo} className="hidden" id="archivo-biblioteca" disabled={subiendo} />
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
              Circulares y avisos
            </p>
            {circulares.length === 0 && (
              <p className="text-sm" style={{ color: C.mute }}>
                Todavía no hay circulares ni avisos publicados.
              </p>
            )}
            {circulares.map((doc) => (
              <div key={doc.id} style={{ background: C.white, borderColor: C.line }} className="rounded-xl border p-3 flex items-center gap-3">
                <Megaphone size={24} style={{ color: C.blue }} className="shrink-0" />
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

        {!cargando && (
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: C.mute }}>
              Biblioteca general
            </p>
            {generales.length === 0 && (
              <p className="text-sm" style={{ color: C.mute }}>
                Todavía no hay documentos disponibles.
              </p>
            )}
            {generales.map((doc) => (
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
