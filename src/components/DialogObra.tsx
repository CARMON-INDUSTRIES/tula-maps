"use client";

import { useEffect, useRef } from "react";
import A11yDialog from "a11y-dialog";
import type { Obra } from "@/components/MapaObras";

interface DialogObraProps {
  obra: Obra | null;
  onClose: () => void;
}

export default function DialogObra({ obra, onClose }: DialogObraProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<A11yDialog | null>(null);

  // Crear el diálogo solo una vez
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

  if (!obra) return null;

  return (
    <div
      id="dialog-obra"
      ref={dialogRef}
      className="a11y-dialog fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
      aria-hidden="true"
    >
      <div
        className="dialog-container bg-[#fdfdfd] text-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md relative animate-fadeIn"
        role="document"
      >
        <button
          type="button"
          data-a11y-dialog-hide
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-[#691B31] mb-2">
          {obra.nombre}
        </h2>
        <p className="text-gray-600 mb-6">
          {obra.descripcion ?? "Sin descripción disponible."}
        </p>

        <div className="flex justify-end">
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
