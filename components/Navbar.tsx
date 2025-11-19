"use client";

import { useCallback } from "react";

const NAV_ITEMS = [
  { label: "Servicios", target: "servicios" },
  { label: "Reconocimiento de títulos", target: "titulos" },
  { label: "Cómo trabajamos", target: "como-trabajamos" },
  { label: "Contacto", target: "contacto" },
];

function scrollToId(id: string) {
  if (typeof document === "undefined") return;
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export default function Navbar() {
  const handleClick = useCallback((target: string) => {
    scrollToId(target);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <button
          type="button"
          onClick={() => handleClick("servicios")}
          className="text-base font-semibold tracking-tight text-slate-900"
        >
          <span className="bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500 bg-clip-text text-transparent">
            Emigrando.de
          </span>
        </button>

        {/* Links */}
        <div className="flex items-center gap-6 text-sm text-slate-600">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.target}
              type="button"
              onClick={() => handleClick(item.target)}
              className="relative font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              {item.label}
              <span className="pointer-events-none absolute inset-x-0 -bottom-1 h-[2px] scale-x-0 bg-gradient-to-r from-sky-400 to-indigo-500 transition-transform duration-200 group-hover:scale-x-100" />
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
}
