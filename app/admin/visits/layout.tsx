import { ReactNode } from "react";
import { Button } from "@/components/ui/Button";

export default function VisitsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Visitas a la página</h2>
        <Button variant="ghost">Exportar</Button>
      </div>
      {children}
    </div>
  );
}
