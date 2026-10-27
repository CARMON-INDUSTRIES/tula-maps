import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_SESSION_SECONDS, createAdminSession, passwordMatches, LOGIN_ATTEMPTS_COOKIE, LOGIN_LOCK_SECONDS, MAX_LOGIN_ATTEMPTS, createLoginAttempt, readLoginAttempts } from "@/lib/admin-session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) return NextResponse.json({ mensaje: "Solicitud no permitida." }, { status: 403 });
  if (Number(request.headers.get("content-length") ?? 0) > 4096) return NextResponse.json({ mensaje: "Solicitud demasiado grande." }, { status: 413 });
  if (!process.env.OBRAS_ADMIN_PASSWORD || !process.env.OBRAS_SESSION_SECRET) {
    return NextResponse.json({ mensaje: "El acceso de administración no está configurado en el servidor." }, { status: 503 });
  }
  const attempts = readLoginAttempts(request.cookies.get(LOGIN_ATTEMPTS_COOKIE)?.value);
  if (attempts.failed >= MAX_LOGIN_ATTEMPTS) {
    return NextResponse.json({ mensaje: "Acceso temporalmente bloqueado por tres intentos incorrectos.", lockedUntil: attempts.expires * 1000 }, {
      status: 429, headers: { "Retry-After": String(Math.max(1, attempts.expires - Math.floor(Date.now() / 1000))), "Cache-Control": "no-store" },
    });
  }
  const body = await request.json().catch(() => null);
  if (!passwordMatches(body?.password)) {
    const failed = attempts.failed + 1;
    const token = createLoginAttempt(failed);
    const locked = failed >= MAX_LOGIN_ATTEMPTS;
    const response = NextResponse.json({
      mensaje: locked ? "Acceso temporalmente bloqueado por tres intentos incorrectos." : "La contraseña es incorrecta.",
      intentosRestantes: Math.max(0, MAX_LOGIN_ATTEMPTS - failed),
      ...(locked ? { lockedUntil: readLoginAttempts(token).expires * 1000 } : {}),
    }, { status: locked ? 429 : 401, headers: { "Cache-Control": "no-store", ...(locked ? { "Retry-After": String(LOGIN_LOCK_SECONDS) } : {}) } });
    response.cookies.set(LOGIN_ATTEMPTS_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: LOGIN_LOCK_SECONDS });
    return response;
  }
  const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set(ADMIN_COOKIE, createAdminSession(), {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: ADMIN_SESSION_SECONDS,
  });
  response.cookies.set(LOGIN_ATTEMPTS_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
  return response;
}

export async function DELETE(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) return NextResponse.json({ mensaje: "Solicitud no permitida." }, { status: 403 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
  return response;
}
