"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import LogoutButton from "@/components/LogoutButton";
import DashboardGuard from "@/components/DashboardGuard";

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
}

const columnas = [
  {
    id: "nuevo",
    titulo: "Nuevo",
    descripcion: "Casos recién llegados que aún hay que analizar bien.",
  },
  {
    id: "revision",
    titulo: "En revisión",
    descripcion: "Casos en los que ya estás trabajando activamente.",
  },
  {
    id: "pendiente_cliente",
    titulo: "Pendiente del cliente",
    descripcion: "Faltan datos, documentos o decisiones del cliente.",
  },
  {
    id: "completado",
    titulo: "Completado",
    descripcion: "Casos cerrados o con trámite encaminado.",
  },
] as const;

function prioridadBadge(p?: CasoRow["prioridad"]) {
  if (!p) return null;
  if (p === "alta") {
    return (
      <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
        Prioridad alta
      </span>
    );
  }
  if (p === "media") {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
        Prioridad media
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
      Prioridad baja
    </span>
  );
}

export default function AsesorDashboardPage() {
  const supabase = createSupabaseBrowserClient();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [casos, setCasos] = useState<CasoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [newCliente, setNewCliente] = useState("");
  const [newTipo, setNewTipo] = useState("");
  const [newAutoridad, setNewAutoridad] = useState("");
  const [newEstado, setNewEstado] = useState<EstadoCaso>("nuevo");
  const [newPrioridad, setNewPrioridad] = useState<
    "alta" | "media" | "baja" | ""
  >("");
  const [newProximoPlazo, setNewProximoPlazo] = useState("");
  const [newNotas, setNewNotas] = useState("");
  const [creating, setCreating] = useState(false);

  async function reloadCases() {
    setLoading(true);
    setErr(null);

    const { data, error } = await supabase
      .from("cases")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    setCasos((data || []) as unknown as CasoRow[]);
    setLoading(false);
  }

  useEffect(() => {
    let isMounted = true;

    async function init() {
      const { data: userData } = await supabase.auth.getUser();
      if (!isMounted) return;
      setCurrentUserId(userData?.user?.id ?? null);

      await reloadCases();
    }

    init();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activos = casos.filter(
    (c) => c.estado === "nuevo" || c.estado === "revision"
  );
  const pendientesCliente = casos.filter(
    (c) => c.estado === "pendiente_cliente"
  );

  async function handleCreateCase(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!currentUserId) {
      setErr("No se pudo determinar el usuario actual para asignar el caso.");
      return;
    }

    setCreating(true);

    const { error } = await supabase.from("cases").insert({
      owner_user_id: currentUserId,
      cliente: newCliente || null,
      tipo: newTipo || null,
      autoridad: newAutoridad || null,
      estado: newEstado,
      ultimo_movimiento: "Caso creado en el panel interno",
      proximo_plazo: newProximoPlazo || null,
      notas_breves: newNotas || null,
      prioridad: newPrioridad || null,
    });

    if (error) {
      setErr(error.message);
      setCreating(false);
      return;
    }

    setNewCliente("");
    setNewTipo("");
    setNewAutoridad("");
    setNewEstado("nuevo");
    setNewPrioridad("");
    setNewProximoPlazo("");
    setNewNotas("");

    await reloadCases();
    setCreating(false);
  }

    return (
    <DashboardGuard allowedRoles={["asesor", "admin"]}>
      <main className="min-h-screen bg-gradient-to-b from-[#f5f7fb] to-white text-slate-900">

        <section className="mx-auto max-w-6xl px-4 pt-20 pb-16 lg:pt-24 lg:pb-20">
          {/* Encabezado */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between"
          >
            <div>
              <p className="text-xs font-medium text-indigo-700 uppercase tracking-[0.18em]">
                Panel del asesor · vista interna
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Gestión de casos en tablero Kanban
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Aquí organizas los casos por estado práctico del trabajo. Los
                datos vienen directamente de la tabla <code>cases</code> en
                Supabase; respetando las políticas de seguridad.
              </p>
            </div>
            <div className="mt-1 md:mt-0">
              <LogoutButton />
            </div>
          </motion.div>

          {/* Bloque: crear nuevo caso */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
            className="mb-6 rounded-2xl border border-slate-100 bg-white/95 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.05)]"
          >
            <form
              onSubmit={handleCreateCase}
              className="grid gap-3 md:grid-cols-[1.1fr_1.1fr_0.9fr_0.9fr] md:items-end"
            >
              <div>
                <label className="text-[11px] font-medium text-slate-600">
                  Cliente / familia
                </label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                  placeholder="Ej: Familia Ramos García"
                  value={newCliente}
                  onChange={(e) => setNewCliente(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-600">
                  Tipo de caso
                </label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                  placeholder="Ej: Asilo · Folgeantrag; Bürgergeld · Sanktion..."
                  value={newTipo}
                  onChange={(e) => setNewTipo(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-2">
                <div>
                  <label className="text-[11px] font-medium text-slate-600">
                    Autoridad
                  </label>
                  <input
                    type="text"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                    placeholder="Jobcenter, BAMF, ABH..."
                    value={newAutoridad}
                    onChange={(e) => setNewAutoridad(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600">
                    Estado
                  </label>
                  <select
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                    value={newEstado}
                    onChange={(e) =>
                      setNewEstado(e.target.value as EstadoCaso)
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
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-2">
                <div>
                  <label className="text-[11px] font-medium text-slate-600">
                    Prioridad
                  </label>
                  <select
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                    value={newPrioridad}
                    onChange={(e) =>
                      setNewPrioridad(
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
                <div>
                  <label className="text-[11px] font-medium text-slate-600">
                    Próximo plazo
                  </label>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                    value={newProximoPlazo}
                    onChange={(e) => setNewProximoPlazo(e.target.value)}
                  />
                </div>
              </div>
              <div className="md:col-span-4">
                <label className="text-[11px] font-medium text-slate-600">
                  Notas breves internas
                </label>
                <div className="mt-1 flex gap-3">
                  <textarea
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                    rows={2}
                    placeholder="Ej: Falta aclarar fechas, revisar Bescheid del 10.11.2025..."
                    value={newNotas}
                    onChange={(e) => setNewNotas(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={creating}
                    className="hidden md:inline-flex h-fit items-center justify-center rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-700 hover:shadow-lg transition disabled:opacity-60"
                  >
                    {creating ? "Guardando..." : "Crear caso"}
                  </button>
                </div>
                <div className="mt-2 md:hidden">
                  <button
                    type="submit"
                    disabled={creating}
                    className="w-full rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-700 hover:shadow-lg transition disabled:opacity-60"
                  >
                    {creating ? "Guardando..." : "Crear caso"}
                  </button>
                </div>
              </div>
            </form>

            {err && (
              <p className="mt-2 text-[11px] text-rose-600 leading-relaxed">
                {err}
              </p>
            )}
          </motion.div>

          {/* Resumen rápido arriba */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="mb-6 grid gap-4 md:grid-cols-3"
          >
            <div className="rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
              <p className="text-[11px] font-medium text-slate-500">
                Casos activos
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {activos.length}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Entre nuevos y en revisión.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
              <p className="text-[11px] font-medium text-slate-500">
                Pendientes del cliente
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {pendientesCliente.length}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Requieren datos o documentos adicionales.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-900/40 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-900 p-4 text-slate-50 shadow-[0_18px_50px_rgba(15,23,42,0.70)]">
              <p className="text-[11px] font-medium text-slate-200">
                Nota operativa
              </p>
              <p className="mt-1 text-xs text-slate-100">
                Este tablero lee directamente de la base de datos. No sustituye
                plazos oficiales ni asesoría jurídica; pero sirve como tu panel
                interno de trabajo.
              </p>
            </div>
          </motion.div>

          {err && !creating && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[11px] text-rose-700">
              Error al cargar o guardar los casos: {err}
            </div>
          )}

          {/* Tablero Kanban */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
          >
            {columnas.map((col) => {
              const casosColumna = casos.filter(
                (c) => c.estado === (col.id as EstadoCaso)
              );

              return (
                <div
                  key={col.id}
                  className="flex h-full flex-col rounded-2xl border border-slate-100 bg-slate-50/80 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.04)]"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">
                        {col.titulo}
                      </h2>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {col.descripcion}
                      </p>
                    </div>
                    <span className="inline-flex h-7 min-w-[2.25rem] items-center justify-center rounded-full bg-white px-2 text-[11px] font-semibold text-slate-600 shadow-sm">
                      {casosColumna.length}
                    </span>
                  </div>

                  <div className="mt-2 flex-1 space-y-3">
                    {loading && casos.length === 0 && (
                      <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-3 py-4 text-[11px] text-slate-500">
                        Cargando casos desde Supabase...
                      </p>
                    )}

                    {!loading &&
                      casosColumna.map((caso) => (
                        <div
                          key={caso.id}
                            className="group rounded-2xl border border-slate-100 bg-white/95 px-3.5 py-3 text-xs text-slate-700 shadow-sm transition-all hover:-translate-y-[2px] hover:shadow-md"
                        >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[11px] font-medium text-slate-500">
                              {caso.id}
                            </p>
                            <p className="text-xs font-semibold text-slate-900">
                              {caso.cliente || caso.title || "Sin nombre"}
                            </p>
                          </div>
                          {prioridadBadge(caso.prioridad || undefined)}
                        </div>

                        <p className="mt-1 text-[11px] text-slate-600">
                          {caso.tipo}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500">
                          Autoridad: {caso.autoridad}
                        </p>

                        {caso.notas_breves && (
                          <p className="mt-1 text-[11px] text-slate-600">
                            {caso.notas_breves}
                          </p>
                        )}

                        <div className="mt-2 flex items-center justify-between gap-2 text-[11px]">
                          <p className="text-slate-500">
                            Último movimiento:{" "}
                            {caso.ultimo_movimiento || "Sin registro"}
                          </p>
                          {caso.proximo_plazo && (
                            <span className="whitespace-nowrap rounded-full bg-slate-50 px-2 py-0.5 text-[10px] text-slate-600 border border-slate-200">
                              Plazo: {caso.proximo_plazo}
                            </span>
                        )}
                      </div>

                      <div className="mt-2 flex justify-end">
                        <a
                          href={`/dashboard/asesor/caso/${caso.id}`}
                            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          Ver detalle
                        </a>
                    </div>
                  </div>
                ))}

                    {!loading && casosColumna.length === 0 && (
                      <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-3 py-4 text-[11px] text-slate-500">
                        No hay casos en esta columna. Cuando crees casos en la
                        tabla <code>cases</code>; aparecerán aquí de forma
                        automática.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        </section>
      </main>
    </DashboardGuard>
  );
}
