// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Emigrando.de",
  description: "Asesoría migratoria y social en Alemania",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">
        {/* Header / Navbar */}
        <header className="sticky top-0 z-20 backdrop-blur bg-white/80 border-b border-gray-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <img src="/logo.svg" alt="Emigrando.de" className="h-9 w-9" />
              <span className="font-extrabold tracking-tight text-lg">Emigrando.de</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8 text-sm">
              <Link href="/#servicios" className="hover:text-brand-accent">Servicios</Link>
              <Link href="/titulos" className="hover:text-brand-accent">Títulos</Link>
              <Link href="/#proceso" className="hover:text-brand-accent">Cómo trabajamos</Link>
              <Link href="/contacto" className="hover:text-brand-accent">Contacto</Link>
            </nav>

            <Link
              href="/contacto"
              className="rounded-full px-4 py-2 text-sm font-semibold bg-brand-primary hover:brightness-95 shadow"
            >
              Contactar asesor
            </Link>
          </div>
        </header>

        {/* Page content */}
        {children}

        {/* Footer */}
        <footer className="py-10 bg-white border-t border-gray-100 mt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8 text-sm">
            <div>
              <div className="font-extrabold">Emigrando.de</div>
              <p className="mt-2 text-brand-muted">Augsburg · info@emigrando.de</p>
            </div>

            <div className="space-y-2">
              <a className="hover:underline" href="/impressum">Impressum</a><br />
              <a className="hover:underline" href="/datenschutz">Datenschutz</a><br />
              <a className="hover:underline" href="/agb">AGB</a>
            </div>

            <div className="text-brand-muted">
              © {new Date().getFullYear()} Emigrando.de
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
