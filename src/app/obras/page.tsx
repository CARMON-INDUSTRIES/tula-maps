import type { Metadata } from "next";
import { LockKeyhole } from "lucide-react";
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
    <section className="page-intro admin-intro" id="contenido">
      <div><h1>Obras y fotografías</h1><p>Encuentra una obra y consulta sus fotografías o agrega nuevas imágenes para documentar su avance.</p></div>
      <div className="admin-session-group"><span className="admin-note"><LockKeyhole size={16} />Sesión de administración activa</span><CerrarSesionObras /></div>
    </section>
    <ListadoObras />
    <footer className="site-footer"><span>Tula de Allende, Hidalgo</span><span>Administración de fotografías de obras públicas.</span></footer>
  </main>;
}
