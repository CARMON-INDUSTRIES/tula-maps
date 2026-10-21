"use client";

import { useEffect, useRef } from "react";
import { Building2, MapPin, X } from "lucide-react";
import type { Comunidad } from "@/types/comunidad";
import ImagenesObra from "@/components/ImagenesObra";

export default function DialogObra({ obra, onClose }: {
  obra: Comunidad | null;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (obra && !dialog?.open) dialog?.showModal();
    if (!obra && dialog?.open) dialog.close();
  }, [obra]);

  return (
    <dialog className="works-dialog" ref={dialogRef} onClose={onClose} aria-labelledby="community-title" onClick={e => {
      if (e.target !== e.currentTarget) return;
      const rect = e.currentTarget.getBoundingClientRect();
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) e.currentTarget.close();
    }}>
      {obra && <>
        <header className="works-header"><span className="eyebrow"><MapPin size={13} /> OBRAS POR COMUNIDAD</span><button autoFocus className="icon-button" onClick={() => dialogRef.current?.close()} aria-label="Cerrar detalles"><X size={20} /></button><h2 id="community-title">{obra.nombre}</h2><p>{obra.descripcion || "Conoce las intervenciones registradas en esta comunidad."}</p><span className="works-count"><Building2 size={14} /> {obra.obras.length} {obra.obras.length === 1 ? "obra registrada" : "obras registradas"}</span></header>
        <div className="works-content">
          {!obra.obras.length ? <div className="empty-state"><Building2 size={32} /><h3>Aún no hay obras registradas</h3><p>Puedes explorar otra comunidad desde el mapa.</p></div> : obra.obras.map(o => (
            <article className="work-card" key={`${obra.id}-${o.id}`}>
              <div className="work-meta"><span className={"work-status" + (/concluid|terminad/i.test(o.estatus) ? " completed" : "")}>{o.estatus || "Sin estatus"}</span><span>{o.anio ?? "Año no disponible"}</span></div>
              <h3>{o.obraAccionPrograma}</h3>
              <dl className="work-details"><div><dt>Tipo de intervención</dt><dd>{o.tipoIntervencion || "No disponible"}</dd></div><div><dt>Dirección</dt><dd>{o.direccion || "No disponible"}</dd></div><div className="detail-wide"><dt>Ubicación</dt><dd>{o.localidadUbicacion || "No disponible"}</dd></div>{o.montoInversion && <div className="detail-wide work-investment"><dt>Inversión registrada</dt><dd>{o.montoInversion}</dd></div>}</dl>
              <ImagenesObra obraId={o.id} nombre={o.obraAccionPrograma} />
            </article>
          ))}
        </div>
        <footer className="works-footer"><span>Obras públicas · Tula de Allende</span><button className="primary-button" onClick={() => dialogRef.current?.close()}>Volver al mapa</button></footer>
      </>}
    </dialog>
  );
}
