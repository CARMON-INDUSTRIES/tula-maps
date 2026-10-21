import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const file = new URL("../public/data/comunidades_poligonos.geojson", import.meta.url);
const groups = [
  { id: 33, nombre: "San Marcos", nombres: ["San Marcos"] },
  { id: 26, nombre: "Michimaloya", nombres: ["Michimaloya", "Michimaloya agregar"] },
  { id: 24, nombre: "Nantzha", nombres: ["Nantzha", "Nantzha unir"] },
  { id: 52, nombre: "Tula Centro", nombres: ["Tula Centro"] },
];

export function agruparComunidades(data) {
  const result = structuredClone(data);
  for (const group of groups) {
    const matching = result.features.filter(f => f.properties.id === group.id && group.nombres.includes(f.properties.NOMBRE));
    if (!matching.length) continue;
    const first = matching[0];
    const polygons = matching.flatMap(f => {
      if (f.geometry.type === "Polygon") return [f.geometry.coordinates];
      if (f.geometry.type === "MultiPolygon") return f.geometry.coordinates;
      throw new Error(`Geometría inesperada en ${group.nombre}`);
    });
    // Cierra los anillos sin redondear ni desplazar sus puntos.
    for (const polygon of polygons) for (const ring of polygon) {
      if (ring.length < 3) throw new Error(`Anillo incompleto en ${group.nombre}`);
      if (JSON.stringify(ring[0]) !== JSON.stringify(ring.at(-1))) ring.push([...ring[0]]);
    }
    first.properties.NOMBRE = group.nombre;
    first.geometry = { type: "MultiPolygon", coordinates: polygons };
    result.features = result.features.filter(f => f === first || !matching.includes(f));
  }
  return result;
}

export function formatGeoJSON(value, depth = 0) {
  const indent = "  ".repeat(depth);
  const next = "  ".repeat(depth + 1);
  if (Array.isArray(value)) {
    if (!value.length) return "[]";
    if (value.every(item => typeof item === "number")) return `[${value.join(", ")}]`;
    return `[\n${value.map(item => next + formatGeoJSON(item, depth + 1)).join(",\n")}\n${indent}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value);
    if (!entries.length) return "{}";
    return `{\n${entries.map(([key, item]) => next + JSON.stringify(key) + ": " + formatGeoJSON(item, depth + 1)).join(",\n")}\n${indent}}`;
  }
  return JSON.stringify(value);
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const data = agruparComunidades(JSON.parse(readFileSync(file, "utf8")));
  writeFileSync(file, formatGeoJSON(data) + "\n");
  console.log(`${data.features.length} figuras después de agrupar las comunidades identificadas.`);
}
