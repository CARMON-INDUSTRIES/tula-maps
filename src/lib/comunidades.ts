import type { Comunidad } from "../types/comunidad";

export async function obtenerComunidad(
  id: number,
  signal?: AbortSignal,
): Promise<Comunidad> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Esta figura no tiene un ID de comunidad válido.");
  }

  const baseUrl = (
    process.env.NEXT_PUBLIC_API_URL ?? "https://tula-maps.somee.com/api"
  ).replace(/\/+$/, "");

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/comunidades/${id}`, { signal });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error(
      "No se pudo conectar con el servidor de obras. Intenta de nuevo más tarde.",
    );
  }

  if (response.status === 404) {
    throw new Error("La comunidad no existe en el catálogo del servidor.");
  }
  if (!response.ok) {
    throw new Error("El servidor no pudo consultar las obras. Intenta de nuevo.");
  }

  const data = await response.json().catch(() => null);
  if (!data || typeof data.nombre !== "string" || !Array.isArray(data.obras)) {
    throw new Error("El servidor devolvió una respuesta de comunidad inválida.");
  }
  return data;
}
