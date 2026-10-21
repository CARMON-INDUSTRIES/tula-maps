import MapaObras from "@/components/MapaObras";
import { ArrowUpRight, MapPin } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";

export default function Home() {
  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="page-intro">
        <div><span className="eyebrow"><MapPin size={13} /> EL TERRITORIO, MÁS CERCA</span><h1>Las obras de tu comunidad,<br /><span>en un solo lugar.</span></h1><p>Explora Tula de Allende y conoce las obras públicas de cada comunidad. Selecciona una zona del mapa o búscala por su nombre.</p></div>
        <a className="intro-link" href="#explorar">Comenzar a explorar <ArrowUpRight size={18} /></a>
      </section>
      <div id="explorar" className="explorer-anchor">
      <MapaObras />
      </div>
      <footer className="site-footer"><span>Tula de Allende, Hidalgo</span><span>Información pública para una comunidad informada.</span></footer>
    </main>
  );
}
