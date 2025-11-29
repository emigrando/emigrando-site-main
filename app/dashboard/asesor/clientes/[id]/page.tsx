"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import LogoutButton from "@/components/LogoutButton";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

type EstadoCaso = "nuevo" | "revision" | "pendiente_cliente" | "completado";

interface ProfileRow {
  id: string;
  role: string | null;
  first_name: string | null;
  last_name: string | null;
  birth_date: string | null;
  nationality: string | null;
  residence_status: string | null;
  address: string | null;
  created_at: string | null;
}

interface CaseRow {
  id: string;
  cliente: string | null;
  tipo: string | null;
  autoridad: string | null;
  estado: EstadoCaso;
  prioridad: "alta" | "media" | "baja" | null;
  client_progress_percent: number | null;
  client_phase_label: string | null;
  client_last_update: string | null;
  created_at: string | null;
}

interface IntakeSummary {
  id: string;
  created_at: string | null;
  source: string | null;
  status: string | null;
  main_goal: string | null;
}

export default function ClienteDetailForAsesorPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const userId = params?.id as string | undefined;

  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [intakes, setIntakes] = useState<IntakeSummary[]>([]);

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [profileForm, setProfileForm] = useState<{
    first_name: string;
    last_name: string;
    birth_date: string;
    nationality: string;
    residence_status: string;
    address: string;
  }>({
    first_name: "",
    last_name: "",
    birth_date: "",
    nationality: "",
    residence_status: "",
    address: "",
  });

  function updateProfileField<K extends keyof typeof profileForm>(
    key: K,
    value: (typeof profileForm)[K]
  ) {
    setProfileForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!userId) {
        setErr("No se encontró el identificador del cliente en la URL.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setErr(null);

      // 1) Perfil
      const { data: profileRow, error: profileError } = await supabase
        .from("profiles")
        .select(
          "id, role, first_name, last_name, birth_date, nationality, residence_status, address, created_at"
        )
        .eq("id", userId)
        .maybeSingle();

      if (!isMounted) return;

      if (profileError) {
        setErr(profileError.message);
        setLoading(false);
        return;
      }

      if (!profileRow) {
        setErr(
          "No se encontró ningún perfil con este identificador. Revisa que el usuario exista en la tabla profiles."
        );
        setLoading(false);
        return;
      }

      const p = profileRow as ProfileRow;
      setProfile(p);

      setProfileForm({
        first_name: p.first_name || "",
        last_name: p.last_name || "",
        birth_date: p.birth_date ? p.birth_date.slice(0, 10) : "",
        nationality: p.nationality || "",
        residence_status: p.residence_status || "",
        address: p.address || "",
      });

      // 2) Casos asociados
      const { data: caseRows, error: casesError } = await supabase
        .from("cases")
        .select(
          "id, cliente, tipo, autoridad, estado, prioridad, client_progress_percent, client_phase_label, client_last_update, created_at"
        )
        .eq("client_user_id", userId)
        .order("created_at", { ascending: false });

      if (!isMounted) return;

      if (!casesError && caseRows) {
        setCases(caseRows as CaseRow[]);
      }

      // 3) Intakes asociados
      const { data: intakeRows, error: intakesError } = await supabase
        .from("intake_submissions")
        .select("id, created_at, source, status, main_goal")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!isMounted) return;

      if (!intakesError && intakeRows) {
        setIntakes(intakeRows as IntakeSummary[]);
      }

      setLoading(false);
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [supabase, userId]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;

    setSavingProfile(true);
    setErr(null);
    setOk(null);

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: profileForm.first_name || null,
        last_name: profileForm.last_name || null,
        birth_date: profileForm.birth_date || null,
        nationality: profileForm.nationality || null,
        residence_status: profileForm.residence_status || null,
        address: profileForm.address || null,
      })
      .eq("id", userId);

    if (error) {
      setErr(error.message);
      setSavingProfile(false);
      return;
    }

    setOk("Datos del perfil actualizados correctamente.");
    setSavingProfile(false);
  }

  function estadoLabel(e: EstadoCaso) {
    if (e === "nuevo") return "Nuevo";
    if (e === "revision") return "En revisión";
    if (e === "pendiente_cliente") return "Pendiente del cliente";
    if (e === "completado") return "Completado";
    return e;
  }

  function prioridadBadge(p?: CaseRow["prioridad"] | null) {
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

  const nombreCompleto =
    (profile?.first_name || profile?.last_name) ?
      `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() :
      "Cliente sin nombre definido";

  return (
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
            <button
              type="button"
              onClick={() => router.push("/dashboard/asesor/clientes")}
              className="text-[11px] font-medium text-slate-500 hover:text-slate-800"
            >
              ← Volver a la lista de clientes
            </button>
            <p className="mt-2 text-xs font-medium text-indigo-700 uppercase tracking-[0.18em]">
              Ficha del cliente
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {nombreCompleto}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Aquí puedes corregir datos básicos del perfil; ver todos los casos
              vinculados; los formularios de intake enviados y; más adelante;
              un historial detallado de cambios y eventos.
            </p>
          </div>
          <div className="mt-1 flex flex-col items-end gap-2 md:mt-0">
            {profile?.role && (
              <span className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-slate-50 shadow-md">
                Rol: {profile.role}
              </span>
            )}
            <LogoutButton />
          </div>
        </motion.div>

        {loading && (
          <p className="text-sm text-slate-600">
            Cargando datos del cliente desde Supabase...
          </p>
        )}

        {!loading && err && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {err}
          </div>
        )}

        {!loading && !err && profile && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
            className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr] lg:items-start"
          >
            {/* Columna izquierda: perfil editable */}
            <div className="space-y-4">
              <form
                onSubmit={handleSaveProfile}
                className="rounded-2xl border border-slate-100 bg-white/95 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)] space-y-4"
              >
                <h2 className="text-sm font-semibold text-slate-900">
                  Datos básicos del perfil
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-medium text-slate-600">
                      Nombre
                    </label>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                      value={profileForm.first_name}
                      onChange={(e) =>
                        updateProfileField("first_name", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600">
                      Apellido
                    </label>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                      value={profileForm.last_name}
                      onChange={(e) =>
                        updateProfileField("last_name", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-medium text-slate-600">
                      Fecha de nacimiento
                    </label>
                    <input
                      type="date"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                      value={profileForm.birth_date}
                      onChange={(e) =>
                        updateProfileField("birth_date", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600">
                      Nacionalidad
                    </label>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                      value={profileForm.nationality}
                      onChange={(e) =>
                        updateProfileField("nationality", e.target.value)
                      }
                      placeholder="Ej: Venezolana; colombiana; etc."
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-600">
                    Situación migratoria / residencia
                  </label>
                  <input
                    type="text"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                    value={profileForm.residence_status}
                    onChange={(e) =>
                      updateProfileField("residence_status", e.target.value)
                    }
                    placeholder="Ej: Aufenthalt §25 Abs.3; Duldung; Asylverfahren offen..."
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-600">
                    Dirección (ciudad; código postal; etc.)
                  </label>
                  <input
                    type="text"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                    value={profileForm.address}
                    onChange={(e) =>
                      updateProfileField("address", e.target.value)
                    }
                    placeholder="Ej: Augsburg; 86150; Bayern..."
                  />
                </div>

                {err && (
                  <p className="text-[11px] text-rose-600 leading-relaxed">
                    {err}
                  </p>
                )}
                {ok && (
                  <p className="text-[11px] text-emerald-600 leading-relaxed">
                    {ok}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-700 hover:shadow-lg transition disabled:opacity-60"
                  >
                    {savingProfile
                      ? "Guardando cambios..."
                      : "Guardar cambios del perfil"}
                  </button>
                  {profile.created_at && (
                    <p className="text-[11px] text-slate-500">
                      Registrado el{" "}
                      {new Date(profile.created_at).toLocaleDateString("de-DE")}
                    </p>
                  )}
                </div>
              </form>
            </div>

            {/* Columna derecha: casos; intakes; futuro historial */}
            <div className="space-y-4">
              {/* Casos asociados */}
              <div className="rounded-2xl border border-slate-100 bg-white/95 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                <h2 className="text-sm font-semibold text-slate-900">
                  Casos vinculados a este cliente
                </h2>
                <p className="mt-1 text-[11px] text-slate-500">
                  Cada tarjeta te lleva al detalle del caso; donde puedes
                  ajustar estado; prioridad; plazos y lo que verá el cliente en
                  su panel.
                </p>

                {cases.length === 0 ? (
                  <p className="mt-3 text-xs text-slate-600">
                    Aún no hay casos asociados a este cliente. Puedes crear uno
                    desde el tablero general usando su nombre; o desde un
                    intake.
                  </p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {cases.map((c) => {
                      const progress =
                        typeof c.client_progress_percent === "number"
                          ? Math.min(
                              100,
                              Math.max(0, c.client_progress_percent)
                            )
                          : null;

                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() =>
                            router.push(`/dashboard/asesor/caso/${c.id}`)
                          }
                          className="w-full text-left rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-xs text-slate-700 shadow-sm transition-all hover:-translate-y-[2px] hover:bg-white hover:shadow-md"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                {c.tipo || "Caso sin tipo definido"}
                              </p>
                              <p className="mt-0.5 text-[11px] text-slate-500">
                                Autoridad: {c.autoridad || "No indicada"}
                              </p>
                            </div>
                            <div className="text-right space-y-1">
                              {prioridadBadge(c.prioridad)}
                              {c.created_at && (
                                <p className="text-[10px] text-slate-500">
                                  Creado el{" "}
                                  {new Date(
                                    c.created_at
                                  ).toLocaleDateString("de-DE")}
                                </p>
                              )}
                            </div>
                          </div>

                          {progress !== null && (
                            <div className="mt-2">
                              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className="h-1.5 rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-violet-500 transition-all"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <p className="mt-1 text-[10px] text-slate-500">
                                Progreso mostrado al cliente: {progress}% ·{" "}
                                {c.client_phase_label ||
                                  "Sin fase pública definida"}
                              </p>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Intakes asociados */}
              <div className="rounded-2xl border border-slate-100 bg-white/95 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                <h2 className="text-sm font-semibold text-slate-900">
                  Formularios de intake enviados
                </h2>
                <p className="mt-1 text-[11px] text-slate-500">
                  Estos son los formularios que esta persona llenó. Desde cada
                  uno puedes abrir el detalle y; si hace falta; crear nuevos
                  casos o revisar el raw completo.
                </p>

                {intakes.length === 0 ? (
                  <p className="mt-3 text-xs text-slate-600">
                    Este usuario todavía no ha enviado ningún intake con su
                    sesión actual. Si tienes datos de intake antiguos; pueden
                    estar asociados por correo o en otro sistema.
                  </p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {intakes.map((i) => (
                      <button
                        key={i.id}
                        type="button"
                        onClick={() =>
                          router.push(`/dashboard/asesor/intakes/${i.id}`)
                        }
                        className="w-full text-left rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-xs text-slate-700 shadow-sm transition-all hover:-translate-y-[2px] hover:bg-white hover:shadow-md"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {i.main_goal || "Intake sin objetivo definido"}
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-500">
                              Origen: {i.source || "No indicado"}
                            </p>
                          </div>
                          <div className="text-right text-[11px] text-slate-500">
                            {i.status && (
                              <p className="mb-0.5">
                                Estado interno: {i.status}
                              </p>
                            )}
                            {i.created_at && (
                              <p>
                                Enviado el{" "}
                                {new Date(
                                  i.created_at
                                ).toLocaleDateString("de-DE")}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Futuro: historial de cambios / eventos */}
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-5">
                <h2 className="text-sm font-semibold text-slate-900">
                  Historial de cambios y eventos (pendiente)
                </h2>
                <p className="mt-1 text-[11px] text-slate-600">
                  Aquí vamos a mostrar en el futuro un registro cronológico de
                  acciones: cambios de datos del perfil; creación y cierre de
                  casos; notas internas relevantes; etc. La idea es que puedas
                  ver; en una sola línea de tiempo; todo lo que se ha hecho con
                  este cliente.
                </p>
                <p className="mt-2 text-[11px] text-slate-500">
                  A nivel técnico; esto se basará en una tabla{" "}
                  <code>case_events</code> o similar; alimentada cada vez que
                  edites algo importante desde el panel del asesor.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </section>
    </main>
  );
}
