"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "#servicios", label: "Servicios" },
  { href: "#titulos", label: "Reconocimiento de títulos" },
  { href: "#como-trabajamos", label: "Cómo trabajamos" },
  { href: "#contacto", label: "Contacto" },
  { href: "/dashboard/cliente", label: "Panel cliente (beta)" },
];

export default function Navbar() {
  const pathname = usePathname() || "";
  const isDashboard = pathname.startsWith("/dashboard");

  // Si estamos en /dashboard/... no mostramos el navbar público
  if (isDashboard) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100/50 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-2.5">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 text-xs font-semibold text-white shadow-md">
            DE
          </div>
          <span className="text-sm font-semibold tracking-tight">
            <span className="text-slate-900">Emigrando</span>
            <span className="text-violet-500">.de</span>
          </span>
        </Link>

        {/* Navegación desktop */}
        <nav className="hidden items-center gap-2 md:flex">
          {navLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="px-3 py-1.5 rounded-full text-[13px] font-medium text-slate-600 hover:bg-slate-100/70 hover:text-indigo-600 transition-all"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:block">
          <a
            href="#contacto"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(79,70,229,0.35)] transition-all hover:-translate-y-[1px] hover:shadow-[0_15px_40px_rgba(79,70,229,0.45)]"
          >
            Contactar asesor
          </a>
        </div>

        {/* Móvil */}
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
