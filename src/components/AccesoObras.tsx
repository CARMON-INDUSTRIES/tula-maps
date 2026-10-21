"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, LockKeyhole } from "lucide-react";

export default function AccesoObras() {
  const dialog = useRef<HTMLDialogElement | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  useEffect(() => { if (!dialog.current?.open) dialog.current?.showModal(); }, []);

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
          if (!response.ok) throw new Error(data.mensaje ?? "No se pudo iniciar sesión.");
          setPassword(""); router.refresh();
        } catch (error) {
          setError(error instanceof TypeError ? "No se pudo conectar con el servidor." : error instanceof Error ? error.message : "No se pudo iniciar sesión."); setLoading(false);
        }
      }}>
        <label className="upload-label">Contraseña<input type="password" autoComplete="current-password" autoFocus required maxLength={256} value={password} onChange={event => setPassword(event.target.value)} disabled={loading} /></label>
        {error && <p className="access-error" role="alert">{error}</p>}
        <button type="submit" className="primary-button" disabled={loading || !password}>{loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}{loading ? "Validando acceso…" : "Entrar"}</button>
      </form>
      <Link href="/" className="text-button">Volver al mapa</Link>
    </dialog>
  </>;
}
