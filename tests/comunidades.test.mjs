import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../src/lib/comunidades.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { obtenerComunidad } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);

test("consulta el ID de comunidad y transmite la señal de cancelación", async (t) => {
  const originalUrl = process.env.NEXT_PUBLIC_API_URL;
  process.env.NEXT_PUBLIC_API_URL = "https://example.com/api/";
  t.after(() => {
    if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_API_URL;
    else process.env.NEXT_PUBLIC_API_URL = originalUrl;
  });
  const signal = new AbortController().signal;
  const comunidad = { id: 52, nombre: "Tula Centro", obras: [] };
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "https://example.com/api/comunidades/52/obras");
    assert.equal(options.signal, signal);
    return Response.json(comunidad);
  });
  assert.deepEqual(await obtenerComunidad(52, signal), comunidad);
});

test("conserva compatibilidad con la API publicada anterior sin repetir errores del servidor", async t => {
  const urls = [];
  const signal = new AbortController().signal;
  const comunidad = { id: 52, nombre: "Tula Centro", obras: [] };
  const fetch = t.mock.method(globalThis, "fetch", async (url, options) => {
    urls.push(url);
    assert.equal(options.signal, signal);
    return urls.length === 1 ? new Response(null, { status: 404 }) : Response.json(comunidad);
  });
  assert.deepEqual(await obtenerComunidad(52, signal), comunidad);
  assert.match(urls[0], /\/comunidades\/52\/obras$/);
  assert.match(urls[1], /\/comunidades\/52$/);
  fetch.mock.mockImplementation(async () => new Response(null, { status: 503 }));
  await assert.rejects(obtenerComunidad(52), /servidor no pudo/);
  assert.equal(fetch.mock.callCount(), 3);
});

test("rechaza IDs inválidos sin llamar al servidor", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", () => assert.fail("No debe consultar"));
  for (const id of [NaN, 0, -1, 1.5]) {
    await assert.rejects(obtenerComunidad(id), /ID de comunidad válido/);
  }
  assert.equal(fetch.mock.callCount(), 0);
});

test("distingue una comunidad inexistente de un error del servidor", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () => new Response(null, { status: 404 }));
  await assert.rejects(obtenerComunidad(52), /no existe/);
  fetch.mock.mockImplementation(async () => new Response(null, { status: 500 }));
  await assert.rejects(obtenerComunidad(52), /servidor no pudo/);
});

test("rechaza HTML y respuestas sin lista de obras", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () => new Response("<html>Error</html>"));
  await assert.rejects(obtenerComunidad(52), /respuesta de comunidad inválida/);
  fetch.mock.mockImplementation(async () => Response.json({ nombre: "Tula Centro" }));
  await assert.rejects(obtenerComunidad(52), /respuesta de comunidad inválida/);
});

test("convierte fallos de red en un mensaje para el usuario", async (t) => {
  t.mock.method(globalThis, "fetch", async () => { throw new TypeError("Failed to fetch"); });
  await assert.rejects(obtenerComunidad(52), /No se pudo conectar/);
});

test("conserva la cancelación sin convertirla en un fallo de red", async (t) => {
  const controller = new AbortController();
  controller.abort();
  t.mock.method(globalThis, "fetch", async () => { throw controller.signal.reason; });
  await assert.rejects(obtenerComunidad(52, controller.signal), { name: "AbortError" });
});
