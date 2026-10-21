import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, isAdminSession } from "@/lib/admin-session";

export const runtime = "nodejs";

export async function POST(request: NextRequest, { params }: { params: Promise<{ obraId: string }> }) {
  if (!isAdminSession(request.cookies.get(ADMIN_COOKIE)?.value)) return NextResponse.json({ mensaje: "Tu sesión venció. Vuelve a entrar a /obras con la contraseña." }, { status: 401 });
  if (request.headers.get("origin") !== request.nextUrl.origin) return NextResponse.json({ mensaje: "Solicitud no permitida." }, { status: 403 });
  const { obraId } = await params;
  if (!/^[1-9]\d*$/.test(obraId) || !Number.isSafeInteger(Number(obraId))) return NextResponse.json({ mensaje: "Obra inválida." }, { status: 400 });
  const key = process.env.OBRAS_UPLOAD_KEY;
  if (!key) return NextResponse.json({ mensaje: "La carga no está configurada en el servidor." }, { status: 503 });
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.startsWith("multipart/form-data;")) return NextResponse.json({ mensaje: "Se esperaba un formulario de imágenes." }, { status: 415 });
  if (Number(request.headers.get("content-length") ?? 0) > 53 * 1024 * 1024) return NextResponse.json({ mensaje: "El envío supera el tamaño permitido." }, { status: 413 });
  const base = (process.env.OBRAS_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "https://tula-maps.somee.com/api").replace(/\/+$/, "");
  try {
    const response = await fetch(`${base}/obras/${obraId}/imagenes`, {
      method: "POST", headers: { "Content-Type": contentType, "X-Upload-Key": key },
      body: request.body, duplex: "half", signal: request.signal,
    } as RequestInit & { duplex: "half" });
    return new Response(response.body, {
      status: response.status,
      headers: { "Content-Type": response.headers.get("content-type") ?? "application/json", "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ mensaje: "No se pudo conectar con el servidor de imágenes. Intenta de nuevo." }, { status: 502 });
  }
}
