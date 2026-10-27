import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { agruparComunidades } from "../scripts/agrupar-comunidades.mjs";
import { cerrarContornos } from "../scripts/cerrar-contornos.mjs";

const data = JSON.parse(readFileSync(new URL("../public/data/comunidades_poligonos.geojson", import.meta.url), "utf8"));
const fixture = JSON.parse(readFileSync(new URL("fixtures/comunidades-agrupadas.json", import.meta.url), "utf8"));
const hash = text => createHash("sha256").update(text).digest("hex");

test("cada comunidad agrupada conserva todos sus polígonos y coordenadas originales", () => {
  assert.equal(data.features.length, 51);
  for (const group of fixture.grupos) {
    const matching = data.features.filter(f => f.properties.id === group.id && group.nombres.includes(f.properties.NOMBRE));
    assert.equal(matching.length, 1, group.nombre);
    const feature = matching[0];
    assert.equal(feature.properties.NOMBRE, group.nombre);
    assert.equal(feature.geometry.type, "MultiPolygon");
    assert.equal(feature.geometry.coordinates.length, group.poligonos);
    const normalized = feature.geometry.coordinates.map(polygon => JSON.stringify(polygon.map(ring => {
      assert.deepEqual(ring[0], ring.at(-1), group.nombre + ": anillo cerrado");
      return ring.slice(0, -1);
    }))).sort();
    assert.equal(hash(normalized.join("\n")), group.sha256, group.nombre + ": coordenadas intactas");
  }
});

test("repetir la agrupación no duplica figuras y no altera la colección original", () => {
  const copy = structuredClone(data);
  assert.deepEqual(agruparComunidades(data), data);
  assert.deepEqual(data, copy);
});

test("las demás comunidades y los IDs dudosos conservan sus datos", () => {
  const other = data.features.filter(f => !fixture.grupos.some(g => g.id === f.properties.id && g.nombre === f.properties.NOMBRE));
  // La huella original conserva los anillos abiertos; solo quitamos el cierre añadido.
  const original = structuredClone(other);
  for (const feature of original) for (const ring of feature.geometry.coordinates) {
    assert.deepEqual(ring[0], ring.at(-1));
    ring.pop();
  }
  assert.equal(hash(JSON.stringify(original)), fixture.otrosSha256);
  assert.equal(data.features.filter(f => f.properties.id === 52).length, 2);
  assert.ok(data.features.some(f => f.properties.NOMBRE === "La Mezquitera CHECAR ID"));
  assert.equal(new Set(data.features.map(f => f.properties.id)).size, 42);
});

test("cerrar contornos conserva área, vértices e IDs y no duplica cierres", () => {
  const ring = [[0, 0], [3, 0], [3, 2], [1, 1], [0, 2]];
  const area = points => Math.abs(points.reduce((sum, a, i) => {
    const b = points[(i + 1) % points.length];
    return sum + a[0] * b[1] - b[0] * a[1];
  }, 0)) / 2;
  const source = { features: [{ properties: { id: 43 }, geometry: { type: "Polygon", coordinates: [ring] } }] };
  const closed = cerrarContornos(source);
  const result = closed.features[0].geometry.coordinates[0];
  assert.deepEqual(result.slice(0, -1), ring);
  assert.deepEqual(result[0], result.at(-1));
  assert.equal(area(result), area(ring));
  assert.equal(closed.features[0].properties.id, 43);
  assert.equal(ring.length, 5);
  assert.deepEqual(cerrarContornos(closed), closed);
  assert.deepEqual(cerrarContornos(data), data);
});
