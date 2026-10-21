export interface ImagenObra {
  id: number;
  nombreArchivo: string | null;
}

export const MAX_IMAGEN_BYTES = 5 * 1024 * 1024;
export const MAX_IMAGENES = 10;

function rutaImagenes(obraId: number) {
  if (!Number.isInteger(obraId) || obraId <= 0) throw new Error("La obra no tiene un ID válido.");
  const base = (process.env.NEXT_PUBLIC_API_URL ?? "https://tula-maps.somee.com/api").replace(/\/+$/, "");
  return `${base}/obras/${obraId}/imagenes`;
}

export function urlImagen(obraId: number, imagenId: number) {
  return `${rutaImagenes(obraId)}/${imagenId}/contenido`;
}

async function respuestaImagenes(response: Response): Promise<ImagenObra[]> {
  if (!response.ok) {
    const problem = await response.json().catch(() => null);
    throw new Error(problem?.mensaje ?? (response.status === 413
      ? "El servidor rechazó el tamaño del envío. Intenta con menos imágenes."
      : "No se pudieron consultar o guardar las imágenes. Intenta de nuevo."));
  }
  const data = await response.json();
  if (!Array.isArray(data) || data.some(i => !Number.isInteger(i?.id) || i.id <= 0)) {
    throw new Error("El servidor devolvió un listado de imágenes inválido.");
  }
  return data;
}

export async function listarImagenes(obraId: number, signal?: AbortSignal) {
  return respuestaImagenes(await fetch(rutaImagenes(obraId), { signal, cache: "no-store" }));
}

export function validarImagenes(archivos: File[]) {
  if (!archivos.length || archivos.length > MAX_IMAGENES) throw new Error("Selecciona entre 1 y 10 imágenes.");
  for (const archivo of archivos) {
    if (!archivo.size || archivo.size > MAX_IMAGEN_BYTES) throw new Error(`«${archivo.name}» debe pesar entre 1 byte y 5 MB.`);
    if (!["image/jpeg", "image/png", "image/webp"].includes(archivo.type)) throw new Error(`«${archivo.name}» debe ser JPG, PNG o WebP.`);
  }
}

export async function subirImagenes(obraId: number, archivos: File[], signal?: AbortSignal) {
  if (!Number.isInteger(obraId) || obraId <= 0) throw new Error("La obra no tiene un ID válido.");
  validarImagenes(archivos);
  const form = new FormData();
  archivos.forEach(archivo => form.append("archivos", archivo));
  return respuestaImagenes(await fetch(`/api/admin/obras/${obraId}/imagenes`, {
    method: "POST",
    body: form,
    signal,
  }));
}
