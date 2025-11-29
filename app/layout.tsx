// app/layout.tsx
import "./globals.css";
import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import CursorGlow from "@/components/CursorGlow";

export const metadata = {
  title: "Emigrando.de",
  description: "Asesoría migratoria clara, humana y profesional en Alemania",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#f5f7fb] text-slate-900 antialiased">
        <div className="relative min-h-screen overflow-hidden">

          {/* Fondo animado global */}
          <div className="hero-ambient" />
          <div className="hero-noise" />

          {/* Halo cursor */}
          <CursorGlow />

          {/* Contenido */}
          <div className="relative z-10 flex min-h-screen flex-col">
            <Navbar />

            <main className="flex-1">{children}</main>

            {/* FOOTER GLOBAL */}
            <footer className="mt-20 border-t border-white/40 bg-gradient-to-t from-slate-900/10 via-white/70 to-white/90 bg-white/70 backdrop-blur-2xl">
              <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 md:flex-row md:justify-between">

                {/* Columna izquierda */}
                <div className="max-w-md space-y-3 text-sm text-slate-600">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-indigo-700">
                    Emigrando.de
                  </p>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Acompañamos tu proceso migratorio en Alemania con claridad y estrategia.
                  </h2>
                  <p>
                    Paneles para clientes y asesores; documentación centralizada; historial de casos y comunicación ordenada.
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Este sitio no sustituye asesoría jurídica individual.
                  </p>
                </div>

                {/* Centro */}
                <div className="grid flex-1 grid-cols-2 gap-6 text-sm text-slate-600 md:grid-cols-3">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Plataforma
                    </p>
                    <ul className="mt-2 space-y-1.5 text-sm">
                      <li><a href="/auth/login" className="text-slate-700 hover:text-indigo-700">Acceso clientes</a></li>
                      <li><a href="/auth/register" className="text-slate-700 hover:text-indigo-700">Crear cuenta</a></li>
                      <li><a href="/dashboard/asesor" className="text-slate-700 hover:text-indigo-700">Área de asesores</a></li>
                    </ul>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Información
                    </p>
                    <ul className="mt-2 space-y-1.5 text-sm">
                      <li><a href="/kontakt" className="text-slate-700 hover:text-indigo-700">Contacto</a></li>
                      <li><a href="/agb" className="text-slate-700 hover:text-indigo-700">Condiciones</a></li>
                      <li><a href="/datenschutz" className="text-slate-700 hover:text-indigo-700">Protección de datos</a></li>
                      <li><a href="/impressum" className="text-slate-700 hover:text-indigo-700">Impressum</a></li>
                    </ul>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Próximamente
                    </p>
                    <ul className="mt-2 space-y-1.5 text-sm">
                      <li className="text-slate-700">Mensajes internos</li>
                      <li className="text-slate-700">Subida de Bescheide</li>
                      <li className="text-slate-700">App móvil</li>
                    </ul>
                  </div>
                </div>

                {/* Derecha */}
                <div className="w-full max-w-xs space-y-3 text-sm text-slate-600">
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    Contacto rápido
                  </p>
                  <p>Si tienes una situación urgente puedes escribirnos:</p>

                  <div className="flex gap-2">
                    <a
                      href="https://wa.me/"
                      className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-emerald-600"
                      target="_blank"
                    >
                      WhatsApp
                    </a>
                    <a
                      href="https://t.me/"
                      className="rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-sky-600"
                      target="_blank"
                    >
                      Telegram
                    </a>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/60 bg-white/70">
                <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-4 text-[11px] text-slate-500 md:flex-row md:justify-between">
                  <p>© {new Date().getFullYear()} Emigrando.de</p>
                  <p>Herramienta interna de acompañamiento jurídico y administrativo.</p>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
