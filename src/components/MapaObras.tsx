"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Map, MapControls, useMap } from "@/components/ui/map";
import DialogObra from "@/components/DialogObra";
import type { FeatureCollection, Geometry } from "geojson";
import type { MapLayerMouseEvent } from "maplibre-gl";
import type { Comunidad } from "@/types/comunidad";
import bbox from "@turf/bbox";
import { ArrowRight, ChevronDown, Layers, Loader2, MapPin, Maximize2, Mountain, PanelLeftClose, PanelLeftOpen, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { obtenerComunidad } from "@/lib/comunidades";


interface ComunidadProperties {
  id?: number;
  NOMBRE?: string;
  name?: string;
  DESCRIPCION?: string;
  descripcion?: string;
}



function ComunidadesLayer({
  onSelect,
  onLoad,
  onError,
}: {
  onSelect: (id: number) => void;
  onLoad: (data: FeatureCollection<Geometry, ComunidadProperties>) => void;
  onError: (message: string) => void;
}) {
  const { map, isLoaded } = useMap();
  const [geoData, setGeoData] =
    useState<FeatureCollection<Geometry, ComunidadProperties> | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/data/comunidades_poligonos.geojson", { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error("No se pudieron cargar las comunidades del mapa.");
        return r.json();
      })
      .then((data) => {
        setGeoData(data);
        onLoad(data);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          onError("No se pudieron cargar las comunidades del mapa. Recarga la página.");
        }
      });
    return () => controller.abort();
  }, [onLoad, onError]);

  const addLayers = useCallback(() => {
    if (!map || !geoData) return;

    if (!map.getSource("comunidades")) {
      map.addSource("comunidades", {
        type: "geojson",
        data: geoData,
        // El ID de cada figura es independiente del ID de comunidad de la API.
        generateId: true,
      });
    }

    if (!map.getLayer("comunidades-fill")) {
      map.addLayer({
        id: "comunidades-fill",
        type: "fill",
        source: "comunidades",
        paint: {
          "fill-color": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          "#8E3951",
          "#691B31",
        ],

  "fill-opacity": [
    "case",
    ["boolean", ["feature-state", "hover"], false],
    0.9,
    0.9,
  ],
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
          "line-width": 2.5,
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
      "text-font": ["Open Sans Regular"],
      "text-anchor": "center",
      "text-justify": "center",
      "text-allow-overlap": false,
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

    let hoveredId: string | number | null = null;
   

    const handleMouseMove = (e: MapLayerMouseEvent) => {
      map.getCanvas().style.cursor = "pointer";

      const feature = e.features?.[0];
      if (feature?.id == null || feature.id === hoveredId) return;

      if (hoveredId !== null) {
        map.setFeatureState(
          { source: "comunidades", id: hoveredId },
          { hover: false }
        );
      }

      hoveredId = feature.id;
      map.setFeatureState(
        { source: "comunidades", id: hoveredId },
        { hover: true }
      );
    };

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = "";
      if (hoveredId !== null && map.getSource("comunidades")) {
        map.setFeatureState(
          { source: "comunidades", id: hoveredId },
          { hover: false }
        );
      }
      hoveredId = null;
    };

    const handleClick = (e: MapLayerMouseEvent) => {
      const feature = e.features?.[0];
      if (feature) onSelect(Number(feature.properties.id));
    };

    map.on("mousemove", "comunidades-fill", handleMouseMove);
    map.on("mouseleave", "comunidades-fill", handleMouseLeave);
    map.on("click", "comunidades-fill", handleClick);

    return () => {
      map.off("mousemove", "comunidades-fill", handleMouseMove);
      map.off("mouseleave", "comunidades-fill", handleMouseLeave);
      map.off("click", "comunidades-fill", handleClick);
      handleMouseLeave();
    };
  }, [map, isLoaded, geoData, addLayers, onSelect]);

  return null;
}


const normalizar = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
type GeoData = FeatureCollection<Geometry, ComunidadProperties>;

const subscribeMobile = (callback: () => void) => {
  const query = window.matchMedia("(max-width: 760px)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
};
const getMobile = () => window.matchMedia("(max-width: 760px)").matches;
const getServerMobile = () => false;

function MapAppearance({ terrain, labels, opacity }: { terrain: boolean; labels: boolean; opacity: number }) {
  const { map, isLoaded } = useMap();
  useEffect(() => {
    if (!map || !isLoaded) return;
    const observer = new ResizeObserver(() => map.resize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map, isLoaded]);

  useEffect(() => {
    if (!map || !isLoaded) return;
    if (terrain && !map.getSource("terrain")) {
      map.addSource("terrain", {
        type: "raster-dem",
        url: "https://demotiles.maplibre.org/terrain-tiles/tiles.json",
        tileSize: 256,
        maxzoom: 14,
      });
    }
    map.setTerrain(terrain ? { source: "terrain", exaggeration: 1.3 } : null);
    map.easeTo({ pitch: terrain ? 50 : 0, bearing: terrain ? -15 : 0, duration: 500 });
  }, [map, isLoaded, terrain]);

  useEffect(() => {
    if (!map || !isLoaded) return;
    const apply = () => {
      if (map.getLayer("comunidades-fill") && map.getPaintProperty("comunidades-fill", "fill-opacity") !== opacity) {
        map.setPaintProperty("comunidades-fill", "fill-opacity", opacity);
      }
      const visibility = labels ? "visible" : "none";
      if (map.getLayer("comunidades-labels") && map.getLayoutProperty("comunidades-labels", "visibility") !== visibility) {
        map.setLayoutProperty("comunidades-labels", "visibility", visibility);
      }
    };
    apply();
    map.on("styledata", apply);
    return () => { map.off("styledata", apply); };
  }, [map, isLoaded, labels, opacity]);
  return null;
}

function MapFocus({ data, selectedId, reset }: { data: GeoData | null; selectedId: number | null; reset: number }) {
  const { map, isLoaded } = useMap();
  useEffect(() => {
    if (!map || !isLoaded || !data) return;
    const features = selectedId === null ? data.features : data.features.filter(f => f.properties.id === selectedId);
    if (!features.length) return;
    const bounds = bbox({ type: "FeatureCollection", features });
    map.fitBounds([[bounds[0], bounds[1]], [bounds[2], bounds[3]]], { padding: 45, maxZoom: 14, duration: 600 });
  }, [map, isLoaded, data, selectedId, reset]);
  return null;
}

function ComunidadesLegend({ data, onSelect, selectedId, loading, onClose }: {
  data: GeoData | null;
  onSelect: (id: number) => void;
  selectedId: number | null;
  loading: boolean;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const features = data?.features ?? [];
  const filtered = features.filter(f => normalizar(f.properties.NOMBRE ?? f.properties.name ?? "").includes(normalizar(search.trim())));
  return (
    <aside className="community-panel" aria-label="Explorar comunidades">
      <div className="panel-heading">
        <div><span className="eyebrow">EXPLORA EL TERRITORIO</span><h2>Comunidades <span>{features.length}</span></h2></div>
        <button type="button" className="icon-button" onClick={onClose} aria-label="Ocultar comunidades"><PanelLeftClose size={18} /></button>
      </div>
      <div className="community-search"><Search size={17} aria-hidden="true" /><input aria-label="Buscar comunidad" placeholder="Busca una comunidad…" value={search} onChange={e => setSearch(e.target.value)} />{search && <button className="icon-button" onClick={() => setSearch("")} aria-label="Limpiar búsqueda"><X size={15} /></button>}</div>
      <p className="list-caption">{search ? filtered.length + " resultados" : "Selecciona una zona para consultar sus obras"}</p>
      <ul className="community-list">
        {!data && <li className="empty-state"><Loader2 className="animate-spin" size={22} /><p>Cargando comunidades…</p></li>}
        {data && !filtered.length && <li className="empty-state"><Search size={26} /><h3>Sin coincidencias</h3><p>Prueba con otro nombre.</p><button className="text-button" onClick={() => setSearch("")}>Ver todas las comunidades</button></li>}
        {filtered.map((f, i) => {
          const p = f.properties;
          const active = selectedId === p.id;
          return <li key={i}><button type="button" className={"community-item" + (active ? " is-active" : "")} onClick={() => onSelect(Number(p.id))} aria-pressed={active}>
            <span className="community-pin"><MapPin size={17} /></span>
            <span className="community-name">{p.NOMBRE ?? p.name ?? "Comunidad"}<small>{active && loading ? "Consultando obras…" : "Consultar obras públicas"}</small></span>
            {active && loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={15} className="community-arrow" />}
          </button></li>;
        })}
      </ul>
      <div className="panel-footnote"><span className="status-dot" /> Información por comunidad</div>
    </aside>
  );
}

export default function MapaObras() {
  const [obraSeleccionada, setObraSeleccionada] = useState<Comunidad | null>(null);
  const [geoData, setGeoData] = useState<GeoData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [panelOpen, setPanelOpen] = useState<boolean | null>(null);
  const isMobile = useSyncExternalStore(subscribeMobile, getMobile, getServerMobile);
  const showPanel = panelOpen ?? !isMobile;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [terrain, setTerrain] = useState(false);
  const [labels, setLabels] = useState(true);
  const [opacity, setOpacity] = useState(0.35);
  const [size, setSize] = useState("comfortable");
  const [reset, setReset] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const requestRef = useRef<AbortController | null>(null);
  const cacheRef = useRef(new globalThis.Map<number, { data: Comunidad; expires: number }>());
  const explorerRef = useRef<HTMLElement | null>(null);
  const lastIdRef = useRef<number | null>(null);

  useEffect(() => () => requestRef.current?.abort(), []);
  useEffect(() => {
    const update = () => setFullscreen(document.fullscreenElement === explorerRef.current);
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, []);

  const selectComunidad = useCallback(async (id: number) => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    lastIdRef.current = id;
    setSelectedId(id);
    setError("");
    if (window.matchMedia("(max-width: 760px)").matches) setPanelOpen(false);
    const cached = cacheRef.current.get(id);
    if (cached && cached.expires > Date.now()) {
      setObraSeleccionada(cached.data);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const comunidad = await obtenerComunidad(id, controller.signal);
      if (!controller.signal.aborted) {
        cacheRef.current.set(id, { data: comunidad, expires: Date.now() + 60_000 });
        setObraSeleccionada(comunidad);
      }
    } catch (error) {
      if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "No se pudieron cargar las obras.");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);
  const closeDialog = useCallback(() => setObraSeleccionada(null), []);
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (explorerRef.current?.requestFullscreen) await explorerRef.current.requestFullscreen();
      else setSize("large");
    } catch {
      setSize("large");
      setError("No se pudo abrir pantalla completa. Se amplió el mapa.");
    }
  };

  return (
    <section className={"map-explorer" + (fullscreen ? " is-fullscreen" : "")} ref={explorerRef} aria-label="Mapa interactivo de obras">
      <div className="explorer-toolbar">
        <div className="toolbar-title"><span className="toolbar-mark"><Layers size={18} /></span><div><strong>Explorador de obras</strong><span>Tula de Allende, Hidalgo</span></div></div>
        <div className="toolbar-actions">
          <label className="size-picker"><span>Tamaño</span><select aria-label="Tamaño del mapa" value={size} onChange={e => setSize(e.target.value)}><option value="compact">Compacto</option><option value="comfortable">Cómodo</option><option value="large">Amplio</option></select><ChevronDown size={14} /></label>
          <button className={"tool-button" + (settingsOpen ? " is-active" : "")} aria-label="Ajustes del mapa" aria-expanded={settingsOpen} aria-controls="map-settings" onClick={() => setSettingsOpen(!settingsOpen)}><SlidersHorizontal size={17} /><span>Ajustes</span></button>
          <button className="tool-button" onClick={toggleFullscreen} aria-label={fullscreen ? "Salir de pantalla completa" : "Abrir pantalla completa"}><Maximize2 size={17} /><span className="fullscreen-label">{fullscreen ? "Salir" : "Pantalla completa"}</span></button>
        </div>
      </div>
      {settingsOpen && <div className="map-settings" id="map-settings">
        <label className="setting-toggle"><input type="checkbox" checked={labels} onChange={e => setLabels(e.target.checked)} /><span>Mostrar nombres</span></label>
        <label className="opacity-setting"><span>Intensidad de las zonas <b>{Math.round(opacity * 100)}%</b></span><input aria-label="Intensidad de las zonas" type="range" min="10" max="80" step="5" value={opacity * 100} onChange={e => setOpacity(Number(e.target.value) / 100)} /></label>
        <button className="text-button" onClick={() => { setLabels(true); setOpacity(0.35); }}>Restablecer ajustes</button>
      </div>}
      <div className={"explorer-body size-" + size}>
        {showPanel && <ComunidadesLegend data={geoData} onSelect={selectComunidad} selectedId={selectedId} loading={loading} onClose={() => setPanelOpen(false)} />}
        <div className="map-stage">
          <Map center={[-99.342, 20.051]} zoom={11} maxPitch={65}>
            <MapControls position="bottom-right" showZoom showCompass />
            <ComunidadesLayer onSelect={selectComunidad} onLoad={setGeoData} onError={setError} />
            <MapAppearance terrain={terrain} labels={labels} opacity={opacity} />
            <MapFocus data={geoData} selectedId={selectedId} reset={reset} />
          </Map>
          <div className="map-floating-tools">
            {!showPanel && <button className="floating-button" onClick={() => setPanelOpen(true)} aria-label="Mostrar comunidades"><PanelLeftOpen size={17} /><span>Comunidades</span></button>}
            <div className="view-switch" role="group" aria-label="Vista del mapa"><button aria-pressed={!terrain} className={!terrain ? "selected" : ""} onClick={() => setTerrain(false)}>2D</button><button aria-pressed={terrain} className={terrain ? "selected" : ""} onClick={() => setTerrain(true)}><Mountain size={15} />3D</button></div>
            <button className="floating-button" onClick={() => { setSelectedId(null); setTerrain(false); setReset(n => n + 1); }} title="Ver todo el municipio"><RotateCcw size={16} /><span className="reset-label">Centrar mapa</span></button>
          </div>
          {!loading && !error && <div className="map-hint"><span className="legend-swatch" /> Selecciona una zona para explorar sus obras</div>}
          {(loading || error) && <div role={error ? "alert" : "status"} className={"map-message" + (error ? " is-error" : "")}>
            {loading && <Loader2 size={18} className="animate-spin" />}<span>{loading ? "Buscando obras de la comunidad…" : error}</span>
            {error && lastIdRef.current !== null && <button className="text-button" onClick={() => selectComunidad(lastIdRef.current!)}>Reintentar</button>}
            {error && <button className="icon-button" aria-label="Cerrar aviso" onClick={() => setError("")}><X size={16} /></button>}
          </div>}
        </div>
      </div>
      <div className="explorer-footer"><span><span className="legend-swatch" /> Límites de comunidades</span><span>{geoData ? geoData.features.length + " zonas en el mapa" : "Preparando mapa…"}<span className="footer-divider">·</span> Vista {terrain ? "3D" : "2D"}</span></div>
      <DialogObra obra={obraSeleccionada} onClose={closeDialog} />
    </section>
  );
}
