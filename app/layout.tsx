import "./globals.css";
import Navbar from "@/components/Navbar";
import { ReactNode } from "react";

export const metadata = {
  title: "Emigrando.de",
  description: "Asesoría migratoria clara, humana y profesional en Alemania",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        {/* NAVBAR GLOBAL */}
        <Navbar />

        {/* CONTENIDO */}
        <main>{children}</main>

        {/* FOOTER GLASS · ESTILO VISION PRO */}
        <footer className="mt-20 border-t border-white/40 bg-gradient-to-t from-slate-900/10 via-white/60 to-white/80 bg-white/50 backdrop-blur-2xl">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row md:items-center md:justify-between">
            {/* Marca izquierda */}
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10">
                {/* Halo suave */}
                <div className="absolute inset-0 rounded-full bg-sky-400/30 blur-lg" />
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-xs font-semibold text-white shadow-[0_10px_30px_rgba(15,23,42,0.45)]">
                  DE
                </div>
              </div>
              <div className="rounded-2xl border border-white/60 bg-white/40 px-4 py-2 shadow-[0_10px_30px_rgba(15,23,42,0.18)]">
                <p className="text-xs font-medium text-slate-700">
                  Emigrando.de
                </p>
                <p className="text-[11px] text-slate-500">
                  Acompañamiento migratorio claro y humano en Alemania
                </p>
              </div>
            </div>
            {/* Enlaces legales */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <a href="/impressum" className="hover:text-slate-700">
                Impressum
              </a>
              <a href="/datenschutz" className="hover:text-slate-700">
                Datenschutz
              </a>
              <a href="/agb" className="hover:text-slate-700">
                AGB
               </a>
              </div>
            {/* Iconos derecha con rebote iOS */}
            <div className="flex items-center gap-5">
              {/* WhatsApp */}
              <a
                href="https://wa.me/4915773684583"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="group relative inline-flex"
              >
                <span className="pointer-events-none absolute inset-0 rounded-full bg-emerald-400/0 blur-lg transition group-hover:bg-emerald-400/35" />
                <img
                  src="/icons/whatsapp.svg"
                  alt="WhatsApp"
                  className="relative h-7 w-7 transform transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:scale-110"
                />
              </a>

              {/* Telegram */}
              <a
                href="https://t.me/Emigrando_de"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="group relative inline-flex"
              >
                <span className="pointer-events-none absolute inset-0 rounded-full bg-sky-400/0 blur-lg transition group-hover:bg-sky-400/35" />
                <img
                  src="/icons/telegram.svg"
                  alt="Telegram"
                  className="relative h-7 w-7 transform transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:scale-110"
                />
              </a>

              {/* Google Play (próximamente) */}
              <a
                href="#"
                aria-label="Google Play (pronto)"
                className="group inline-flex cursor-default items-center opacity-45 transition"
              >
                <img
                  src="/icons/google-play.svg"
                  alt="Google Play"
                  className="h-[32px] transform transition-transform duration-200 ease-out group-hover:scale-105"
                />
              </a>

              {/* App Store (próximamente) */}
              <a
                href="#"
                aria-label="App Store (pronto)"
                className="group inline-flex cursor-default items-center opacity-45 transition"
              >
                <img
                  src="/icons/app-store.svg"
                  alt="App Store"
                  className="h-[32px] transform transition-transform duration-200 ease-out group-hover:scale-105"
                />
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
