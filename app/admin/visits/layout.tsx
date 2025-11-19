// app/admin/layout.tsx
import "../globals.css";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl py-8 px-4 md:px-6 lg:px-8">
        {/* Top bar */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Emigrando.de · Panel admin
            </h1>
            <p className="text-sm text-mutedForeground">
              Gestión de clientes, casos, facturación y contabilidad interna.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-mutedForeground">
            <span>Cache (Admin)</span>
          </div>
        </header>

        {/* Contenido principal */}
        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}
