import type { Metadata } from "next";
import { Camera, LockKeyhole } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import ListadoObras from "@/components/ListadoObras";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAdminSession, LOGIN_ATTEMPTS_COOKIE, MAX_LOGIN_ATTEMPTS, readLoginAttempts } from "@/lib/admin-session";
import AccesoObras from "@/components/AccesoObras";
import CerrarSesionObras from "@/components/CerrarSesionObras";

export const metadata: Metadata = { title: "Obras y fotografías · Tula de Allende" };

export default async function ObrasPage() {
  const cookieJar = await cookies();
  if (!isAdminSession(cookieJar.get(ADMIN_COOKIE)?.value)) {
    const attempts = readLoginAttempts(cookieJar.get(LOGIN_ATTEMPTS_COOKIE)?.value);
    return <main className="site-shell"><SiteHeader /><AccesoObras initialLockedUntil={attempts.failed >= MAX_LOGIN_ATTEMPTS ? attempts.expires * 1000 : null} /></main>;
  }
  return <main className="site-shell">
    <SiteHeader />
    <section className="page-intro">
      <div><span className="eyebrow"><Camera size={14} /> EVIDENCIA FOTOGRÁFICA</span><p>Encuentra una obra y consulta sus fotografías o agrega nuevas imágenes para documentar su avance.</p></div>
      <div><span className="admin-note"><LockKeyhole size={16} />Sesión de administración activa</span><CerrarSesionObras /></div>
    </section>
    <ListadoObras />
    <footer className="site-footer"><span>Tula de Allende, Hidalgo</span><span>Fotografías almacenadas en la base de datos municipal.</span></footer>
  </main>;
}
