import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../src/lib/obras.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { listarObras } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

test("el listado codifica la búsqueda, pagina y transmite cancelación", async t => {
  const signal = new AbortController().signal;
  t.mock.method(globalThis, "fetch", async (url, options) => {
    const parsed = new URL(url);
    assert.match(parsed.pathname, /\/api\/obras$/);
    assert.equal(parsed.searchParams.get("buscar"), "San Marcos & Tula");
    assert.equal(parsed.searchParams.get("page"), "2");
    assert.equal(parsed.searchParams.get("pageSize"), "12");
    assert.equal(options.signal, signal);
    assert.equal(options.cache, "no-store");
    return Response.json({ items: [{ id: 1, obraAccionPrograma: "Pavimentación" }], total: 13, page: 2, pageSize: 12 });
  });
  assert.equal((await listarObras(2, " San Marcos & Tula ", signal)).total, 13);
});

test("el listado contempla catálogo vacío, API anterior y respuestas inválidas", async t => {
  const fetch = t.mock.method(globalThis, "fetch", async () => Response.json({ items: [], total: 0, page: 1, pageSize: 12 }));
  assert.deepEqual((await listarObras(1, "")).items, []);
  fetch.mock.mockImplementation(async () => new Response(null, { status: 404 }));
  await assert.rejects(listarObras(1, ""), /backend actualizado/);
  fetch.mock.mockImplementation(async () => Response.json({ items: [], total: 1, page: 0, pageSize: 0 }));
  await assert.rejects(listarObras(1, ""), /listado de obras inválido/);
});

test("una consulta cancelada no se transforma en un resultado vacío", async t => {
  const controller = new AbortController();
  controller.abort();
  t.mock.method(globalThis, "fetch", async () => { throw controller.signal.reason; });
  await assert.rejects(listarObras(1, "", controller.signal), { name: "AbortError" });
});
