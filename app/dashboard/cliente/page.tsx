"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import LogoutButton from "@/components/LogoutButton";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

interface CaseRow {
  id: string;
  case_code: string | null;
  tipo: string | null;
  client_progress_percent: number | null;
  client_phase_label: string | null;
  client_last_update: string | null;
  created_at?: string;
}

interface CaseEventRow {
  id: string;
  created_at: string;
  title: string | null;
  description: string | null;
  event_type: string | null;
  visible_for_client: boolean | null;
}

export default function ClienteDashboardPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [caseData, setCaseData] = useState<CaseRow | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);

  const [events, setEvents] = useState<CaseEventRow[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      // 1) Verificar usuario autenticado
      const { data: userData, error: authError } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (authError || !userData?.user) {
        router.replace("/auth/login");
        setCheckingAuth(false);
        setLoading(false);
        return;
      }

      const userId = userData.user.id;

      // 2) Cargar perfil para saludo
      const { data: profileRow } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", userId)
        .maybeSingle();

      if (!isMounted) return;

      if (profileRow?.first_name) {
        setFirstName(profileRow.first_name);
      }

      // 3) Buscar el caso más reciente de este cliente
      const { data: caseRow, error: caseError } = await supabase
        .from("cases")
        .select(
          "id, case_code, tipo, client_progress_percent, client_phase_label, client_last_update, created_at"
        )
        .eq("client_user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!isMounted) return;

      if (caseError) {
        setErr(caseError.message);
        setLoading(false);
        setCheckingAuth(false);
        setEventsLoading(false);
        return;
      }

      if (!caseRow) {
        setCaseData(null);
        setLoading(false);
        setCheckingAuth(false);
        setEvents([]);
        setEventsLoading(false);
        return;
      }

      const c = caseRow as CaseRow;
      setCaseData(c);
      setLoading(false);
      setCheckingAuth(false);

      // 4) Cargar historial visible para el cliente
      setEventsLoading(true);
      const { data: eventsRows, error: eventsError } = await supabase
        .from("case_events")
        .select(
          "id, created_at, title, description, event_type, visible_for_client"
        )
        .eq("case_id", c.id)
        .eq("visible_for_client", true)
        .order("created_at", { ascending: true });

      if (!isMounted) return;

      if (eventsError) {
        console.error("Error cargando historial de caso para cliente:", eventsError.message);
        setEvents([]);
        setEventsLoading(false);
        return;
      }

      setEvents((eventsRows || []) as CaseEventRow[]);
      setEventsLoading(false);
    }

    init();

    return () => {
      isMounted = false;
    };
  }, [router, supabase]);

  if (checkingAuth) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f5f7fb] to-white px-4">
        <div className="rounded-2xl border border-slate-200 bg-white/90 px-6 py-4 shadow-md text-sm text-slate-600">
          Verificando tu acceso seguro...
        </div>
      </main>
    );
  }

  // Valores derivados para el panel
  const progressRaw = caseData?.client_progress_percent ?? 0;
  const progress =
    typeof progressRaw === "number"
      ? Math.min(100, Math.max(0, progressRaw))
      : 0;

  const fase =
    caseData?.client_phase_label ||
    "Estamos revisando tu caso y organizando los próximos pasos.";

  const lastUpdateSource =
    caseData?.client_last_update || caseData?.created_at || null;

  const ultimaActualizacion = lastUpdateSource
    ? new Date(lastUpdateSource).toLocaleDateString("de-DE")
    : "Sin fecha registrada";

  // Número de caso: preferimos case_code; si no hay, una versión corta del UUID
  const numeroCaso =
    caseData?.case_code ||
    (caseData?.id
      ? `CAS-${caseData.id.slice(-8).toUpperCase()}`
      : "Aún sin número interno asignado");

  const tipoCaso =
    caseData?.tipo || "Caso migratorio / social en proceso de análisis";

  // Por ahora mantenemos plazos orientativos estáticos
  const proximosPlazos = [
    {
      fecha: "30.11.2025",
      descripcion: "Fecha orientativa para revisar respuesta de la autoridad",
      critico: true,
    },
    {
      fecha: "05.12.2025",
      descripcion: "Revisión interna de nuevos documentos o cartas",
      critico: false,
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f5f7fb] to-white text-slate-900">
      <section className="mx-auto max-w-6xl px-4 pt-20 pb-16 lg:pt-24 lg:pb-20">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-medium text-sky-700 uppercase tracking-[0.18em]">
              Panel del cliente
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {firstName ? `Hola, ${firstName}` : "Hola"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Aquí ves el estado general de tu caso; las últimas acciones y los
              próximos pasos que estamos manejando. Esta información se
              actualiza desde nuestro panel interno.
            </p>

            <div className="mt-3">
              <button
                onClick={() => router.push("/dashboard/cliente/intake")}
                className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-1.5 text-[11px] font-semibold text-white shadow-md hover:bg-indigo-700 hover:shadow-lg transition"
              >
                Completar o actualizar mis datos
              </button>
            </div>
          </div>
          <div className="mt-1 md:mt-0">
            <LogoutButton />
          </div>
        </div>

        {loading && (
          <p className="text-sm text-slate-600">
            Cargando la información de tu caso...
          </p>
        )}

        {!loading && err && (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            Hubo un problema al cargar los datos de tu caso: {err}
          </div>
        )}

        {!loading && !err && !caseData && (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Todavía no hay un caso vinculado a tu usuario en nuestro sistema.
            Si ya hablamos y nos enviaste documentación; probablemente estamos
            terminando de crear tu expediente interno. Si ves esto por mucho
            tiempo; escríbenos directamente o completa tus datos personales con
            el botón de arriba.
          </div>
        )}

        {/* Solo mostramos el panel completo si hay caso */}
        {!loading && !err && caseData && (
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
                      Número interno de caso
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {numeroCaso}
                    </p>
                  </div>
                  <div className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-medium text-sky-700">
                    {tipoCaso}
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Estado actual
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {fase}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Última actualización registrada: {ultimaActualizacion}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Avance aproximado del proceso
                    </p>
                    <div className="mt-2">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-violet-500 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Progreso estimado:{" "}
                        <span className="font-semibold">{progress}%</span>. Este
                        valor es orientativo; no es una promesa de resultado; refleja
                        la etapa en la que está tu caso dentro de nuestro trabajo
                        interno.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Línea de tiempo basada en case_events visibles */}
              <div className="rounded-2xl border border-slate-100 bg-white/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
                <h2 className="text-sm font-semibold text-slate-900">
                  Historial de tu caso
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Aquí verás un resumen de los pasos más importantes que hayamos
                  marcado para que el cliente pueda ver. No muestra todas las
                  notas internas; solo los hitos relevantes.
                </p>

                {eventsLoading && (
                  <p className="mt-4 text-xs text-slate-500">
                    Cargando historial de tu caso...
                  </p>
                )}

                {!eventsLoading && events.length === 0 && (
                  <p className="mt-4 text-xs text-slate-500">
                    Todavía no hemos publicado eventos en el historial de este
                    caso. Esto no significa que no estemos trabajando; solo que
                    aún no hay movimientos que necesites ver aquí.
                  </p>
                )}

                {!eventsLoading && events.length > 0 && (
                  <ol className="mt-4 space-y-4">
                    {events.map((ev, idx) => (
                      <li key={ev.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="mt-1 h-2 w-2 rounded-full border bg-sky-500 border-sky-400" />
                          {idx < events.length - 1 && (
                            <div className="mt-1 h-full w-px flex-1 bg-slate-200" />
                          )}
                        </div>
                        <div>
                          <p className="text-[11px] font-medium text-slate-500">
                            {new Date(ev.created_at).toLocaleString("de-DE", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          {ev.title && (
                            <p className="text-sm font-semibold text-slate-900">
                              {ev.title}
                            </p>
                          )}
                          {ev.description && (
                            <p className="mt-1 text-xs text-slate-600 whitespace-pre-line">
                              {ev.description}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </motion.div>

            {/* Columna derecha: próximos plazos + contacto */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              className="space-y-6"
            >
              {/* Próximos plazos (de momento orientativos) */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
                <h2 className="text-sm font-semibold text-slate-900">
                  Próximos pasos orientativos
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Estas fechas son de ejemplo. Más adelante se conectarán a los
                  plazos reales de tu caso dentro de nuestro sistema.
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
                  Los plazos vinculantes siempre serán los que aparezcan en las
                  cartas oficiales (Bescheide, citaciones, etc.). Este panel es
                  solo una ayuda visual.
                </p>
              </div>

              {/* Bloque contacto rápido */}
              <div className="rounded-2xl border border-slate-900/40 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-900 p-5 text-slate-50 shadow-[0_22px_55px_rgba(15,23,42,0.65)]">
                <h2 className="text-sm font-semibold">
                  ¿Ves algo urgente o recibiste una carta nueva?
                </h2>
                <p className="mt-2 text-xs text-slate-200">
                  Si recibes una nueva carta; un plazo muy corto o algo que no
                  entiendas; puedes escribir directamente y adjuntar el
                  documento. En una versión siguiente podrás subir Bescheide y
                  cartas desde este mismo panel.
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
        )}
      </section>
    </main>
  );
}
