// app/admin/page.tsx
import { Card } from "@/components/ui/Card";

export default function AdminDashboardPage() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="p-6 md:col-span-2">
        <h2 className="text-base font-semibold mb-2">Resumen de casos</h2>
        <p className="text-sm text-mutedForeground">
          Aquí luego mostraremos cuántos clientes activos tienes, cuántos casos
          en trámite, próximos plazos, etc.
        </p>
      </Card>

      <Card className="p-6">
        <h2 className="text-base font-semibold mb-2">Facturación</h2>
        <p className="text-sm text-mutedForeground mb-3">
          Resumen rápido de lo facturado este mes.
        </p>
        {/* aquí luego irá el total real */}
        <div className="text-2xl font-semibold">0,00 €</div>
      </Card>
    </div>
  );
}
