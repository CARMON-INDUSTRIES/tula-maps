import Link from "next/link";
import { Landmark } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function SiteHeader() {
  return <header className="site-header">
    <Link href="/" className="brand" aria-label="Obras Tula, inicio"><span className="brand-emblem"><Landmark size={25} strokeWidth={1.6} /></span><span><strong>TULA DE ALLENDE</strong><small>Obras públicas · Gobierno municipal</small></span></Link>
    <ThemeToggle />
  </header>;
}
