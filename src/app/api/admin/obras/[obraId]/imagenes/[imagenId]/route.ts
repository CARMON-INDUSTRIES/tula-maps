import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, isAdminSession } from "@/lib/admin-session";

export const runtime = "nodejs";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ obraId: string; imagenId: string }> }) {
  if (!isAdminSession(request.cookies.get(ADMIN_COOKIE)?.value)) return NextResponse.json({ mensaje: "Tu sesión venció. Vuelve a entrar a /obras con la contraseña." }, { status: 401 });
  if (request.headers.get("origin") !== request.nextUrl.origin) return NextResponse.json({ mensaje: "Solicitud no permitida." }, { status: 403 });
  const { obraId, imagenId } = await params;
  if (![obraId, imagenId].every(id => /^[1-9]\d*$/.test(id) && Number.isSafeInteger(Number(id)))) return NextResponse.json({ mensaje: "Obra o imagen inválida." }, { status: 400 });
  const key = process.env.OBRAS_UPLOAD_KEY;
  if (!key) return NextResponse.json({ mensaje: "La administración de imágenes no está configurada en el servidor." }, { status: 503 });
  const base = (process.env.OBRAS_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "https://tula-maps.somee.com/api").replace(/\/+$/, "");
  try {
    const response = await fetch(`${base}/obras/${obraId}/imagenes/${imagenId}`, { method: "DELETE", headers: { "X-Upload-Key": key }, signal: request.signal });
    if (response.status === 204) return new Response(null, { status: 204 });
    const problem = await response.json().catch(() => null);
    return NextResponse.json({ mensaje: problem?.mensaje ?? "No se pudo eliminar la imagen. Intenta de nuevo." }, { status: response.status >= 400 ? response.status : 502 });
  } catch {
    return NextResponse.json({ mensaje: "No se pudo conectar con el servidor de imágenes. Intenta de nuevo." }, { status: 502 });
  }
}
