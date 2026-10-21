import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_SESSION_SECONDS, createAdminSession, passwordMatches } from "@/lib/admin-session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) return NextResponse.json({ mensaje: "Solicitud no permitida." }, { status: 403 });
  if (Number(request.headers.get("content-length") ?? 0) > 4096) return NextResponse.json({ mensaje: "Solicitud demasiado grande." }, { status: 413 });
  if (!process.env.OBRAS_ADMIN_PASSWORD || !process.env.OBRAS_SESSION_SECRET) {
    return NextResponse.json({ mensaje: "El acceso de administración no está configurado en el servidor." }, { status: 503 });
  }
  const body = await request.json().catch(() => null);
  if (!passwordMatches(body?.password)) return NextResponse.json({ mensaje: "La contraseña es incorrecta." }, { status: 401 });
  const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set(ADMIN_COOKIE, createAdminSession(), {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: ADMIN_SESSION_SECONDS,
  });
  return response;
}

export async function DELETE(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) return NextResponse.json({ mensaje: "Solicitud no permitida." }, { status: 403 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
  return response;
}
