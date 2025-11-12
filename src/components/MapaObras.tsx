"use client";

import { Map, Marker } from "pigeon-maps";
import { useState } from "react";
import DialogObra from "@/components/DialogObra";

export interface Obra {
  id: number;
  nombre: string;
  descripcion?: string;
  coords: [number, number];
}

export default function MapaObras() {
  const [center, setCenter] = useState<[number, number]>([20.051, -99.342]);
  const [zoom, setZoom] = useState<number>(15);
  const [obraSeleccionada, setObraSeleccionada] = useState<Obra | null>(null);

  const obras: Obra[] = [
    {
      id: 1,
      nombre: "Rehabilitación del Parque Central",
      descripcion: "Remodelación de áreas verdes, bancas y luminarias.",
      coords: [20.052, -99.34],
    },
    {
      id: 2,
      nombre: "Pavimentación Calle Reforma",
      descripcion: "Pavimentación con concreto hidráulico en la colonia Centro.",
      coords: [20.055, -99.345],
    },
  ];

  return (
    <div
      className="relative w-full h-[90vh] rounded-xl overflow-hidden shadow-xl border border-gray-300 bg-cover bg-center"
      style={{
        backgroundImage: "url('/images/fondo-tula.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Capa decorativa opcional */}
      <div className="absolute inset-0 bg-[#691B31]/30 backdrop-blur-[1px] z-0" />

      {/* === Mapa directamente dentro del contenedor === */}
      <Map
        center={center}
        zoom={zoom}
        onBoundsChanged={({ center, zoom }) => {
          setCenter(center as [number, number]);
          setZoom(zoom);
        }}
        provider={(x, y, z) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`}
        metaWheelZoom={true}
      >
        {obras.map((obra) => (
          <Marker
            key={obra.id}
            anchor={obra.coords}
            width={45}
            onClick={() => setObraSeleccionada(obra)}
          />
        ))}
      </Map>

      {/* === Diálogo === */}
      <DialogObra
        obra={obraSeleccionada}
        onClose={() => setObraSeleccionada(null)}
      />
    </div>
  );
}
