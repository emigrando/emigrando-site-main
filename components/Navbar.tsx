"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/80 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo / marca */}
        <Link href="/" className="inline-flex items-center gap-3">
          {/* Circulito DE más marcado */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-[0.7rem] font-semibold text-white shadow-md shadow-sky-500/35">
            DE
          </div>

          {/* Pastilla Emigrando.de más elegante */}
          <div className="rounded-full border border-white/70 bg-slate-900/5 px-4 py-1.5 shadow-sm shadow-slate-900/5">
            <span className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-600 bg-clip-text text-sm font-semibold text-transparent tracking-tight">
              Emigrando.de
            </span>
          </div>
        </Link>

        {/* Navegación */}
        <nav className="hidden items-center gap-6 text-sm text-slate-600 sm:flex">
          <Link
            href="#servicios"
            className="transition-colors hover:text-indigo-600"
          >
            Servicios
          </Link>
          <Link
            href="#titulos"
            className="transition-colors hover:text-indigo-600"
          >
            Títulos
          </Link>
          <Link
            href="#como-trabajamos"
            className="transition-colors hover:text-indigo-600"
          >
            Cómo trabajamos
          </Link>
          <Link
            href="#contacto"
            className="transition-colors hover:text-indigo-600"
          >
            Contacto
          </Link>
        </nav>

        {/* Botón principal */}
        <Link
          href="#contacto"
          className="hidden rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/40 hover:brightness-110 sm:inline-flex"
        >
          Contactar asesor
        </Link>
      </div>
    </header>
  );
}
