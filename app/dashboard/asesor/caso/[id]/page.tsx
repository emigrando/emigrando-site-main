"use client";

import { useEffect, useState } from "react";
import type React from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import LogoutButton from "@/components/LogoutButton";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

type EstadoCaso = "nuevo" | "revision" | "pendiente_cliente" | "completado";
type PrioridadCaso = "alta" | "media" | "baja" | "";

interface CaseRow {
  id: string;
  owner_user_id: string | null;
  client_user_id: string | null;
  cliente: string | null;
  tipo: string | null;
  autoridad: string | null;
  estado: EstadoCaso;
  ultimo_movimiento: string | null;
  proximo_plazo: string | null;
  notas_breves: string | null;
  prioridad: "alta" | "media" | "baja" | null;
  client_progress_percent: number | null;
  client_phase_label: string | null;
  client_last_update: string | null;
  created_at?: string;
}

interface CaseEventRow {
  id: string;
  created_at: string;
  actor_user_id: string | null;
  title: string | null;
  description: string | null;
  event_type: string | null;
  visible_for_client: boolean | null;
}

interface ProfileSearchResult {
  id: string;
  first_name: string | null;
  last_name: string | null;
  nationality: string | null;
  residence_status: string | null;
  address: string | null;
}

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const id = params?.id as string | undefined;

  const [deleting, setDeleting] = useState(false);

  const [caseData, setCaseData] = useState<CaseRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [form, setForm] = useState<{
    cliente: string;
    tipo: string;
    autoridad: string;
    estado: EstadoCaso;
    prioridad: PrioridadCaso;
    proximoPlazo: string;
    ultimoMovimiento: string;
    notasBreves: string;
    clientProgress: string;
    clientPhase: string;
    clientLastUpdate: string;
    clientUserId: string;
  }>({
    cliente: "",
    tipo: "",
    autoridad: "",
    estado: "nuevo",
    prioridad: "",
    proximoPlazo: "",
    ultimoMovimiento: "",
    notasBreves: "",
    clientProgress: "",
    clientPhase: "",
    clientLastUpdate: "",
    clientUserId: "",
  });

  // Historial de eventos
  const [events, setEvents] = useState<CaseEventRow[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [logNote, setLogNote] = useState("");
  const [logVisibleForClient, setLogVisibleForClient] = useState(false);
  const [logSaving, setLogSaving] = useState(false);

  // Buscador de clientes
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [clientSearchLoading, setClientSearchLoading] = useState(false);
  const [clientSearchResults, setClientSearchResults] = useState<
    ProfileSearchResult[]
  >([]);
  const [clientSearchError, setClientSearchError] = useState<string | null>(
    null
  );

  function updateField<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function loadEvents(caseId: string) {
    setEventsLoading(true);

    const { data, error } = await supabase
      .from("case_events")
      .select(
        "id, created_at, actor_user_id, title, description, event_type, visible_for_client"
      )
      .eq("case_id", caseId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error cargando eventos del caso:", error.message);
      setEvents([]);
      setEventsLoading(false);
      return;
    }

    setEvents((data || []) as CaseEventRow[]);
    setEventsLoading(false);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadCase() {
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

      const c = data as CaseRow;
      setCaseData(c);

      setForm({
        cliente: c.cliente || "",
        tipo: c.tipo || "",
        autoridad: c.autoridad || "",
        estado: c.estado || "nuevo",
        prioridad: (c.prioridad || "") as PrioridadCaso,
        proximoPlazo: c.proximo_plazo ? c.proximo_plazo.slice(0, 10) : "",
        ultimoMovimiento: c.ultimo_movimiento || "",
        notasBreves: c.notas_breves || "",
        clientProgress:
          typeof c.client_progress_percent === "number"
            ? String(c.client_progress_percent)
            : "",
        clientPhase: c.client_phase_label || "",
        clientLastUpdate: c.client_last_update
          ? c.client_last_update.slice(0, 10)
          : "",
        clientUserId: c.client_user_id || "",
      });

      await loadEvents(id);

      setLoading(false);
    }

    loadCase();

    return () => {
      isMounted = false;
    };
  }, [id, supabase]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;

    setSaving(true);
    setErr(null);
    setOk(null);

    let progressValue: number | null = null;
    if (form.clientProgress !== "") {
      const n = Number(form.clientProgress);
      if (!Number.isNaN(n)) {
        progressValue = Math.min(100, Math.max(0, n));
      }
    }

    const { error } = await supabase
      .from("cases")
      .update({
        cliente: form.cliente || null,
        tipo: form.tipo || null,
        autoridad: form.autoridad || null,
        estado: form.estado,
        prioridad: form.prioridad || null,
        proximo_plazo: form.proximoPlazo || null,
        ultimo_movimiento: form.ultimoMovimiento || null,
        notas_breves: form.notasBreves || null,
        client_progress_percent: progressValue,
        client_phase_label: form.clientPhase || null,
        client_last_update: form.clientLastUpdate || null,
        client_user_id: form.clientUserId || null,
      })
      .eq("id", id);

    if (error) {
      setErr(error.message);
      setSaving(false);
      return;
    }

    if (logNote.trim() !== "") {
      setLogSaving(true);

      const { data: userData } = await supabase.auth.getUser();
      const actorId = userData?.user?.id ?? null;

      const { error: eventError } = await supabase.from("case_events").insert({
        case_id: id,
        actor_user_id: actorId,
        title: "Actualización del caso",
        description: logNote.trim(),
        event_type: "update",
        visible_for_client: logVisibleForClient,
      });

      if (eventError) {
        setErr(
          "Se guardaron los cambios del caso, pero hubo un problema registrando el evento en el historial: " +
            eventError.message
        );
        setLogSaving(false);
        setSaving(false);
        return;
      }

      setLogNote("");
      setLogVisibleForClient(false);
      await loadEvents(id);
      setLogSaving(false);
    }

    setOk("Cambios guardados correctamente.");
    setSaving(false);
  }

  function estadoLabel(e: EstadoCaso) {
    if (e === "nuevo") return "Nuevo";
    if (e === "revision") return "En revisión";
    if (e === "pendiente_cliente") return "Pendiente del cliente";
    if (e === "completado") return "Completado";
    return e;
  }

  function prioridadBadge(p?: PrioridadCaso | null) {
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

  function eventTypeLabel(t: string | null) {
    if (!t) return "Evento";
    if (t === "update") return "Actualización";
    if (t === "deadline") return "Plazo";
    if (t === "note") return "Nota interna";
    return t;
  }

  async function handleDeleteCase() {
    if (!id) return;

    if (
      !confirm(
        "¿Seguro que quieres eliminar este caso? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    setDeleting(true);
    setErr(null);
    setOk(null);

    const { error } = await supabase.from("cases").delete().eq("id", id);

    if (error) {
      setErr(error.message);
      setDeleting(false);
      return;
    }

    router.push("/dashboard/asesor");
  }

  // BUSCAR CLIENTES PARA VINCULAR
  async function handleClientSearch() {
    const term = clientSearchTerm.trim();

    if (!term) {
      setClientSearchResults([]);
      setClientSearchError(null);
      return;
    }

    setClientSearchLoading(true);
    setClientSearchError(null);

    const pattern = `%${term}%`;

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, first_name, last_name, nationality, residence_status, address, role"
      )
      .eq("role", "cliente")
      .or(
        [
          `first_name.ilike.${pattern}`,
          `last_name.ilike.${pattern}`,
          `nationality.ilike.${pattern}`,
          `residence_status.ilike.${pattern}`,
          `address.ilike.${pattern}`,
        ].join(",")
      )
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Error buscando clientes:", error.message);
      setClientSearchError(error.message);
      setClientSearchResults([]);
      setClientSearchLoading(false);
      return;
    }

    setClientSearchResults((data || []) as ProfileSearchResult[]);
    setClientSearchLoading(false);
  }

  function handleSelectClient(p: ProfileSearchResult) {
    const nombre =
      `${p.first_name || ""} ${p.last_name || ""}`.trim() || "Sin nombre";

    updateField("cliente", nombre);
    updateField("clientUserId", p.id);

    setClientSearchResults([]);
    setClientSearchTerm("");
    setClientSearchError(null);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f5f7fb] to-white text-slate-900">
      <section className="mx-auto max-w-6xl px-4 pt-20 pb-16 lg:pt-24 lg:pb-20">
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
              ← Volver al tablero de casos
            </button>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-indigo-700">
              Detalle del caso
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {form.cliente || caseData?.cliente || "Caso sin nombre definido"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Aquí puedes ajustar el estado práctico del caso; la autoridad
              principal; la prioridad; los plazos; las notas internas y el
              progreso que verá el cliente en su panel.
            </p>
          </div>

          <div className="mt-1 flex flex-col items-end gap-2 md:mt-0">
            {caseData && (
              <span className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-slate-50 shadow-md">
                {estadoLabel(caseData.estado)}
              </span>
            )}
            <LogoutButton />
          </div>
        </motion.div>

        {loading && (
          <p className="text-sm text-slate-600">
            Cargando datos del caso desde Supabase...
          </p>
        )}

        {!loading && err && (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {err}
          </div>
        )}

        {!loading && !err && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
            className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr] lg:items-start"
          >
            <div className="space-y-4">
              <form
                onSubmit={handleSave}
                className="space-y-4 rounded-2xl border border-slate-100 bg-white/95 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)]"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-medium text-slate-600">
                      Cliente / familia (título visible)
                    </label>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                      value={form.cliente}
                      onChange={(e) => updateField("cliente", e.target.value)}
                      placeholder="Ej: Familia Ramos García"
                    />

                    <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-3 text-[11px] text-slate-600">
                      <p className="font-semibold text-slate-700">
                        Vincular con usuario de cliente
                      </p>
                      <p className="mt-1">
                        Escribe nombre, apellido, nacionalidad, dirección o
                        parte de ellos y selecciona el cliente correcto.
                      </p>

                      <div className="mt-2 flex gap-2">
                        <input
                          type="text"
                          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                          placeholder="Ej: Marlyn; García; venezolana; Augsburg..."
                          value={clientSearchTerm}
                          onChange={(e) =>
                            setClientSearchTerm(e.target.value)
                          }
                        />
                        <button
                          type="button"
                          onClick={handleClientSearch}
                          disabled={clientSearchLoading}
                          className="rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
                        >
                          {clientSearchLoading ? "Buscando..." : "Buscar"}
                        </button>
                      </div>

                      {clientSearchError && (
                        <p className="mt-2 text-[11px] text-rose-600">
                          {clientSearchError}
                        </p>
                      )}

                      {form.clientUserId && !clientSearchLoading && (
                        <p className="mt-2 text-[11px] text-emerald-700">
                          Caso vinculado a usuario ID:{" "}
                          <span className="font-mono text-[10px]">
                            {form.clientUserId}
                          </span>
                        </p>
                      )}

                      {clientSearchResults.length > 0 && (
                        <div className="mt-2 max-h-52 space-y-1 overflow-y-auto rounded-xl border border-slate-200 bg-white py-2">
                          {clientSearchResults.map((p) => {
                            const nombre =
                              `${p.first_name || ""} ${
                                p.last_name || ""
                              }`.trim() || "Sin nombre";
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => handleSelectClient(p)}
                                className="w-full px-3 py-1.5 text-left text-[11px] text-slate-700 hover:bg-slate-50"
                              >
                                <p className="font-semibold text-slate-900">
                                  {nombre}
                                </p>
                                <p className="text-[10px] text-slate-500">
                                  {p.nationality || "Nacionalidad no indicada"}{" "}
                                  ·{" "}
                                  {p.residence_status ||
                                    "Situación migratoria no indicada"}
                                </p>
                                {p.address && (
                                  <p className="text-[10px] text-slate-500">
                                    {p.address}
                                  </p>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600">
                      Tipo de caso
                    </label>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                      value={form.tipo}
                      onChange={(e) => updateField("tipo", e.target.value)}
                      placeholder="Ej: Asilo · Folgeantrag; Bürgergeld · Sanktion..."
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-medium text-slate-600">
                      Autoridad principal
                    </label>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                      value={form.autoridad}
                      onChange={(e) => updateField("autoridad", e.target.value)}
                      placeholder="Jobcenter; BAMF; Ausländerbehörde..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-medium text-slate-600">
                        Estado práctico
                      </label>
                      <select
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                        value={form.estado}
                        onChange={(e) =>
                          updateField("estado", e.target.value as EstadoCaso)
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
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                        value={form.prioridad}
                        onChange={(e) =>
                          updateField(
                            "prioridad",
                            e.target.value as PrioridadCaso
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
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-medium text-slate-600">
                      Próximo plazo interno / externo
                    </label>
                    <input
                      type="date"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                      value={form.proximoPlazo}
                      onChange={(e) =>
                        updateField("proximoPlazo", e.target.value)
                      }
                    />
                    <p className="mt-1 text-[11px] text-slate-500">
                      Esto no sustituye los plazos de Bescheide oficiales; es
                      solo un recordatorio interno.
                    </p>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600">
                      Último movimiento
                    </label>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                      value={form.ultimoMovimiento}
                      onChange={(e) =>
                        updateField("ultimoMovimiento", e.target.value)
                      }
                      placeholder="Ej: Enviada réplica al Jobcenter el 12.11.2025..."
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-medium text-slate-600">
                      Progreso que verá el cliente (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                      value={form.clientProgress}
                      onChange={(e) =>
                        updateField("clientProgress", e.target.value)
                      }
                      placeholder="0 - 100"
                    />
                    <p className="mt-1 text-[11px] text-slate-500">
                      Esto alimenta la barra de progreso en el panel del
                      cliente. No es una garantía jurídica; solo un indicador
                      visual.
                    </p>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600">
                      Fase / estado público para el cliente
                    </label>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                      value={form.clientPhase}
                      onChange={(e) =>
                        updateField("clientPhase", e.target.value)
                      }
                      placeholder="Ej: En revisión de autoridad; esperando respuesta..."
                    />
                    <p className="mt-1 text-[11px] text-slate-500">
                      Este texto aparece en el panel del cliente como estado
                      principal de su caso.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-medium text-slate-600">
                      Fecha de última actualización para el cliente
                    </label>
                    <input
                      type="date"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                      value={form.clientLastUpdate}
                      onChange={(e) =>
                        updateField("clientLastUpdate", e.target.value)
                      }
                    />
                    <p className="mt-1 text-[11px] text-slate-500">
                      Esto aparece bajo el estado del caso en el panel del
                      cliente.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-600">
                    Notas internas ampliadas
                  </label>
                  <textarea
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    rows={4}
                    value={form.notasBreves}
                    onChange={(e) =>
                      updateField("notasBreves", e.target.value)
                    }
                    placeholder="Notas internas; cosas a revisar; puntos de riesgo; etc."
                  />
                </div>

                <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-4">
                  <p className="text-[11px] font-semibold text-slate-700">
                    Registrar movimiento en historial
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Si escribes aquí una nota; además de guardar los cambios del
                    caso se añadirá un evento en el historial interno. Puedes
                    elegir si el cliente verá este movimiento en su panel en el
                    futuro.
                  </p>
                  <textarea
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    rows={3}
                    value={logNote}
                    onChange={(e) => setLogNote(e.target.value)}
                    placeholder="Ej: Revisado Bescheid del 10.12.2025 y ajustada estrategia; pendiente respuesta del Jobcenter..."
                  />
                  <label className="mt-2 inline-flex items-center gap-2 text-[11px] text-slate-600">
                    <input
                      type="checkbox"
                      className="h-3 w-3 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      checked={logVisibleForClient}
                      onChange={(e) =>
                        setLogVisibleForClient(e.target.checked)
                      }
                    />
                    Marcar este evento como potencialmente visible para el
                    cliente en el futuro
                  </label>
                </div>

                {err && (
                  <p className="text-[11px] leading-relaxed text-rose-600">
                    {err}
                  </p>
                )}
                {ok && (
                  <p className="text-[11px] leading-relaxed text-emerald-600">
                    {ok}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="submit"
                      disabled={saving || logSaving}
                      className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-indigo-700 hover:shadow-lg disabled:opacity-60"
                    >
                      {saving || logSaving
                        ? "Guardando..."
                        : "Guardar cambios del caso"}
                    </button>

                    <button
                      type="button"
                      onClick={handleDeleteCase}
                      disabled={deleting}
                      className="inline-flex items-center justify-center rounded-full border border-rose-500/70 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
                    >
                      {deleting ? "Eliminando..." : "Eliminar caso"}
                    </button>
                  </div>

                  {caseData?.created_at && (
                    <p className="text-[11px] text-slate-500">
                      Caso creado el{" "}
                      {new Date(
                        caseData.created_at
                      ).toLocaleDateString("de-DE")}
                    </p>
                  )}
                </div>
              </form>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-100 bg-white/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                <p className="text-[11px] font-medium text-slate-500">
                  Resumen rápido del caso
                </p>

                <div className="mt-3 space-y-3 text-xs text-slate-700">
                  <div>
                    <p className="text-[11px] text-slate-500">
                      Estado práctico
                    </p>
                    <p className="mt-0.5 font-semibold text-slate-900">
                      {estadoLabel(form.estado)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500">Prioridad</p>
                    <div className="mt-0.5">
                      {form.prioridad
                        ? prioridadBadge(form.prioridad)
                        : "Sin prioridad definida"}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500">
                      Próximo plazo interno
                    </p>
                    <p className="mt-0.5">
                      {form.proximoPlazo || "Sin plazo registrado"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500">Autoridad</p>
                    <p className="mt-0.5">
                      {form.autoridad || "Sin autoridad definida"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500">
                      Progreso mostrado al cliente
                    </p>
                    <p className="mt-0.5">
                      {form.clientProgress !== ""
                        ? `${form.clientProgress}%`
                        : "Sin progreso definido"}
                    </p>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-violet-500 transition-all"
                        style={{
                          width:
                            form.clientProgress !== ""
                              ? `${Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    Number(form.clientProgress) || 0
                                  )
                                )}%`
                              : "0%",
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500">
                      Fase visible para el cliente
                    </p>
                    <p className="mt-0.5">
                      {form.clientPhase || "Sin fase definida"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500">
                      Última actualización (cliente)
                    </p>
                    <p className="mt-0.5">
                      {form.clientLastUpdate || "Sin fecha registrada"}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-[11px] text-slate-500">
                  Todo lo que modifiques en este bloque afecta directamente lo
                  que verá la persona en su panel de cliente. Tú controlas el
                  relato; el cliente solo ve el resultado; no tus notas
                  internas.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                <p className="text-sm font-semibold text-slate-900">
                  Historial interno del caso
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Aquí se muestran los movimientos que hayas registrado en el
                  historial. Más adelante puedes usar esto para reconstruir qué
                  hiciste y cuándo; sin revisar correos ni WhatsApp.
                </p>

                {eventsLoading && (
                  <p className="mt-3 text-[11px] text-slate-500">
                    Cargando historial...
                  </p>
                )}

                {!eventsLoading && events.length === 0 && (
                  <p className="mt-3 text-[11px] text-slate-500">
                    Aún no has registrado movimientos en el historial de este
                    caso. Cada vez que añadas una nota en el formulario de
                    arriba, aparecerá aquí como una línea temporal.
                  </p>
                )}

                {!eventsLoading && events.length > 0 && (
                  <ol className="mt-4 space-y-3 text-xs text-slate-700">
                    {events.map((ev) => (
                      <li
                        key={ev.id}
                        className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[11px] font-medium text-slate-500">
                            {new Date(ev.created_at).toLocaleString("de-DE", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          <div className="flex items-center gap-2">
                            {ev.visible_for_client && (
                              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                Marcado para cliente
                              </span>
                            )}
                            <span className="inline-flex items-center rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-slate-50">
                              {eventTypeLabel(ev.event_type)}
                            </span>
                          </div>
                        </div>
                        {ev.title && (
                          <p className="mt-1 text-xs font-semibold text-slate-900">
                            {ev.title}
                          </p>
                        )}
                        {ev.description && (
                          <p className="mt-1 whitespace-pre-line text-[11px] text-slate-700">
                            {ev.description}
                          </p>
                        )}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </section>
    </main>
  );
}
