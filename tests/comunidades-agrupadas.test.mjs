import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { agruparComunidades } from "../scripts/agrupar-comunidades.mjs";

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
  assert.equal(hash(JSON.stringify(other)), fixture.otrosSha256);
  assert.equal(data.features.filter(f => f.properties.id === 52).length, 2);
  assert.ok(data.features.some(f => f.properties.NOMBRE === "La Mezquitera CHECAR ID"));
  assert.equal(new Set(data.features.map(f => f.properties.id)).size, 42);
});
