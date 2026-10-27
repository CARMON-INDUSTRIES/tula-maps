import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../src/lib/imagenes.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { eliminarImagen, listarImagenes, subirImagenes, urlImagen, validarImagenes, MAX_IMAGEN_BYTES } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);
const foto = () => new File([new Uint8Array([255, 216, 255])], "obra.jpg", { type: "image/jpeg" });

test("el listado solicita solo metadatos de la obra, con cancelación y sin caché", async t => {
  const signal = new AbortController().signal;
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.match(url, /\/obras\/12\/imagenes$/);
    assert.equal(options.signal, signal);
    assert.equal(options.cache, "no-store");
    return Response.json([{ id: 3, nombreArchivo: "obra.jpg" }]);
  });
  assert.equal((await listarImagenes(12, signal))[0].id, 3);
  assert.match(urlImagen(12, 3), /\/obras\/12\/imagenes\/3\/contenido$/);
});

test("borra la imagen seleccionada por la ruta protegida y conserva errores del servidor", async t => {
  const signal = new AbortController().signal;
  const fetch = t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "/api/admin/obras/12/imagenes/7");
    assert.equal(options.method, "DELETE");
    assert.equal(options.signal, signal);
    return new Response(null, { status: 204 });
  });
  await eliminarImagen(12, 7, signal);
  await assert.rejects(eliminarImagen(12, 0), /ID válido/);
  fetch.mock.mockImplementation(async () => Response.json({ mensaje: "Tu sesión venció" }, { status: 401 }));
  await assert.rejects(eliminarImagen(12, 7), /sesión venció/);
});

test("valida cantidad, formato y tamaño antes de subir", () => {
  assert.throws(() => validarImagenes([]), /1 y 10/);
  assert.throws(() => validarImagenes(Array.from({ length: 11 }, foto)), /1 y 10/);
  assert.throws(() => validarImagenes([new File([], "vacia.png", { type: "image/png" })]), /5 MB/);
  assert.throws(() => validarImagenes([new File(["svg"], "imagen.svg", { type: "image/svg+xml" })]), /JPG, PNG o WebP/);
  assert.throws(() => validarImagenes([new File([new Uint8Array(MAX_IMAGEN_BYTES + 1)], "grande.jpg", { type: "image/jpeg" })]), /5 MB/);
  assert.doesNotThrow(() => validarImagenes([foto()]));
});

test("envía archivos multipart a la ruta protegida sin exponer claves", async t => {
  const signal = new AbortController().signal;
  const archivo = foto();
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "/api/admin/obras/12/imagenes");
    assert.equal(options.method, "POST");
    assert.equal(options.headers, undefined);
    assert.equal(options.signal, signal);
    assert.equal(options.body.getAll("archivos").length, 1);
    assert.equal(options.body.get("archivos").name, archivo.name);
    return Response.json([{ id: 5, nombreArchivo: archivo.name }], { status: 201 });
  });
  assert.equal((await subirImagenes(12, [archivo], signal))[0].id, 5);
});

test("no consulta el servidor si el ID o el archivo es inválido", async t => {
  const fetch = t.mock.method(globalThis, "fetch", () => assert.fail("No debe consultar"));
  await assert.rejects(subirImagenes(0, [foto()]), /ID válido/);
  await assert.rejects(subirImagenes(12, []), /1 y 10/);
  await assert.rejects(listarImagenes(0), /ID válido/);
  assert.equal(fetch.mock.callCount(), 0);
});

test("muestra una sesión vencida y los límites del alojamiento", async t => {
  const fetch = t.mock.method(globalThis, "fetch", async () => Response.json({ mensaje: "Tu sesión venció" }, { status: 401 }));
  await assert.rejects(subirImagenes(12, [foto()]), /sesión venció/);
  fetch.mock.mockImplementation(async () => new Response("<html>Too large</html>", { status: 413 }));
  await assert.rejects(subirImagenes(12, [foto()]), /menos imágenes/);
});

test("rechaza listados inválidos y propaga la cancelación de solicitudes", async t => {
  const fetch = t.mock.method(globalThis, "fetch", async () => Response.json([{ id: "3" }]));
  await assert.rejects(listarImagenes(12), /listado de imágenes inválido/);
  const controller = new AbortController();
  controller.abort();
  fetch.mock.mockImplementation(async () => { throw controller.signal.reason; });
  await assert.rejects(listarImagenes(12, controller.signal), { name: "AbortError" });
});
