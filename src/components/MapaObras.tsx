"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import L, { LeafletMouseEvent } from "leaflet";
import "leaflet/dist/leaflet.css";
import DialogObra from "@/components/DialogObra";

interface Comunidad {
  nombre: string;
  descripcion?: string;
}

interface ComunidadProperties {
  NOMBRE?: string;
  name?: string;
  DESCRIPCION?: string;
  descripcion?: string;
}

export default function MapaObras() {
  const [geoData, setGeoData] = useState<
    FeatureCollection<Geometry, ComunidadProperties> | null
  >(null);

  const [obraSeleccionada, setObraSeleccionada] = useState<Comunidad | null>(
    null
  );

  useEffect(() => {
    fetch("/data/comunidades_poligonos.geojson")
      .then((res) => res.json())
      .then(
        (data: FeatureCollection<Geometry, ComunidadProperties>) =>
          setGeoData(data)
      )
      .catch((err) => {
        console.error("Error al cargar GeoJSON:", err);
      });
  }, []);

  const colores = [
    "#FF6B6B",
    "#4ECDC4",
    "#FFD93D",
    "#6A4C93",
    "#1A659E",
    "#52B788",
    "#E26D5A",
    "#C9ADA1",
  ];

  const styleForIndex = (index: number): L.PathOptions => ({
    color: "#222",
    weight: 2,
    fillColor: colores[index % colores.length],
    fillOpacity: 0.55,
  });

  const onEachFeature = (
    feature: Feature<Geometry, ComunidadProperties>,
    layer: L.Layer,
    index: number
  ) => {
    const nombre =
      feature.properties?.NOMBRE ??
      feature.properties?.name ??
      `Comunidad #${index + 1}`;

    const descripcion =
      feature.properties?.DESCRIPCION ??
      feature.properties?.descripcion ??
      "Delimitación territorial";

    // Solo trabajamos con polígonos / multipolígonos
    if (layer instanceof L.Path) {
      layer.bindTooltip(nombre);

      const originalStyle = styleForIndex(index);

      layer.on("mouseover", (e: LeafletMouseEvent) => {
        const target = e.target;
        if (target instanceof L.Path) {
          target.setStyle({
            weight: 3,
            fillOpacity: 0.75,
          });
        }
      });

      layer.on("mouseout", (e: LeafletMouseEvent) => {
        const target = e.target;
        if (target instanceof L.Path) {
          target.setStyle(originalStyle);
        }
      });

      layer.on("click", () => {
        setObraSeleccionada({ nombre, descripcion });
      });
    }
  };

  return (
    <div
      className="relative w-full h-[90vh] rounded-xl overflow-hidden shadow-xl border border-gray-300 bg-cover bg-center"
      style={{
        backgroundImage: "url('/images/fondo-tula.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-[#691B31]/30 backdrop-blur-[1px] z-0" />

      <MapContainer
        center={[20.051, -99.342]}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {geoData &&
          geoData.features.map((feature, i) => (
            <GeoJSON
              key={i}
              data={feature}
              style={() => styleForIndex(i)}
              onEachFeature={(feat, layer) =>
                onEachFeature(feat, layer, i)
              }
            />
          ))}
      </MapContainer>

      <DialogObra
        obra={obraSeleccionada}
        onClose={() => setObraSeleccionada(null)}
      />
    </div>
  );
}
