import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("../src/components/MapaObras.tsx", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source + "\nexport { ComunidadesLayer, MapAppearance };", {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
});

test("el resaltado admite ID cero, ignora IDs ausentes y retira los eventos", () => {
  const effects = [];
  const handlers = new Map();
  const sources = new Map();
  const layers = new Map();
  const states = [];
  const canvas = { style: { cursor: "" } };
  const selected = [];
  const map = {
    getSource: id => sources.get(id),
    addSource: (id, source) => sources.set(id, source),
    getLayer: id => layers.get(id),
    addLayer: layer => layers.set(layer.id, layer),
    getCanvas: () => canvas,
    setFeatureState: (target, state) => {
      assert.notEqual(target.id, undefined);
      assert.notEqual(target.id, null);
      states.push([target.id, state.hover]);
    },
    on: (event, layer, handler) => handlers.set(event, handler),
    off: (event, layer, handler) => {
      assert.equal(handlers.get(event), handler);
      handlers.delete(event);
    },
  };
  const exports = {};
  vm.runInNewContext(outputText, {
    exports,
    require: name => {
      if (name === "react") return {
        useEffect: effect => effects.push(effect),
        useCallback: fn => fn,
        useState: () => [{ type: "FeatureCollection", features: [] }, () => {}],
      };
      if (name === "@/components/ui/map") return { useMap: () => ({ map, isLoaded: true }) };
      return {};
    },
  });
  exports.ComunidadesLayer({ onSelect: id => selected.push(id), onLoad() {}, onError() {} });
  const cleanup = effects[1]();
  assert.equal(sources.get("comunidades").generateId, true);
  const move = id => handlers.get("mousemove")({ features: [{ id }] });
  move(undefined);
  assert.equal(states.length, 0);
  move(0);
  move(0);
  move(1);
  handlers.get("mouseleave")();
  assert.deepEqual(states, [[0, true], [0, false], [1, true], [1, false]]);
  handlers.get("click")({ features: [{ id: 0, properties: { id: 52 } }] });
  assert.deepEqual(selected, [52]);
  cleanup();
  assert.equal(handlers.size, 0);
  assert.equal(canvas.style.cursor, "");
});

test("el relieve se carga bajo demanda, los ajustes no se repiten y el tamaño se observa", () => {
  const effects = [];
  const sources = new Map();
  let resized = 0;
  let disconnected = false;
  let paints = 0;
  let layouts = 0;
  let paint = 0.9;
  let visibility;
  const terrainStates = [];
  const listeners = new Map();
  const map = {
    getContainer: () => "map-container",
    resize: () => resized++,
    getSource: id => sources.get(id),
    addSource: (id, data) => sources.set(id, data),
    setTerrain: value => terrainStates.push(value),
    easeTo() {},
    getLayer: () => true,
    getPaintProperty: () => paint,
    setPaintProperty: (id, key, value) => { paints++; paint = value; },
    getLayoutProperty: () => visibility,
    setLayoutProperty: (id, key, value) => { layouts++; visibility = value; },
    on: (event, handler) => listeners.set(event, handler),
    off: (event, handler) => { assert.equal(listeners.get(event), handler); listeners.delete(event); },
  };
  const exports = {};
  vm.runInNewContext(outputText, {
    exports,
    ResizeObserver: class {
      constructor(callback) { this.callback = callback; }
      observe(container) { assert.equal(container, "map-container"); this.callback(); }
      disconnect() { disconnected = true; }
    },
    require: name => {
      if (name === "react") return { useEffect: effect => effects.push(effect) };
      if (name === "@/components/ui/map") return { useMap: () => ({ map, isLoaded: true }) };
      return {};
    },
  });
  exports.MapAppearance({ terrain: false, labels: true, opacity: 0.35 });
  const cleanupResize = effects[0]();
  effects[1]();
  const cleanupStyle = effects[2]();
  assert.equal(resized, 1);
  assert.equal(sources.size, 0);
  assert.equal(terrainStates[0], null);
  listeners.get("styledata")();
  assert.equal(paints, 1);
  assert.equal(layouts, 1);
  exports.MapAppearance({ terrain: true, labels: false, opacity: 0.5 });
  effects[4]();
  effects[4]();
  assert.equal(sources.size, 1);
  assert.equal(terrainStates.at(-1).source, "terrain");
  cleanupResize();
  cleanupStyle();
  assert.equal(disconnected, true);
  assert.equal(listeners.size, 0);
});
