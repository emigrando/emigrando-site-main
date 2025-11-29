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

interface IntakeDetail {
  id: string;
  created_at: string;
  user_id: string | null;
  source: string | null;
  status: string;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  second_last_name: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  main_goal: string | null;
  birth_country: string | null;
  current_country: string | null;
  current_city: string | null;
  housing_type: string | null;
  marital_status: string | null;
  has_children: boolean | null;
  raw: any;
}

interface IntakeChild {
  id: string;
  first_name: string | null;
  last_name: string | null;
  date_of_birth: string | null;
  lives_in_germany: boolean | null;
}

export default function IntakeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [intake, setIntake] = useState<IntakeDetail | null>(null);
  const [children, setChildren] = useState<IntakeChild[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [creatingCase, setCreatingCase] = useState(false);
  const [caseMsg, setCaseMsg] = useState<string | null>(null);

  const [savingIntake, setSavingIntake] = useState(false);
  const [intakeMsg, setIntakeMsg] = useState<string | null>(null);

  const [showRaw, setShowRaw] = useState(false);

  const id = params?.id as string | undefined;

  // Estado editable del intake
  const [form, setForm] = useState<{
    fullName: string;
    email: string;
    phone: string;
    birthCountry: string;
    currentCity: string;
    currentCountry: string;
    housingType: string;
    maritalStatus: string;
    mainGoal: string;
    hasChildren: "" | "yes" | "no";
  }>({
    fullName: "",
    email: "",
    phone: "",
    birthCountry: "",
    currentCity: "",
    currentCountry: "",
    housingType: "",
    maritalStatus: "",
    mainGoal: "",
    hasChildren: "",
  });

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!id) {
        setErr("No se encontró el identificador del intake en la URL.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setErr(null);

      const { data, error } = await supabase
        .from("intake_submissions")
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
        setErr("No se encontró ningún intake con este identificador.");
        setLoading(false);
        return;
      }

      const detail = data as IntakeDetail;
      setIntake(detail);

      // Inicializar formulario editable con los datos actuales
      setForm({
        fullName: detail.full_name || "",
        email: detail.email || "",
        phone: detail.phone || "",
        birthCountry: detail.birth_country || "",
        currentCity: detail.current_city || "",
        currentCountry: detail.current_country || "",
        housingType: detail.housing_type || "",
        maritalStatus: detail.marital_status || "",
        mainGoal: detail.main_goal || "",
        hasChildren:
          detail.has_children === true
            ? "yes"
            : detail.has_children === false
            ? "no"
            : "",
      });

      const { data: childRows, error: childError } = await supabase
        .from("intake_children")
        .select("id, first_name, last_name, date_of_birth, lives_in_germany")
        .eq("intake_id", id)
        .order("id", { ascending: true });

      if (!isMounted) return;

      if (!childError && childRows) {
        setChildren(childRows as IntakeChild[]);
      }

      setLoading(false);
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id, supabase]);

  async function handleSaveIntake(e: React.FormEvent) {
    e.preventDefault();
    if (!intake || !id) return;

    setSavingIntake(true);
    setIntakeMsg(null);
    setErr(null);

    let hasChildrenValue: boolean | null = null;
    if (form.hasChildren === "yes") hasChildrenValue = true;
    if (form.hasChildren === "no") hasChildrenValue = false;

    const { error } = await supabase
      .from("intake_submissions")
      .update({
        full_name: form.fullName || null,
        email: form.email || null,
        phone: form.phone || null,
        birth_country: form.birthCountry || null,
        current_city: form.currentCity || null,
        current_country: form.currentCountry || null,
        housing_type: form.housingType || null,
        marital_status: form.maritalStatus || null,
        main_goal: form.mainGoal || null,
        has_children: hasChildrenValue,
      })
      .eq("id", id);

    if (error) {
      setErr(error.message);
      setSavingIntake(false);
      return;
    }

    // Refrescamos el estado base para que quede alineado
    setIntake((prev) =>
      prev
        ? {
            ...prev,
            full_name: form.fullName || null,
            email: form.email || null,
            phone: form.phone || null,
            birth_country: form.birthCountry || null,
            current_city: form.currentCity || null,
            current_country: form.currentCountry || null,
            housing_type: form.housingType || null,
            marital_status: form.maritalStatus || null,
            main_goal: form.mainGoal || null,
            has_children: hasChildrenValue,
          }
        : prev
    );

    setIntakeMsg("Cambios del intake guardados correctamente.");
    setSavingIntake(false);
  }

  async function handleCreateCase() {
  if (!intake) return;

  setCreatingCase(true);
  setCaseMsg(null);
  setErr(null);

  // 1) Usuario que está logueado (asesor / owner)
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    setErr("No se pudo determinar el usuario actual para crear el caso.");
    setCreatingCase(false);
    return;
  }

  const ownerId = userData.user.id;

  // 2) Cliente al que pertenece este intake (si lo hay)
  const clientId = intake.user_id; // Ojo: tu tipo IntakeDetail ya tiene user_id

  const { data, error } = await supabase
    .from("cases")
    .insert({
      owner_user_id: ownerId,
      client_user_id: clientId || null, // ← AQUÍ VINCULAMOS EL CASO AL CLIENTE
      cliente: intake.full_name || null,
      tipo:
        intake.main_goal ||
        "Caso creado automáticamente a partir de un intake",
      autoridad: null,
      estado: "nuevo",
      ultimo_movimiento: `Caso creado desde intake ${intake.id}`,
      proximo_plazo: null,
      notas_breves: `Caso creado desde el intake ${intake.id}. Revisar raw para más detalles.`,
      prioridad: "media",
      client_progress_percent: null,
      client_phase_label: "Caso recién creado",
      client_last_update: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
    })
    .select("id")
    .single();

  if (error) {
    setErr(error.message);
    setCreatingCase(false);
    return;
  }

  const newCaseId = (data as any).id as string;
  setCaseMsg("Caso creado correctamente. Abriendo el tablero del caso...");
  setCreatingCase(false);

  router.push(`/dashboard/asesor/caso/${newCaseId}`);
}

  return (
    <DashboardGuard allowedRoles={["asesor", "admin"]}>
      <main className="min-h-screen bg-gradient-to-b from-[#f5f7fb] to-white text-slate-900">
        <section className="mx-auto max-w-5xl px-4 pt-20 pb-16 lg:pt-24 lg:pb-20">
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
                onClick={() => router.push("/dashboard/asesor/intakes")}
                className="text-[11px] font-medium text-slate-500 hover:text-slate-800"
              >
                ← Volver al listado de intakes
              </button>
              <p className="mt-2 text-xs font-medium text-indigo-700 uppercase tracking-[0.18em]">
                Detalle del intake
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                {form.fullName || intake?.full_name || "Intake sin nombre definido"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Vista ampliada y editable del formulario enviado por la persona.
                Aquí puedes corregir datos; completar información y; si quieres;
                abrir un caso interno a partir de este intake.
              </p>
            </div>
            <div className="mt-1 flex flex-col items-end gap-2 md:mt-0">
              {intake?.status && (
                <span className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-slate-50 shadow-md">
                  {intake.status}
                </span>
              )}
              <LogoutButton />
            </div>
          </motion.div>

          {/* Estado carga / error */}
          {loading && (
            <p className="text-sm text-slate-600">
              Cargando datos del intake desde Supabase...
            </p>
          )}

          {!loading && err && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {err}
            </div>
          )}

          {!loading && !err && intake && (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
              className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]"
            >
              {/* Columna izquierda: datos estructurados + editables */}
              <div className="space-y-4">
                <form
                  onSubmit={handleSaveIntake}
                  className="rounded-2xl border border-slate-100 bg-white/95 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)] space-y-4"
                >
                  <p className="text-[11px] font-medium text-slate-500">
                    Datos principales del intake
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-[11px] font-medium text-slate-600">
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                        value={form.fullName}
                        onChange={(e) => updateField("fullName", e.target.value)}
                        placeholder="Ej: Juan Carlos Pérez Gómez"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600">
                        Fecha de envío
                      </label>
                      <p className="mt-1 text-xs text-slate-700">
                        {new Date(intake.created_at).toLocaleString("de-DE", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-[11px] font-medium text-slate-600">
                        Correo electrónico
                      </label>
                      <input
                        type="email"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                        value={form.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        placeholder="correo@ejemplo.com"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600">
                        Teléfono / móvil
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                        value={form.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        placeholder="Incluye prefijo si está fuera de Alemania"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-[11px] font-medium text-slate-600">
                        País de nacimiento
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                        value={form.birthCountry}
                        onChange={(e) =>
                          updateField("birthCountry", e.target.value)
                        }
                        placeholder="Venezuela; Colombia; etc."
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600">
                        País / ciudad actual
                      </label>
                      <div className="mt-1 grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                          value={form.currentCity}
                          onChange={(e) =>
                            updateField("currentCity", e.target.value)
                          }
                          placeholder="Ciudad"
                        />
                        <input
                          type="text"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                          value={form.currentCountry}
                          onChange={(e) =>
                            updateField("currentCountry", e.target.value)
                          }
                          placeholder="País"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-[11px] font-medium text-slate-600">
                        Tipo de vivienda
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                        value={form.housingType}
                        onChange={(e) =>
                          updateField("housingType", e.target.value)
                        }
                        placeholder="Wohnheim; piso alquilado; con familiares..."
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600">
                        Estado civil
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                        value={form.maritalStatus}
                        onChange={(e) =>
                          updateField("maritalStatus", e.target.value)
                        }
                        placeholder="Soltero/a; casado/a; separado/a..."
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-[11px] font-medium text-slate-600">
                        ¿Tiene hijos?
                      </label>
                      <select
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                        value={form.hasChildren}
                        onChange={(e) =>
                          updateField(
                            "hasChildren",
                            e.target.value as "" | "yes" | "no"
                          )
                        }
                      >
                        <option value="">Sin especificar</option>
                        <option value="yes">Sí</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600">
                      Objetivo o servicio principal solicitado
                    </label>
                    <textarea
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                      rows={3}
                      value={form.mainGoal}
                      onChange={(e) =>
                        updateField("mainGoal", e.target.value)
                      }
                      placeholder="Qué quiere lograr la persona; en sus propias palabras."
                    />
                  </div>

                  {intakeMsg && (
                    <p className="text-[11px] text-emerald-600 leading-relaxed">
                      {intakeMsg}
                    </p>
                  )}
                  {err && !creatingCase && !savingIntake && (
                    <p className="text-[11px] text-rose-600 leading-relaxed">
                      {err}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="submit"
                      disabled={savingIntake}
                      className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-700 hover:shadow-lg transition disabled:opacity-60"
                    >
                      {savingIntake
                        ? "Guardando cambios del intake..."
                        : "Guardar cambios del intake"}
                    </button>
                    <p className="text-[11px] text-slate-500">
                      Estos datos vienen del formulario que rellenó la persona;
                      pero tú puedes corregirlos aquí según la realidad del
                      expediente.
                    </p>
                  </div>
                </form>

                {/* Hijos declarados (de momento solo lectura; luego hacemos CRUD) */}
                {children.length > 0 && (
                  <div className="rounded-2xl border border-slate-100 bg-white/95 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
                    <p className="text-[11px] font-medium text-slate-500">
                      Hijos declarados en el intake
                    </p>
                    <ul className="mt-2 space-y-2 text-xs text-slate-700">
                      {children.map((child) => (
                        <li
                          key={child.id}
                          className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2"
                        >
                          <p className="font-semibold text-slate-900">
                            {child.first_name} {child.last_name}
                          </p>
                          <p className="text-[11px] text-slate-600">
                            Fecha de nacimiento:{" "}
                            {child.date_of_birth || "No indicada"}
                          </p>
                          {child.lives_in_germany !== null && (
                            <p className="text-[11px] text-slate-600">
                              Vive en Alemania:{" "}
                              {child.lives_in_germany ? "Sí" : "No"}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Columna derecha: acción + raw */}
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-100 bg-white/95 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Crear caso desde este intake
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Esto creará un registro en tu tablero de casos; con este
                    cliente como titular y el objetivo del intake como tipo de
                    caso.
                  </p>

                  {caseMsg && (
                    <p className="mt-3 text-[11px] text-emerald-600">
                      {caseMsg}
                    </p>
                  )}
                  {err && creatingCase && (
                    <p className="mt-2 text-[11px] text-rose-600">
                      {err}
                    </p>
                  )}

                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={handleCreateCase}
                      disabled={creatingCase}
                      className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-700 hover:shadow-lg transition disabled:opacity-60"
                    >
                      {creatingCase
                        ? "Creando caso..."
                        : "Crear caso en el tablero"}
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-900/40 bg-slate-900 p-5 text-slate-50 shadow-[0_18px_50px_rgba(15,23,42,0.70)]">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h2 className="text-sm font-semibold">
                        Raw del intake (solo uso interno)
                      </h2>
                      <p className="mt-1 text-[11px] text-slate-300">
                        Normalmente no necesitas ver esto. Úsalo solo si hace
                        falta revisar un dato que todavía no esté mapeado arriba.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowRaw((prev) => !prev)}
                      className="rounded-full border border-slate-500/60 px-3 py-1 text-[11px] font-semibold text-slate-100 hover:bg-slate-800/80 transition"
                    >
                      {showRaw ? "Ocultar JSON" : "Mostrar JSON"}
                    </button>
                  </div>

                  {showRaw && (
                    <pre className="mt-3 max-h-64 overflow-auto rounded-xl bg-slate-950/60 p-3 text-[10px] leading-relaxed text-slate-100">
                      {JSON.stringify(intake.raw, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </section>
      </main>
    </DashboardGuard>
  );
}
