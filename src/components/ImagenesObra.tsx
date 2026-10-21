"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImagePlus, Images, Loader2, LockKeyhole, Upload, X } from "lucide-react";
import { listarImagenes, subirImagenes, urlImagen, validarImagenes, type ImagenObra } from "@/lib/imagenes";

export default function ImagenesObra({ obraId, nombre, administrar = false }: { obraId: number; nombre: string; administrar?: boolean }) {
  const [open, setOpen] = useState(false);
  const regionId = useId();
  return (
    <div className="work-images">
      <button type="button" className={"photos-button" + (open ? " is-active" : "")} aria-expanded={open} aria-controls={regionId} onClick={() => setOpen(!open)}><Images size={16} />{open ? "Ocultar imágenes" : administrar ? "Ver / subir fotografías" : "Ver imágenes"}</button>
      {open && <GaleriaObra key={obraId} obraId={obraId} nombre={nombre} regionId={regionId} iniciarCarga={administrar} />}
    </div>
  );
}

function GaleriaObra({ obraId, nombre, regionId, iniciarCarga }: { obraId: number; nombre: string; regionId: string; iniciarCarga: boolean }) {
  const [imagenes, setImagenes] = useState<ImagenObra[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [admin, setAdmin] = useState(iniciarCarga);
  const [clave, setClave] = useState("");
  const [archivos, setArchivos] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [notice, setNotice] = useState("");
  const [failedImage, setFailedImage] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const requestRef = useRef<AbortController | null>(null);
  const current = imagenes[index];

  useEffect(() => {
    const controller = new AbortController();
    listarImagenes(obraId, controller.signal)
      .then(data => {
        if (controller.signal.aborted) return;
        setImagenes(data);
        setIndex(0);
        setLoading(false);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setError("No se pudieron cargar las fotografías. Intenta de nuevo.");
        setLoading(false);
      });
    return () => controller.abort();
  }, [obraId, retry]);
  useEffect(() => () => requestRef.current?.abort(), []);

  const move = (step: number) => setIndex(value => (value + step + imagenes.length) % imagenes.length);
  const upload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const controller = new AbortController();
    requestRef.current = controller;
    setUploading(true);
    setUploadError("");
    setNotice("");
    try {
      const nuevas = await subirImagenes(obraId, archivos, clave, controller.signal);
      if (controller.signal.aborted) return;
      setIndex(imagenes.length);
      setImagenes(previous => [...previous, ...nuevas]);
      setArchivos([]);
      setClave("");
      if (inputRef.current) inputRef.current.value = "";
      setNotice(`${nuevas.length} ${nuevas.length === 1 ? "imagen guardada" : "imágenes guardadas"} correctamente.`);
    } catch (error) {
      if (!controller.signal.aborted) setUploadError(error instanceof TypeError ? "No se pudo conectar con el servidor. Revisa la conexión antes de reintentar." : error instanceof Error ? error.message : "No se pudieron guardar las imágenes.");
    } finally {
      if (!controller.signal.aborted) setUploading(false);
    }
  };

  return (
    <section id={regionId} className="photo-gallery" aria-label={`Imágenes de ${nombre}`}>
      {loading ? <div className="gallery-placeholder" role="status"><Loader2 size={21} className="animate-spin" />Cargando fotografías…</div> : error ? <div className="gallery-placeholder" role="alert"><p>{error}</p><button className="text-button" onClick={() => { setError(""); setLoading(true); setRetry(value => value + 1); }}>Reintentar</button></div> : current ? <>
        <div className="carousel" role="region" aria-roledescription="carrusel" aria-label="Fotografías de la obra" tabIndex={0} onKeyDown={event => {
          if (imagenes.length < 2) return;
          if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
          if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
        }}>
          {failedImage === current.id ? <div className="gallery-placeholder"><Images size={28} /><p>No se pudo mostrar esta fotografía.</p><a href={urlImagen(obraId, current.id)} target="_blank" rel="noopener noreferrer" className="text-button">Abrir imagen</a></div> : (
            // Las fotos se sirven desde la API; solo se descarga la diapositiva actual.
            // eslint-disable-next-line @next/next/no-img-element
            <img key={current.id} src={urlImagen(obraId, current.id)} alt={`Fotografía ${index + 1} de ${nombre}`} decoding="async" onError={() => setFailedImage(current.id)} />
          )}
          {imagenes.length > 1 && <><button className="carousel-arrow previous" aria-label="Imagen anterior" onClick={() => move(-1)}><ChevronLeft size={23} /></button><button className="carousel-arrow next" aria-label="Imagen siguiente" onClick={() => move(1)}><ChevronRight size={23} /></button></>}
          <span className="carousel-counter" aria-live="polite">{index + 1} / {imagenes.length}</span>
        </div>
        <div className="photo-caption"><span>{current.nombreArchivo || `Fotografía ${index + 1}`}</span><a href={urlImagen(obraId, current.id)} target="_blank" rel="noopener noreferrer">Abrir original</a></div>
      </> : <div className="gallery-placeholder"><Images size={29} /><strong>Esta obra aún no tiene fotografías</strong><span>Agrega imágenes para documentar su avance.</span></div>}

      {!loading && !error && <button type="button" className="upload-toggle" aria-expanded={admin} onClick={() => { setAdmin(!admin); setClave(""); setUploadError(""); }} disabled={uploading}>{admin ? <X size={15} /> : <ImagePlus size={16} />}{admin ? "Cerrar carga de imágenes" : "Agregar fotografías"}<LockKeyhole size={13} /></button>}
      {admin && !loading && !error && <form className="upload-form" onSubmit={upload}>
        <div><h4>Cargar fotografías de esta obra</h4><p>JPG, PNG o WebP · Hasta 10 imágenes por envío · Máximo 5 MB por imagen</p></div>
        <label className="upload-label">Contraseña de administración<input type="password" autoComplete="off" value={clave} onChange={e => setClave(e.target.value)} disabled={uploading} required /></label>
        <label className="upload-label">Seleccionar fotografías<input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={uploading} required onChange={e => {
          setUploadError(""); setNotice("");
          const selected = Array.from(e.target.files ?? []);
          try { validarImagenes(selected); setArchivos(selected); }
          catch (error) { setArchivos([]); e.target.value = ""; setUploadError(error instanceof Error ? error.message : "Selección inválida."); }
        }} /></label>
        {archivos.length > 0 && <p className="upload-selection">{archivos.length} seleccionadas · {(archivos.reduce((total, file) => total + file.size, 0) / (1024 * 1024)).toFixed(1)} MB</p>}
        {uploadError && <p className="upload-error" role="alert">{uploadError}</p>}
        <button className="primary-button upload-submit" type="submit" disabled={uploading || !archivos.length || !clave.trim()}>{uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}{uploading ? "Guardando fotografías…" : "Guardar fotografías"}</button>
        <p className="upload-note">Las imágenes guardadas serán visibles para todos los visitantes del mapa.</p>
      </form>}
      {notice && <p className="upload-success" role="status">{notice}</p>}
    </section>
  );
}
