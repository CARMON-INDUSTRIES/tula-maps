"use client";

import { useCallback, useEffect, useState } from "react";
import { Map, MapControls, useMap } from "@/components/ui/map";
import DialogObra from "@/components/DialogObra";
import type { FeatureCollection, Geometry } from "geojson";

interface ComunidadProperties {
  NOMBRE?: string;
  name?: string;
  DESCRIPCION?: string;
  descripcion?: string;
}

function ComunidadesLayer({
  onSelect,
  onLoad,
}: {
  onSelect: (data: { nombre: string; descripcion: string }) => void;
  onLoad: (data: FeatureCollection<Geometry, ComunidadProperties>) => void;
}) {
  const { map, isLoaded } = useMap();
  const [geoData, setGeoData] =
    useState<FeatureCollection<Geometry, ComunidadProperties> | null>(null);

  useEffect(() => {
    fetch("/data/comunidades_poligonos.geojson")
      .then((r) => r.json())
      .then((data) => {
        setGeoData(data);
        onLoad(data);
      })
      .catch(console.error);
  }, [onLoad]);

  const addLayers = useCallback(() => {
    if (!map || !geoData) return;

    if (!map.getSource("comunidades")) {
      map.addSource("comunidades", {
        type: "geojson",
        data: geoData,
      });
    }

    if (!map.getLayer("comunidades-fill")) {
      map.addLayer({
        id: "comunidades-fill",
        type: "fill",
        source: "comunidades",
        paint: {
          "fill-color": "#691B31",
          "fill-opacity": 1,
        },
      });
    }

    if (!map.getLayer("comunidades-outline")) {
      map.addLayer({
        id: "comunidades-outline",
        type: "line",
        source: "comunidades",
        paint: {
          "line-color": "#BC995B",
          "line-width": 1.9,
        },
      });
    }

    if (!map.getLayer("comunidades-labels")) {
  map.addLayer({
    id: "comunidades-labels",
    type: "symbol",
    source: "comunidades",
    layout: {
      "text-field": [
        "coalesce",
        ["get", "NOMBRE"],
        ["get", "name"],
      ],
      "text-size": 11,
      "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
      "text-anchor": "center",
      "text-justify": "center",
      "text-allow-overlap": true,
    },
    paint: {
  "text-color": [
    "case",
    ["boolean", ["feature-state", "hover"], false],
    "#BC995B",
    "#000000",
  ],
  "text-halo-color": "#ffffff",
  "text-halo-width": 2,
},
  });
}

  }, [map, geoData]);

  useEffect(() => {
    if (!map || !isLoaded || !geoData) return;

    addLayers();

    let hoveredId: number | null = null;

    map.on("mousemove", "comunidades-fill", (e) => {
      map.getCanvas().style.cursor = "pointer";

      const feature = e.features?.[0];
      if (!feature) return;

      if (hoveredId !== null) {
        map.setFeatureState(
          { source: "comunidades", id: hoveredId },
          { hover: false }
        );
      }

      hoveredId = feature.id as number;
      map.setFeatureState(
        { source: "comunidades", id: hoveredId },
        { hover: true }
      );
    });

    map.on("mouseleave", "comunidades-fill", () => {
      map.getCanvas().style.cursor = "";
      if (hoveredId !== null) {
        map.setFeatureState(
          { source: "comunidades", id: hoveredId },
          { hover: false }
        );
      }
      hoveredId = null;
    });

    map.on("click", "comunidades-fill", (e) => {
      const f = e.features?.[0];
      if (!f) return;

      const p = f.properties as ComunidadProperties;

      onSelect({
        nombre: p.NOMBRE ?? p.name ?? "Comunidad",
        descripcion:
          p.DESCRIPCION ??
          p.descripcion ??
          "Delimitación territorial",
      });
    });
  }, [map, isLoaded, geoData, addLayers, onSelect]);

  return null;
}

function ComunidadesLegend({
  data,
  onSelect,
}: {
  data: FeatureCollection<Geometry, ComunidadProperties> | null;
  onSelect: (data: { nombre: string; descripcion: string }) => void;
}) {
  if (!data) return null;

  return (
    <div
      className="absolute top-4 right-4 z-20 w-64
                 rounded-xl bg-white/90 backdrop-blur
                 border shadow-lg overflow-hidden"
    >
      <div className="px-3 py-2 text-sm font-semibold border-b">
        Comunidades
      </div>

      <ul className="max-h-72 overflow-auto">
        {data.features.map((f, i) => {
          const p = f.properties ?? {};
          const nombre = p.NOMBRE ?? p.name ?? `Comunidad ${i + 1}`;
          const descripcion =
            p.DESCRIPCION ??
            p.descripcion ??
            "Delimitación territorial";

          return (
            <li
              key={i}
              onClick={() => onSelect({ nombre, descripcion })}
              className="px-3 py-2 text-sm cursor-pointer
                         hover:bg-gray-100 transition"
            >
              {nombre}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function TerrainInitializer() {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!map || !isLoaded) return;

    if (!map.getSource("terrain")) {
      map.addSource("terrain", {
        type: "raster-dem",
        url: "https://demotiles.maplibre.org/terrain-tiles/tiles.json",
        tileSize: 256,
        maxzoom: 14,
      });

      map.setTerrain({
        source: "terrain",
        exaggeration: 1.3,
      });
    }
  }, [map, isLoaded]);

  return null;
}

function MapController() {
  const { map, isLoaded } = useMap();

  if (!isLoaded || !map) return null;

  const handle3D = () => {
    map.easeTo({
      pitch: 60,
      bearing: -25,
      zoom: Math.max(map.getZoom(), 14),
      duration: 1200,
    });
  };

  const handleReset = () => {
    map.easeTo({
      pitch: 0,
      bearing: 0,
      duration: 1000,
    });
  };

  return (
    <div className="absolute top-4 left-4 z-20 flex gap-2">
      <button
        onClick={handle3D}
        className="flex items-center gap-1.5 px-3 py-2 rounded-md
                   bg-white/90 backdrop-blur border shadow
                   text-sm font-medium hover:bg-white"
      >
        <span>🏔️</span>
        Vista 3D
      </button>

      <button
        onClick={handleReset}
        className="flex items-center gap-1.5 px-3 py-2 rounded-md
                   bg-white/90 backdrop-blur border shadow
                   text-sm font-medium hover:bg-white"
      >
        <span>🔁</span>
        Reiniciar vista
      </button>
    </div>
  );
}

export default function MapaObras() {
  const [obraSeleccionada, setObraSeleccionada] = useState<{
    nombre: string;
    descripcion: string;
  } | null>(null);

  const [geoData, setGeoData] =
    useState<FeatureCollection<Geometry, ComunidadProperties> | null>(null);

  return (
    <div className="relative w-full h-[90vh] rounded-xl overflow-hidden shadow-xl border border-gray-300">
      <Map center={[-99.342, 20.051]} zoom={13}>
        <MapControls
          position="bottom-right"
          showZoom
          showCompass
          showLocate
          showFullscreen
        />

        <TerrainInitializer />
        <MapController />

        <ComunidadesLayer
          onSelect={setObraSeleccionada}
          onLoad={setGeoData}
        />

        <ComunidadesLegend
          data={geoData}
          onSelect={setObraSeleccionada}
        />
      </Map>

      <DialogObra
        obra={obraSeleccionada}
        onClose={() => setObraSeleccionada(null)}
      />
    </div>
  );
}
