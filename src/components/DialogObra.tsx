"use client";

import { useEffect, useRef } from "react";
import A11yDialog from "a11y-dialog";
import { animate } from "motion";

interface Obra {
  id: number;
  obraAccionPrograma: string;
  tipoIntervencion: string;
  localidadUbicacion: string;
  montoInversion?: string;
  estatus: string;
  anio?: number;
  direccion: string;
}

interface Comunidad {
  id: number;
  nombre: string;
  descripcion?: string | null;
  obras: Obra[];
}

interface DialogObraProps {
  obra: Comunidad | null;
  onClose: () => void;
}

export default function DialogObra({
  obra,
  onClose,
}: DialogObraProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<A11yDialog | null>(null);

  useEffect(() => {
    if (dialogRef.current) {
      instanceRef.current = new A11yDialog(dialogRef.current);
      instanceRef.current.on("hide", onClose);
    }

    return () => {
      instanceRef.current?.destroy();
    };
  }, [onClose]);

  useEffect(() => {
    if (obra) instanceRef.current?.show();
    else instanceRef.current?.hide();
  }, [obra]);

  useEffect(() => {
    if (!dialogRef.current || !containerRef.current) return;

    type MotionOptions = Parameters<typeof animate>[2];

    const overlayOut: MotionOptions = {
      duration: 0.2,
    };

    const modalIn: MotionOptions = {
      duration: 0.28,
      ease: [0.16, 1, 0.3, 1],
    };

    const modalOut: MotionOptions = {
      duration: 0.18,
    };

    const overlayInStyles: Record<string, unknown> = {
      opacity: [0, 1],
      backdropFilter: ["blur(0px)", "blur(6px)"],
    };

    const overlayOutStyles: Record<string, unknown> = {
      opacity: [1, 0],
      backdropFilter: ["blur(6px)", "blur(0px)"],
    };

    if (obra) {
      animate(dialogRef.current, overlayInStyles);

      animate(
        containerRef.current,
        {
          opacity: [0, 1],
          transform: [
            "scale(0.95) translateY(20px)",
            "scale(1) translateY(0px)",
          ],
        },
        modalIn
      );
    } else {
      animate(dialogRef.current, overlayOutStyles, overlayOut);

      animate(
        containerRef.current,
        {
          opacity: [1, 0],
          transform: [
            "scale(1)",
            "scale(0.96) translateY(10px)",
          ],
        },
        modalOut
      );
    }
  }, [obra]);

  if (!obra) return null;

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4"
      aria-hidden="true"
    >
      <div
        ref={containerRef}
        className="bg-[#fdfdfd] text-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden relative"
        role="document"
      >
        <button
          type="button"
          data-a11y-dialog-hide
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
        >
          ✕
        </button>

        <h2 className="text-3xl font-bold text-[#691B31] mb-2">
          {obra.nombre}
        </h2>

        <p className="text-gray-600 mb-4">
          {obra.descripcion ??
            "Sin descripción disponible."}
        </p>

        <div className="mb-4">
          <span className="inline-flex items-center rounded-full bg-[#691B31] text-white px-3 py-1 text-sm">
            {obra.obras.length} obras registradas
          </span>
        </div>

        <div className="max-h-[55vh] overflow-y-auto space-y-3 pr-2">
          {obra.obras.length === 0 ? (
            <p className="text-gray-500">
              No existen obras registradas.
            </p>
          ) : (
            obra.obras.map((o) => (
              <div
                key={o.id}
                className="border rounded-xl p-4 bg-gray-50 shadow-sm"
              >
                <h3 className="font-semibold text-[#691B31]">
                  {o.obraAccionPrograma}
                </h3>

                <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                  <div>
                    <strong>Dirección:</strong>{" "}
                    {o.direccion}
                  </div>

                  <div>
                    <strong>Tipo:</strong>{" "}
                    {o.tipoIntervencion}
                  </div>

                  <div>
                    <strong>Estatus:</strong>{" "}
                    {o.estatus}
                  </div>

                  <div>
                    <strong>Año:</strong>{" "}
                    {o.anio ?? "N/D"}
                  </div>

                  <div className="col-span-2">
                    <strong>Ubicación:</strong>{" "}
                    {o.localidadUbicacion}
                  </div>

                  {o.montoInversion && (
                    <div className="col-span-2">
                      <strong>Inversión:</strong>{" "}
                      {o.montoInversion}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="button"
            data-a11y-dialog-hide
            className="bg-[#691B31] text-white px-4 py-2 rounded-md hover:bg-[#812041] transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}