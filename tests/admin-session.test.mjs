import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);
const nextServer = pathToFileURL(require.resolve("next/server")).href;
const compile = path => ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const dataUrl = code => `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
const sessionUrl = dataUrl(compile("../src/lib/admin-session.ts"));
const session = await import(sessionUrl);
const loadRoute = path => import(dataUrl(compile(path)
  .replace('"@/lib/admin-session"', JSON.stringify(sessionUrl))
  .replace('"next/server"', JSON.stringify(nextServer))));
const login = await loadRoute("../src/app/api/admin/session/route.ts");
const upload = await loadRoute("../src/app/api/admin/obras/[obraId]/imagenes/route.ts");
const removeImage = await loadRoute("../src/app/api/admin/obras/[obraId]/imagenes/[imagenId]/route.ts");
const { NextRequest } = require("next/server");

function configurar(t) {
  for (const [key, value] of Object.entries({ OBRAS_ADMIN_PASSWORD: "contraseña-de-prueba", OBRAS_SESSION_SECRET: "secreto-de-firma-para-pruebas", OBRAS_UPLOAD_KEY: "clave-solo-del-servidor" })) {
    const old = process.env[key]; process.env[key] = value;
    t.after(() => { if (old === undefined) delete process.env[key]; else process.env[key] = old; });
  }
}

test("la sesión exige contraseña correcta y rechaza cookies alteradas, vencidas o sin secreto", t => {
  configurar(t);
  assert.equal(session.passwordMatches("incorrecta"), false);
  assert.equal(session.passwordMatches(null), false);
  assert.equal(session.passwordMatches("contraseña-de-prueba"), true);
  const now = Date.now();
  const token = session.createAdminSession(now);
  assert.equal(session.isAdminSession(token, now), true);
  assert.equal(session.isAdminSession(token + "x", now), false);
  assert.equal(session.isAdminSession(token.replace(/^\d+/, "999999999999"), now), false);
  assert.equal(session.isAdminSession(token, now + session.ADMIN_SESSION_SECONDS * 1000), false);
  delete process.env.OBRAS_SESSION_SECRET;
  assert.equal(session.isAdminSession(token, now), false);
});

test("el acceso crea una cookie HttpOnly y el cierre elimina la sesión", async t => {
  configurar(t);
  const request = password => new NextRequest("http://localhost:3000/api/admin/session", {
    method: "POST", headers: { origin: "http://localhost:3000", "Content-Type": "application/json" }, body: JSON.stringify({ password }),
  });
  assert.equal((await login.POST(request("incorrecta"))).status, 401);
  const response = await login.POST(request("contraseña-de-prueba"));
  assert.equal(response.status, 200);
  assert.match(response.headers.get("set-cookie"), /HttpOnly/i);
  assert.match(response.headers.get("set-cookie"), /SameSite=strict/i);
  assert.equal(session.isAdminSession(response.cookies.get(session.ADMIN_COOKIE).value), true);
  const logout = await login.DELETE(new NextRequest("http://localhost:3000/api/admin/session", { method: "DELETE", headers: { origin: "http://localhost:3000" } }));
  assert.match(logout.headers.get("set-cookie"), /Max-Age=0/);
});

test("ni la contraseña de carga ni una cookie inventada permiten subir sin sesión", async t => {
  configurar(t);
  const fetch = t.mock.method(globalThis, "fetch", () => assert.fail("No debe contactar al backend"));
  for (const cookie of ["", `${session.ADMIN_COOKIE}=inventada`]) {
    const request = new NextRequest("http://localhost:3000/api/admin/obras/12/imagenes", { method: "POST", headers: { cookie, "X-Upload-Key": "clave-solo-del-servidor" } });
    assert.equal((await upload.POST(request, { params: Promise.resolve({ obraId: "12" }) })).status, 401);
  }
  assert.equal(fetch.mock.callCount(), 0);
});

test("la carga autenticada añade la clave solo al contactar al backend", async t => {
  configurar(t);
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.match(url, /\/obras\/12\/imagenes$/);
    assert.equal(options.headers["X-Upload-Key"], "clave-solo-del-servidor");
    assert.equal(options.duplex, "half");
    const body = await new Response(options.body).text();
    assert.match(body, /obra.jpg/);
    return Response.json([{ id: 1, nombreArchivo: "obra.jpg" }], { status: 201 });
  });
  const form = new FormData(); form.append("archivos", new File(["imagen"], "obra.jpg"));
  const request = new NextRequest("http://localhost:3000/api/admin/obras/12/imagenes", {
    method: "POST", headers: { origin: "http://localhost:3000", cookie: `${session.ADMIN_COOKIE}=${session.createAdminSession()}` }, body: form,
  });
  const response = await upload.POST(request, { params: Promise.resolve({ obraId: "12" }) });
  assert.equal(response.status, 201);
  assert.equal((await response.text()).includes("clave-solo-del-servidor"), false);
});

test("rechaza solicitudes de otro origen antes de abrir una sesión", async t => {
  configurar(t);
  const response = await login.POST(new NextRequest("http://localhost:3000/api/admin/session", {
    method: "POST", headers: { origin: "https://otro-sitio.example" }, body: JSON.stringify({ password: "contraseña-de-prueba" }),
  }));
  assert.equal(response.status, 403);
});

test("tres fallos bloquean el navegador y ni la contraseña correcta evita la espera", async t => {
  configurar(t);
  let token;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const response = await login.POST(new NextRequest("http://localhost:3000/api/admin/session", {
      method: "POST", headers: { origin: "http://localhost:3000", "Content-Type": "application/json", ...(token ? { cookie: `${session.LOGIN_ATTEMPTS_COOKIE}=${token}` } : {}) }, body: JSON.stringify({ password: "incorrecta" }),
    }));
    assert.equal(response.status, attempt < 3 ? 401 : 429);
    const result = await response.json();
    assert.equal(result.intentosRestantes, 3 - attempt);
    token = response.cookies.get(session.LOGIN_ATTEMPTS_COOKIE).value;
    assert.equal(session.readLoginAttempts(token).failed, attempt);
    assert.match(response.headers.get("set-cookie"), /HttpOnly/i);
    if (attempt === 3) {
      assert.ok(result.lockedUntil > Date.now());
      assert.equal(response.headers.get("retry-after"), String(session.LOGIN_LOCK_SECONDS));
    }
  }
  const blocked = await login.POST(new NextRequest("http://localhost:3000/api/admin/session", {
    method: "POST", headers: { origin: "http://localhost:3000", cookie: `${session.LOGIN_ATTEMPTS_COOKIE}=${token}` }, body: JSON.stringify({ password: "contraseña-de-prueba" }),
  }));
  assert.equal(blocked.status, 429);
});

test("el contador vence a los 15 minutos, no acepta alteraciones y se limpia al entrar correctamente", async t => {
  configurar(t);
  const now = Date.now();
  const token = session.createLoginAttempt(2, now);
  assert.equal(session.readLoginAttempts(token, now).failed, 2);
  assert.equal(session.readLoginAttempts(token.replace("attempts.2", "attempts.1"), now).failed, 0);
  assert.equal(session.readLoginAttempts(token, now + session.LOGIN_LOCK_SECONDS * 1000).failed, 0);
  assert.equal(session.isAdminSession(token, now), false);
  const response = await login.POST(new NextRequest("http://localhost:3000/api/admin/session", {
    method: "POST", headers: { origin: "http://localhost:3000", cookie: `${session.LOGIN_ATTEMPTS_COOKIE}=${token}` }, body: JSON.stringify({ password: "contraseña-de-prueba" }),
  }));
  assert.equal(response.status, 200);
  assert.equal(response.cookies.get(session.LOGIN_ATTEMPTS_COOKIE).maxAge, 0);
});

test("el borrado rechaza sesión ausente, otro origen e IDs inválidos sin contactar al backend", async t => {
  configurar(t);
  const fetch = t.mock.method(globalThis, "fetch", () => assert.fail("No debe contactar al backend"));
  const params = Promise.resolve({ obraId: "12", imagenId: "4" });
  const url = "http://localhost:3000/api/admin/obras/12/imagenes/4";
  assert.equal((await removeImage.DELETE(new NextRequest(url, { method: "DELETE" }), { params })).status, 401);
  const cookie = `${session.ADMIN_COOKIE}=${session.createAdminSession()}`;
  assert.equal((await removeImage.DELETE(new NextRequest(url, { method: "DELETE", headers: { cookie, origin: "https://otro.example" } }), { params })).status, 403);
  assert.equal((await removeImage.DELETE(new NextRequest(url, { method: "DELETE", headers: { cookie, origin: "http://localhost:3000" } }), { params: Promise.resolve({ obraId: "12", imagenId: "../4" }) })).status, 400);
  assert.equal(fetch.mock.callCount(), 0);
});

test("el borrado autorizado conserva la obra y la imagen y acepta una respuesta sin cuerpo", async t => {
  configurar(t);
  const fetch = t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.match(url, /\/obras\/12\/imagenes\/4$/);
    assert.equal(options.method, "DELETE");
    assert.equal(options.headers["X-Upload-Key"], "clave-solo-del-servidor");
    return new Response(null, { status: 204 });
  });
  const request = () => new NextRequest("http://localhost:3000/api/admin/obras/12/imagenes/4", { method: "DELETE", headers: { origin: "http://localhost:3000", cookie: `${session.ADMIN_COOKIE}=${session.createAdminSession()}` } });
  const params = Promise.resolve({ obraId: "12", imagenId: "4" });
  const response = await removeImage.DELETE(request(), { params });
  assert.equal(response.status, 204);
  assert.equal(await response.text(), "");
  fetch.mock.mockImplementation(async () => Response.json({ mensaje: "La imagen no pertenece a esta obra." }, { status: 404 }));
  assert.equal((await removeImage.DELETE(request(), { params })).status, 404);
});
