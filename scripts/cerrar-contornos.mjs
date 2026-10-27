import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { formatGeoJSON } from "./agrupar-comunidades.mjs";

export function cerrarContornos(data) {
  const result = structuredClone(data);
  for (const feature of result.features) {
    const { type, coordinates } = feature.geometry;
    const polygons = type === "Polygon" ? [coordinates] : type === "MultiPolygon" ? coordinates : [];
    for (const polygon of polygons) for (const ring of polygon) {
      if (ring.length < 3) throw new Error("Contorno incompleto: " + feature.properties.NOMBRE);
      if (JSON.stringify(ring[0]) !== JSON.stringify(ring.at(-1))) ring.push([...ring[0]]);
    }
  }
  return result;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const file = new URL("../public/data/comunidades_poligonos.geojson", import.meta.url);
  const data = JSON.parse(readFileSync(file, "utf8"));
  writeFileSync(file, formatGeoJSON(cerrarContornos(data)) + "\n");
}
