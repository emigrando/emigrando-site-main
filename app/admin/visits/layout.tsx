// app/admin/layout.tsx
import "../globals.css";
import { ReactNode } from "react";
import { Button } from "@/components/ui/Button";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl py-8 px-4 md:px-6 lg:px-8">
        {/* Top bar */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Emigrando.de Admin
            </h1>
            <p className="text-sm text-mutedForeground">
              Panel interno · Casos · Facturación · Contabilidad
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost">Configuración</Button>
            <Button>Salir</Button>
          </div>
        </header>

        {/* Main content: children */}
        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}
