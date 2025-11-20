'use client';

import Link from "next/link";

const navLinks = [
  { href: "#servicios", label: "Servicios" },
  { href: "#titulos", label: "Reconocimiento de títulos" },
  { href: "#como-trabajamos", label: "Cómo trabajamos" },
  { href: "#contacto", label: "Contacto" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-100/60 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5">
        {/* Marca / logo */}
        <Link href="/" className="flex items-center gap-2">
          {/* Aquí luego cambiamos por tu logo */}
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-xs font-semibold text-white shadow-md">
            DE
          </div>
          <span className="text-sm font-semibold tracking-tight">
            <span className="text-slate-900">Emigrando</span>
            <span className="text-violet-500">.de</span>
          </span>
        </Link>

        {/* Navegación escritorio */}
        <nav className="hidden items-center gap-7 text-sm text-slate-600 md:flex">
          {navLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="relative transition-colors hover:text-indigo-600"
            >
              {item.label}
            </a>
            <a
              href="/impressum"
              className="text-xs text-slate-500 hover:text-indigo-600 transition-colors"
            >
              Impressum
            </a>
            <a
              href="/datenschutz"
              className="text-xs text-slate-500 hover:text-indigo-600 transition-colors"
            >
              Datenschutz
            </a>
            <a
              href="/agb"
              className="text-xs text-slate-500 hover:text-indigo-600 transition-colors"
            >
              AGB
            </a>
          ))}
        </nav>

        {/* CTA escritorio */}
        <div className="hidden md:block">
          <a
            href="#contacto"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:-translate-y-[1px] transition-all"
          >
            Contactar asesor
          </a>
        </div>

        {/* Vista móvil: solo botón compacto */}
        <div className="md:hidden">
          <a
            href="#contacto"
            className="inline-flex items-center justify-center rounded-full border border-indigo-200 bg-white/90 px-3 py-1.5 text-xs font-medium text-indigo-600 shadow-sm"
          >
            Contactar
          </a>
        </div>
      </div>
    </header>
  );
}
