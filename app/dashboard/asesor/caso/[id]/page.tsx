"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import DashboardGuard from "@/components/DashboardGuard";
import LogoutButton from "@/components/LogoutButton";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

type EstadoCaso = "nuevo" | "revision" | "pendiente_cliente" | "completado";

interface CasoRow {
  id: string;
  owner_user_id: string;
  title: string | null;
  cliente: string | null;
  tipo: string | null;
  autoridad: string | null;
  estado: EstadoCaso;
  ultimo_movimiento: string | null;
  proximo_plazo: string | null;
  notas_breves: string | null;
  prioridad: "alta" | "media" | "baja" | null;
  created_at?: string | null;
  updated_at?: string | null;
}

function prioridadLabel(p: CasoRow["prioridad"]) {
  if (!p) return "Sin prioridad definida";
  if (p === "alta") return "Prioridad alta";
  if (p === "media") return "Prioridad media";
  return "Prioridad baja";
}

export default function CasoDetallePage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [caso, setCaso] = useState<CasoRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Estado del formulario de edición
  const [editEstado, setEditEstado] = useState<EstadoCaso>("nuevo");
  const [editPrioridad, setEditPrioridad] = useState<
    "alta" | "media" | "baja" | ""
  >("");
  const [editProximoPlazo, setEditProximoPlazo] = useState("");
  const [editNotas, setEditNotas] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const id = params?.id as string | undefined;

  // Cargar caso desde Supabase
  useEffect(() => {
    let isMounted = true;

    async function loadCaso() {
      if (!id) {
        setErr("No se encontró el identificador del caso en la URL.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setErr(null);

      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!isMounted) return;

      if (error) {
        setErr(error.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setErr("No se encontró ningún caso con este identificador.");
        setLoading(false);
        return;
      }

      const c = data as unknown as CasoRow;
      setCaso(c);

      // Inicializar formulario de edición con los datos del caso
      setEditEstado(c.estado);
      setEditPrioridad((c.prioridad ?? "") as "alta" | "media" | "baja" | "");
      // Normalizar fecha a YYYY-MM-DD para el input date
      if (c.proximo_plazo) {
        const dateOnly = c.proximo_plazo.split("T")[0];
        setEditProximoPlazo(dateOnly);
      } else {
        setEditProximoPlazo("");
      }
      setEditNotas(c.notas_breves ?? "");

      setLoading(false);
    }

    loadCaso();

    return () => {
      isMounted = false;
    };
  }, [id, supabase]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!caso) return;

    setSaving(true);
    setSaveMsg(null);
    setErr(null);

    const { data, error } = await supabase
      .from("cases")
      .update({
        estado: editEstado,
        prioridad: editPrioridad || null,
        proximo_plazo: editProximoPlazo || null,
        notas_breves: editNotas || null,
      })
      .eq("id", caso.id)
      .select("*")
      .maybeSingle();

    if (error) {
      setErr(error.message);
      setSaving(false);
      return;
    }

    if (data) {
      const updated = data as unknown as CasoRow;
      setCaso(updated);
      setSaveMsg("Cambios guardados correctamente.");
    }

    setSaving(false);
  }

  return (
    <DashboardGuard allowedRoles={["asesor", "admin"]}>
      <main className="min-h-screen bg-gradient-to-b from-[#f5f7fb] to-white text-slate-900">
        <section className="mx-auto max-w-5xl px-4 pt-20 pb-16 lg:pt-24 lg:pb-20">
          {/* Encabezado + acciones */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between"
          >
            <div>
              <button
                type="button"
                onClick={() => router.push("/dashboard/asesor")}
                className="text-[11px] font-medium text-slate-500 hover:text-slate-800"
              >
                ← Volver al tablero
              </button>
              <p className="mt-2 text-xs font-medium text-indigo-700 uppercase tracking-[0.18em]">
                Detalle del caso
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                {caso?.cliente || caso?.title || "Caso sin nombre definido"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Vista ampliada con los datos principales del caso; preparada
                para integrar documentos; notas internas y línea de tiempo más
                detallada. La información viene directamente de la tabla{" "}
                <code>cases</code> en Supabase.
              </p>
            </div>
            <div className="mt-1 flex items-center gap-3 md:mt-0">
              {caso?.estado && (
                <span className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-slate-50 shadow-md">
                  {(() => {
                    if (caso.estado === "nuevo") return "Nuevo";
                    if (caso.estado === "revision") return "En revisión";
                    if (caso.estado === "pendiente_cliente")
                      return "Pendiente del cliente";
                    return "Completado";
                  })()}
                </span>
              )}
              <LogoutButton />
            </div>
          </motion.div>

          {/* Estado de carga / error */}
          {loading && (
            <p className="text-sm text-slate-600">
              Cargando datos del caso desde Supabase...
            </p>
          )}

          {!loading && err && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {err}
            </div>
          )}

          {!loading && !err && caso && (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
              className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]"
            >
              {/* Columna izquierda: datos principales */}
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-100 bg-white/95 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
                  <p className="text-[11px] font-medium text-slate-500">
                    ID del caso
                  </p>
                  <p className="text-xs font-mono text-slate-700">
                    {caso.id}
                  </p>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-medium text-slate-500">
                        Cliente / familia
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {caso.cliente || caso.title || "Sin nombre definido"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-slate-500">
                        Autoridad principal
                      </p>
                      <p className="mt-1 text-sm text-slate-800">
                        {caso.autoridad || "No indicado"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-[11px] font-medium text-slate-500">
                      Tipo de caso
                    </p>
                    <p className="mt-1 text-sm text-slate-800">
                      {caso.tipo || "No indicado"}
                    </p>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-medium text-slate-500">
                        Último movimiento
                      </p>
                      <p className="mt-1 text-xs text-slate-700">
                        {caso.ultimo_movimiento || "Sin registro"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-slate-500">
                        Próximo plazo
                      </p>
                      <p className="mt-1 text-xs text-slate-700">
                        {caso.proximo_plazo || "Sin fecha registrada"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white/95 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Notas internas
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Estas notas no se comparten con el cliente. Solo sirven para
                    tu organización interna.
                  </p>

                  <p className="mt-3 text-xs text-slate-700 whitespace-pre-line">
                    {caso.notas_breves || "Sin notas internas registradas."}
                  </p>
                </div>
              </div>

              {/* Columna derecha: edición + meta */}
              <div className="space-y-4">
                {/* Edición del caso */}
                <div className="rounded-2xl border border-slate-100 bg-white/95 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Editar datos del caso
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Ajusta el estado práctico del caso; prioridad interna;
                    próximo plazo y notas breves.
                  </p>

                  <form onSubmit={handleSave} className="mt-4 space-y-3 text-xs">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-[11px] font-medium text-slate-600">
                          Estado
                        </label>
                        <select
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                          value={editEstado}
                          onChange={(e) =>
                            setEditEstado(e.target.value as EstadoCaso)
                          }
                        >
                          <option value="nuevo">Nuevo</option>
                          <option value="revision">En revisión</option>
                          <option value="pendiente_cliente">
                            Pendiente del cliente
                          </option>
                          <option value="completado">Completado</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-slate-600">
                          Prioridad
                        </label>
                        <select
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                          value={editPrioridad}
                          onChange={(e) =>
                            setEditPrioridad(
                              (e.target.value || "") as
                                | "alta"
                                | "media"
                                | "baja"
                                | ""
                            )
                          }
                        >
                          <option value="">Sin prioridad</option>
                          <option value="alta">Alta</option>
                          <option value="media">Media</option>
                          <option value="baja">Baja</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-slate-600">
                        Próximo plazo
                      </label>
                      <input
                        type="date"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                        value={editProximoPlazo}
                        onChange={(e) => setEditProximoPlazo(e.target.value)}
                      />
                      <p className="mt-1 text-[10px] text-slate-500">
                        Esto no sustituye la fecha que señale la carta o el
                        Bescheid oficial; es un recordatorio operativo interno.
                      </p>
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-slate-600">
                        Notas breves internas
                      </label>
                      <textarea
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                        rows={3}
                        value={editNotas}
                        onChange={(e) => setEditNotas(e.target.value)}
                        placeholder="Ej: Falta aclarar fechas; revisar Bescheid del 10.11.2025; cliente enviará Unterlagen adicionales..."
                      />
                    </div>

                    {saveMsg && (
                      <p className="text-[11px] text-emerald-600">
                        {saveMsg}
                      </p>
                    )}
                    {err && !loading && (
                      <p className="text-[11px] text-rose-600">
                        {err}
                      </p>
                    )}

                    <div className="pt-1">
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-700 hover:shadow-lg transition disabled:opacity-60"
                      >
                        {saving ? "Guardando..." : "Guardar cambios"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Meta / explicación futura */}
                <div className="rounded-2xl border border-slate-900/40 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-900 p-5 text-slate-50 shadow-[0_18px_50px_rgba(15,23,42,0.70)]">
                  <h2 className="text-sm font-semibold">
                    Próximos pasos (concepto)
                  </h2>
                  <p className="mt-2 text-xs text-slate-200">
                    Aquí más adelante podrás ver y gestionar además:
                  </p>
                  <ul className="mt-2 list-disc pl-4 text-xs text-slate-200 space-y-1">
                    <li>Tareas internas específicas para este caso.</li>
                    <li>Documentos subidos; bescheide; Schreiben; Anlagen.</li>
                    <li>Historial ampliado con cada acción registrada.</li>
                  </ul>
                  <p className="mt-3 text-[11px] text-slate-300">
                    De momento; esta vista sirve como base de diseño para
                    conectar un sistema de documentos y tareas internas sobre
                    la misma tabla <code>cases</code>.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </section>
      </main>
    </DashboardGuard>
  );
}
