"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function CerrarSesionObras() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  return <div className="admin-session-actions"><button className="tool-button" disabled={loading} onClick={async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin/session", { method: "DELETE" });
      if (!response.ok) throw new Error();
      router.refresh();
    } catch { setError("No se pudo cerrar la sesión. Intenta de nuevo."); setLoading(false); }
  }}><LogOut size={15} />{loading ? "Cerrando…" : "Cerrar sesión"}</button>{error && <p role="alert">{error}</p>}</div>;
}
