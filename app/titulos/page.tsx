// app/titulos/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Reconocimiento de títulos | Emigrando.de",
  description:
    "Acompañamiento para el reconocimiento de títulos universitarios, técnicos y profesionales en Alemania.",
};

export default function TitulosPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold">Reconocimiento de títulos</h1>

      <div className="mt-6 grid lg:grid-cols-2 gap-8">
        <div className="rounded-2xl border border-gray-200 p-6">
          <h3 className="font-bold text-lg">
            Universitarios, técnicos y profesionales
          </h3>
          <p className="mt-2 text-sm text-brand-muted">
            Te guiamos para el reconocimiento de{" "}
            <b>licenciaturas, ingenierías, medicina, enfermería</b> y otras
            profesiones. Revisamos tu caso y te damos un plan claro. No
            publicamos checklists ni rutas completas: los requisitos detallados
            se entregan tras contratar el servicio.
          </p>

          <div className="mt-5 flex gap-3">
            <Link
              href="/contacto"
              className="rounded-full px-5 py-3 text-sm font-semibold bg-brand-primary hover:brightness-95 shadow"
            >
              Solicitar evaluación
            </Link>
            <Link
              href="/contacto"
              className="rounded-full px-5 py-3 text-sm font-semibold border-2 border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white"
            >
              Hablar con un asesor
            </Link>
          </div>
        </div>

        <ul className="rounded-2xl bg-brand-soft p-6 border border-gray-200 text-sm text-brand-muted space-y-2">
          <li>Revisión de títulos, pensum y cargas horarias.</li>
          <li>Orientación sobre traducciones y legalizaciones.</li>
          <li>ZAB / cámaras profesionales / autoridades regionales.</li>
          <li>Plan de homologación o equiparación, pasos y tiempos.</li>
          <li>Acompañamiento para postular y responder requerimientos.</li>
        </ul>
      </div>
    </main>
  );
}
