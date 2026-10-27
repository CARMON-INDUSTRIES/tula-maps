"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, LockKeyhole, Maximize2 } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function AccesoObras({ initialLockedUntil = null }: { initialLockedUntil?: number | null }) {
  const dialog = useRef<HTMLDialogElement | null>(null);
  const lockTitle = useRef<HTMLHeadingElement | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lockedUntil, setLockedUntil] = useState<number | null>(initialLockedUntil);
  const [now, setNow] = useState(0);
  const [fullscreenNotice, setFullscreenNotice] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (lockedUntil) { lockTitle.current?.focus(); return; }
    if (!dialog.current?.open) dialog.current?.showModal();
  }, [lockedUntil]);
  useEffect(() => {
    if (!lockedUntil) return;
    const timer = setInterval(() => {
      const time = Date.now(); setNow(time);
      if (time >= lockedUntil) { setLockedUntil(null); setError(""); }
    }, 1000);
    return () => clearInterval(timer);
  }, [lockedUntil]);

  const enterFullscreen = async () => {
    try {
      if (!document.documentElement.requestFullscreen) throw new Error();
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      setFullscreenNotice("");
    } catch { setFullscreenNotice("El navegador no permitió activar pantalla completa. Puedes intentarlo con el botón o continuar aquí."); }
  };

  if (lockedUntil) {
    const seconds = now ? Math.max(0, Math.ceil((lockedUntil - now) / 1000)) : null;
    return <section className="access-blue-screen" aria-labelledby="blocked-title">
      <div className="blue-screen-content"><div className="blue-screen-face" aria-hidden="true">:(</div>
        <h1 id="blocked-title" ref={lockTitle} tabIndex={-1}>El acceso se ha bloqueado temporalmente.</h1>
        <p>Se introdujo una contraseña incorrecta tres veces. El mapa público sigue disponible; la administración de fotografías estará disponible al terminar la espera.</p>
        <p className="blue-screen-countdown">{seconds === null ? "Verificando tiempo de espera…" : `Puedes volver a intentarlo en ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}.`}</p>
        <div className="blue-screen-code"><span>Código de acceso: TRES_INTENTOS_INCORRECTOS</span><small>Este aviso pertenece al portal de obras. No es un error de tu computadora.</small></div>
        <div className="blue-screen-actions"><button type="button" onClick={enterFullscreen}><Maximize2 size={17} />Pantalla completa</button><Link href="/">Volver al mapa</Link></div>
        {fullscreenNotice && <p className="blue-screen-notice" role="status">{fullscreenNotice}</p>}
        <p className="blue-screen-note">Puedes salir de pantalla completa con Esc. Recargar la página conserva la espera de este navegador.</p>
      </div>
    </section>;
  }

  return <>
    <section className="access-placeholder"><LockKeyhole size={30} /><h1>Administración de fotografías</h1><p>Introduce la contraseña para consultar las obras y cargar imágenes.</p></section>
    <dialog className="access-dialog" ref={dialog} onCancel={event => event.preventDefault()} aria-labelledby="access-title">
      <span className="access-lock"><LockKeyhole size={26} /></span><span className="eyebrow">ACCESO DE ADMINISTRACIÓN</span>
      <h2 id="access-title">Obras y fotografías</h2><p>Ingresa la contraseña para acceder al listado y administrar las imágenes.</p>
      <form onSubmit={async event => {
        event.preventDefault(); setLoading(true); setError("");
        try {
          const response = await fetch("/api/admin/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
          const data = await response.json();
          if (response.status === 429 && Number.isFinite(data.lockedUntil)) {
            setPassword(""); setLockedUntil(data.lockedUntil); setLoading(false);
            await enterFullscreen();
            return;
          }
          if (!response.ok) {
            const remaining = Number.isInteger(data.intentosRestantes) ? ` Te quedan ${data.intentosRestantes} intentos.` : "";
            throw new Error((data.mensaje ?? "No se pudo iniciar sesión.") + remaining);
          }
          setPassword(""); router.refresh();
        } catch (error) {
          setError(error instanceof TypeError ? "No se pudo conectar con el servidor." : error instanceof Error ? error.message : "No se pudo iniciar sesión."); setLoading(false);
        }
      }}>
        <label className="upload-label">Contraseña<input type="password" autoComplete="current-password" autoFocus required maxLength={256} value={password} onChange={event => setPassword(event.target.value)} disabled={loading} /></label>
        {error && <p className="access-error" role="alert">{error}</p>}
        <button type="submit" className="primary-button" disabled={loading || !password}>{loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}{loading ? "Validando acceso…" : "Entrar"}</button>
      </form>
      <div className="access-theme-actions"><Link href="/" className="text-button">Volver al mapa</Link><ThemeToggle /></div>
    </dialog>
  </>;
}
