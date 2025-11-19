import { ReactNode } from "react";

export default function VisitsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Visitas a la página</h2>
        <span className="text-sm text-mutedForeground">
          Sección en construcción
        </span>
      </div>
      {children}
    </div>
  );
}
