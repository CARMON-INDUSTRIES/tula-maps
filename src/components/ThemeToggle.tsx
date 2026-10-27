"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return <button type="button" className="theme-toggle" aria-label="Cambiar entre modo claro y oscuro"
    onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
    <Moon className="theme-moon" size={17} aria-hidden="true" />
    <Sun className="theme-sun" size={17} aria-hidden="true" />
    <span className="theme-light-label">Modo oscuro</span><span className="theme-dark-label">Modo claro</span>
  </button>;
}
