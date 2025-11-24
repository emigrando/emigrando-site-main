"use client";

import LogoutButton from "@/components/LogoutButton";
import { motion } from "framer-motion";
import DashboardGuard from "@/components/DashboardGuard";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function ClienteDashboardPage() {
  const estadoCaso = {
    numero: "EM-2025-00123",
    tipo: "Residencia · §25 Abs. 3 AufenthG",
    fase: "En revisión de autoridad",
    porcentaje: 65,
    ultimaActualizacion: "15.11.2025",
  };

  const hitos = [
    {
      fecha: "01.10.2025",
      titulo: "Primer contacto",
      detalle: "Nos contaste tu caso y revisamos la documentación inicial.",
      tipo: "info",
    },
    {
      fecha: "05.10.2025",
      titulo: "Análisis del caso",
      detalle:
        "Te enviamos la propuesta con los pasos a seguir y objetivos realistas.",
      tipo: "info",
    },
    {
      fecha: "12.10.2025",
      titulo: "Escrito enviado a la autoridad",
      detalle: "Se envió el escrito principal a la Ausländerbehörde.",
      tipo: "accion",
    },
    {
      fecha: "15.11.2025",
      titulo: "Respuesta parcial de la autoridad",
      detalle:
        "Recibimos respuesta inicial. Estamos preparando el siguiente paso.",
      tipo: "alerta",
    },
  ];

  const proximosPlazos = [
    {
      fecha: "30.11.2025",
      descripcion: "Plazo para respuesta a la autoridad",
      critico: true,
    },
    {
      fecha: "05.12.2025",
      descripcion: "Revisión interna de documentos actualizados",
      critico: false,
    },
  ];

  return (
    <DashboardGuard>
      <main className="min-h-screen bg-gradient-to-b from-[#f5f7fb] to-white text-slate-900">
        <section className="mx-auto max-w-6xl px-4 pt-20 pb-16 lg:pt-24 lg:pb-20">
          <div className="mb-6">
            <p className="text-xs font-medium text-sky-700 uppercase tracking-[0.18em]">
              Panel del cliente
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Seguimiento de tu caso
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Aquí ves el estado general de tu caso; las últimas acciones que
              hemos tomado; y los próximos plazos importantes. Más adelante este
              panel se conectará a tus datos reales con acceso seguro.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr] lg:items-start">
            {/* Columna izquierda: Estado general + línea de tiempo */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="space-y-6"
            >
              {/* Tarjeta estado general */}
              <div className="rounded-2xl border border-slate-100 bg-white/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Número de caso
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {estadoCaso.numero}
                    </p>
                  </div>
                  <div className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-medium text-sky-700">
                    {estadoCaso.tipo}
                  </div>
                </div>

                <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    {/* aquí va tu título y texto del panel cliente si algún día lo mueves aquí */}
                  </div>

                  <div className="mt-1 md:mt-0">
                    <LogoutButton />
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Estado actual
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {estadoCaso.fase}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Última actualización el {estadoCaso.ultimaActualizacion}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Avance aproximado
                    </p>
                    <div className="mt-2">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-violet-500 transition-all"
                          style={{ width: `${estadoCaso.porcentaje}%` }}
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Este porcentaje es orientativo; no es una garantía de
                        resultado; solo indica el avance del proceso.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Línea de tiempo de eventos */}
              <div className="rounded-2xl border border-slate-100 bg-white/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
                <h2 className="text-sm font-semibold text-slate-900">
                  Historial de tu caso
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Resumen de los pasos más importantes que hemos dado hasta
                  ahora.
                </p>

                <ol className="mt-4 space-y-4">
                  {hitos.map((hito, idx) => (
                    <li key={idx} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={
                            "mt-1 h-2 w-2 rounded-full border " +
                            (hito.tipo === "accion"
                              ? "bg-sky-500 border-sky-400"
                              : hito.tipo === "alerta"
                              ? "bg-amber-500 border-amber-400"
                              : "bg-slate-300 border-slate-300")
                          }
                        />
                        {idx < hitos.length - 1 && (
                          <div className="mt-1 h-full w-px flex-1 bg-slate-200" />
                        )}
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-slate-500">
                          {hito.fecha}
                        </p>
                        <p className="text-sm font-semibold text-slate-900">
                          {hito.titulo}
                        </p>
                        <p className="mt-1 text-xs text-slate-600">
                          {hito.detalle}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </motion.div>

            {/* Columna derecha: próximos plazos + contacto */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              className="space-y-6"
            >
              {/* Próximos plazos */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
                <h2 className="text-sm font-semibold text-slate-900">
                  Próximos plazos
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Fechas orientativas para que tengas claridad de lo que viene.
                </p>

                <ul className="mt-4 space-y-3">
                  {proximosPlazos.map((plazo, idx) => (
                    <li
                      key={idx}
                      className="flex items-start justify-between gap-3 rounded-xl bg-white/80 px-3 py-3 border border-slate-100"
                    >
                      <div>
                        <p className="text-[11px] font-medium text-slate-500">
                          {plazo.fecha}
                        </p>
                        <p className="text-xs text-slate-800">
                          {plazo.descripcion}
                        </p>
                      </div>
                      {plazo.critico && (
                        <span className="mt-1 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                          Importante
                        </span>
                      )}
                    </li>
                  ))}
                </ul>

                <p className="mt-3 text-[11px] text-slate-400">
                  Estos plazos no sustituyen las fechas oficiales de cartas o
                  Bescheide; siempre revisa las fechas exactas que indique la autoridad.
                </p>
              </div>

              {/* Bloque contacto rápido */}
              <div className="rounded-2xl border border-slate-900/40 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-900 p-5 text-slate-50 shadow-[0_22px_55px_rgba(15,23,42,0.65)]">
                <h2 className="text-sm font-semibold">
                  ¿Ves algo urgente o no entiendes una carta?
                </h2>
                <p className="mt-2 text-xs text-slate-200">
                  Si recibes una nueva carta; un plazo muy corto o algo que no
                  entiendas; puedes escribir directamente y adjuntar el
                  documento. En la siguiente versión de este panel, podrás subir
                  bescheide y cartas desde aquí mismo.
                </p>
                <div className="mt-4 flex flex-wrap gap-3 text-[11px]">
                  <a
                    href="https://wa.me/4915773684583"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-1.5 font-semibold text-white shadow-md hover:shadow-lg hover:-translate-y-[1px] transition-all"
                  >
                    WhatsApp
                  </a>
                  <a
                    href="https://t.me/Emigrando_de"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-full bg-sky-500 px-4 py-1.5 font-semibold text-white shadow-md hover:shadow-lg hover:-translate-y-[1px] transition-all"
                  >
                    Telegram
                  </a>
                  <a
                    href="/contacto"
                    className="inline-flex items-center justify-center rounded-full border border-slate-500/70 px-4 py-1.5 font-semibold text-[11px] text-slate-100 hover:bg-slate-800/70 transition-all"
                  >
                    Formulario detallado
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </DashboardGuard>
  );
}
