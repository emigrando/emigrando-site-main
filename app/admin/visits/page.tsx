// app/admin/page.tsx
export default function AdminDashboardPage() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="bg-card rounded-3xl shadow-card border border-cardBorder p-6 md:col-span-2">
        <h2 className="text-base font-semibold mb-2">Resumen general</h2>
        <p className="text-sm text-mutedForeground mb-4">
          Aquí verás un resumen rápido de clientes activos, casos en curso y
          próximas tareas importantes.
        </p>
        <div className="grid gap-4 md:grid-cols-3 text-sm">
          <div>
            <div className="text-xs text-mutedForeground mb-1">
              Clientes activos
            </div>
            <div className="text-xl font-semibold">0</div>
          </div>
          <div>
            <div className="text-xs text-mutedForeground mb-1">
              Casos en trámite
            </div>
            <div className="text-xl font-semibold">0</div>
          </div>
          <div>
            <div className="text-xs text-mutedForeground mb-1">
              Tareas urgentes
            </div>
            <div className="text-xl font-semibold">0</div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-3xl shadow-card border border-cardBorder p-6">
        <h2 className="text-base font-semibold mb-2">Facturación del mes</h2>
        <p className="text-sm text-mutedForeground mb-3">
          Total facturado en el mes actual.
        </p>
        <div className="text-2xl font-semibold mb-1">0,00 €</div>
        <div className="text-xs text-mutedForeground">
          Aquí luego conectamos con el módulo de facturas.
        </div>
      </div>
    </div>
  );
}
