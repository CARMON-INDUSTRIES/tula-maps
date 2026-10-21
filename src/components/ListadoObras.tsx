"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Building2, Loader2, MapPin, Search, X } from "lucide-react";
import { listarObras, type PaginaObras } from "@/lib/obras";
import ImagenesObra from "@/components/ImagenesObra";

export default function ListadoObras() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState({ page: 1, buscar: "", retry: 0 });
  const [data, setData] = useState<PaginaObras | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.buscar === search.trim()) return;
      setLoading(true);
      setError("");
      setQuery(previous => ({ ...previous, page: 1, buscar: search.trim() }));
    }, 300);
    return () => clearTimeout(timer);
  }, [search, query.buscar]);

  useEffect(() => {
    const controller = new AbortController();
    listarObras(query.page, query.buscar, controller.signal)
      .then(result => {
        if (controller.signal.aborted) return;
        setData(result); setError(""); setLoading(false);
      })
      .catch(error => {
        if (controller.signal.aborted) return;
        setError(error instanceof TypeError ? "No se pudo conectar con el servidor de obras. Revisa la conexión e intenta de nuevo." : error instanceof Error ? error.message : "No se pudieron cargar las obras.");
        setLoading(false);
      });
    return () => controller.abort();
  }, [query]);

  const changePage = (page: number) => { setLoading(true); setError(""); setQuery(previous => ({ ...previous, page })); };
  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const busy = loading || search.trim() !== query.buscar;
  return <section className="works-directory" aria-label="Listado de obras">
    <div className="directory-toolbar"><div><h2><Building2 size={19} />Obras registradas</h2><p>{data ? `${data.total} obras${query.buscar ? " encontradas" : " en el catálogo"}` : "Consulta el catálogo de obras públicas"}</p></div>
      <div className="directory-search"><Search size={17} /><input aria-label="Buscar obras" maxLength={120} value={search} placeholder="Buscar obra, comunidad o dirección…" onChange={e => setSearch(e.target.value)} />{search && <button className="icon-button" aria-label="Limpiar búsqueda de obras" onClick={() => setSearch("")}><X size={16} /></button>}</div>
    </div>
    <div className="directory-content" aria-busy={busy}>
      {busy ? <div className="empty-state" role="status"><Loader2 size={26} className="animate-spin" /><p>Cargando obras…</p></div> : error ? <div className="empty-state" role="alert"><Building2 size={28} /><p>{error}</p><button className="primary-button" onClick={() => { setLoading(true); setError(""); setQuery(previous => ({ ...previous, retry: previous.retry + 1 })); }}>Reintentar</button></div> : !data?.items.length ? <div className="empty-state"><Search size={30} /><h3>{query.buscar ? "No encontramos obras con ese nombre" : "Aún no hay obras registradas"}</h3><p>{query.buscar ? "Prueba con el nombre de una comunidad o con otro término." : "Las obras aparecerán aquí cuando estén registradas."}</p>{query.buscar && <button className="text-button" onClick={() => setSearch("")}>Ver todas las obras</button>}</div> : <div className="directory-grid">
        {data.items.map(obra => <article className="work-card directory-card" key={obra.id}>
          <div className="work-meta"><span className={"work-status" + (/concluid|terminad/i.test(obra.estatus) ? " completed" : "")}>{obra.estatus || "Sin estatus"}</span><span>{obra.anio ?? "Sin año"} · #{obra.id}</span></div>
          <p className="directory-community"><MapPin size={13} />{obra.comunidadNombre || "Sin comunidad asignada"}</p>
          <h3>{obra.obraAccionPrograma}</h3>
          <dl className="work-details"><div><dt>Tipo de intervención</dt><dd>{obra.tipoIntervencion || "No disponible"}</dd></div><div><dt>Dirección</dt><dd>{obra.direccion || "No disponible"}</dd></div><div className="detail-wide"><dt>Ubicación</dt><dd>{obra.localidadUbicacion || "No disponible"}</dd></div></dl>
          <ImagenesObra obraId={obra.id} nombre={obra.obraAccionPrograma} administrar />
        </article>)}
      </div>}
    </div>
    {data && !error && <nav className="directory-pagination" aria-label="Paginación de obras"><span>Página {data.page} de {pages}</span><div><button className="tool-button" disabled={busy || data.page <= 1} onClick={() => changePage(data.page - 1)}><ArrowLeft size={15} />Anterior</button><button className="tool-button" disabled={busy || data.page >= pages} onClick={() => changePage(data.page + 1)}>Siguiente<ArrowRight size={15} /></button></div></nav>}
  </section>;
}
