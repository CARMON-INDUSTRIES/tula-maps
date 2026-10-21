import type { Metadata } from "next";
import { Camera, LockKeyhole } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import ListadoObras from "@/components/ListadoObras";

export const metadata: Metadata = { title: "Obras y fotografías · Tula de Allende" };

export default function ObrasPage() {
  return <main className="site-shell">
    <SiteHeader />
    <section className="page-intro">
      <div><span className="eyebrow"><Camera size={14} /> EVIDENCIA FOTOGRÁFICA</span><h1>Cada obra,<br /><span>una historia que mostrar.</span></h1><p>Encuentra una obra y consulta sus fotografías o agrega nuevas imágenes para documentar su avance.</p></div>
      <span className="admin-note"><LockKeyhole size={16} />La carga requiere contraseña de administración</span>
    </section>
    <ListadoObras />
    <footer className="site-footer"><span>Tula de Allende, Hidalgo</span><span>Fotografías almacenadas en la base de datos municipal.</span></footer>
  </main>;
}
