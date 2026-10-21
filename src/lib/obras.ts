import type { Obra } from "../types/comunidad";

export interface ObraListado extends Obra {
  comunidadId: number | null;
  comunidadNombre: string;
}
export interface PaginaObras {
  items: ObraListado[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listarObras(page: number, buscar: string, signal?: AbortSignal): Promise<PaginaObras> {
  const base = (process.env.NEXT_PUBLIC_API_URL ?? "https://tula-maps.somee.com/api").replace(/\/+$/, "");
  const query = new URLSearchParams({ page: String(page), pageSize: "12", buscar: buscar.trim() });
  const response = await fetch(`${base}/obras?${query}`, { signal, cache: "no-store" });
  if (!response.ok) throw new Error(response.status === 404
    ? "El listado de obras aún no está disponible en esta API. Reinicia o publica el backend actualizado."
    : "El servidor no pudo consultar las obras. Intenta de nuevo.");
  const data = await response.json();
  if (!Array.isArray(data?.items) || !Number.isInteger(data.total) || data.total < 0
    || !Number.isInteger(data.page) || data.page < 1 || !Number.isInteger(data.pageSize) || data.pageSize < 1
    || data.items.some((item: ObraListado) => !Number.isInteger(item?.id) || item.id < 1 || typeof item.obraAccionPrograma !== "string")) {
    throw new Error("El servidor devolvió un listado de obras inválido.");
  }
  return data;
}
