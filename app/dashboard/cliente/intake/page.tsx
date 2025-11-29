"use client";

import { useEffect, useState } from "react";
import type React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

type YesNo = "yes" | "no" | "";

interface ChildForm {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  livesInGermany: YesNo;
}

const steps = [
  { id: 1, label: "Datos personales" },
  { id: 2, label: "Situación actual" },
  { id: 3, label: "Familia" },
  { id: 4, label: "Estudios e idiomas" },
  { id: 5, label: "Trabajo y apoyos" },
  { id: 6, label: "Objetivo y planes" },
];

export default function ClienteIntakePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [existingIntakeId, setExistingIntakeId] = useState<string | null>(null);

  const [step, setStep] = useState(0); // índice en steps

  const [form, setForm] = useState({
    // Objetivo principal
    mainGoal: "",

    // Datos personales
    firstName: "",
    middleName: "",
    lastName: "",
    secondLastName: "",
    email: "",
    phone: "",

    // Situación actual
    birthCountry: "",
    currentCountry: "",
    currentCity: "",
    housingType: "",

    // Familia
    maritalStatus: "",
    hasChildren: "" as YesNo,

    // Estudios e idiomas
    highestEducation: "",
    studyArea: "",
    degreeCountry: "",
    recognitionStatus: "",
    nativeLanguage: "",
    germanLevel: "",
    germanCertificate: "",
    germanCourse: "",
    otherLanguages: "",

    // Trabajo y apoyos
    currentlyWorking: "",
    reasonNotWorking: "",
    currentActivityType: "",
    workStudyArea: "",
    trainingDuration: "",
    authority: "",
    benefitStatus: "",
    benefits: "",

    // Asilo / procesos legales básicos (se guardan en raw)
    residenceType: "",
    residenceValidUntil: "",
    hasFiktionsbescheinigung: "" as YesNo,
    hasAsylumBamfOpen: "" as YesNo,
    hasAsylumAppeal: "" as YesNo,
    court: "",
    entryToGermany: "",
    bamfApplicationDate: "",

    // UE / matrimonio / empresa (nuevo)
    isEuCitizen: "" as YesNo,
    wantsToMarryInGermany: "" as YesNo,
    hasForeignMarriageCertificate: "" as YesNo,
    hasMarriageApostille: "" as YesNo,
    partnerInGermany: "" as YesNo,
    partnerDetails: "",
    wantsToCreateCompany: "" as YesNo,
    companyIdea: "",
    companySector: "",
  });

  const [children, setChildren] = useState<ChildForm[]>([]);

  // Cargar último intake y, si no hay, prellenar desde profiles / auth
  useEffect(() => {
    let isMounted = true;
    const supabase = createSupabaseBrowserClient();

    async function loadData() {
      setLoading(true);
      setErrorMsg(null);

      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData?.user) {
        if (!isMounted) return;
        setErrorMsg(
          "No se pudo verificar tu sesión. Inicia sesión de nuevo por favor."
        );
        setLoading(false);
        return;
      }

      const userId = userData.user.id;
      const userEmail = userData.user.email || "";

      // 1) Ver si ya existe intake del usuario (por user_id, NO por id)
      const { data: intake, error: intakeError } = await supabase
        .from("intake_submissions")
        .select(
          "id, created_at, first_name, middle_name, last_name, second_last_name, email, phone, main_goal, birth_country, current_country, current_city, housing_type, marital_status, has_children, raw"
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!isMounted) return;

      if (intakeError) {
        setErrorMsg(intakeError.message);
        setLoading(false);
        return;
      }

      if (intake) {
        // Ya existe intake → lo usamos como base
        setExistingIntakeId(intake.id);

        const hasChildrenVal =
          intake.has_children === true
            ? ("yes" as YesNo)
            : intake.has_children === false
            ? ("no" as YesNo)
            : ("" as YesNo);

        const baseForm = {
          ...form,
          firstName: intake.first_name || "",
          middleName: intake.middle_name || "",
          lastName: intake.last_name || "",
          secondLastName: intake.second_last_name || "",
          email: intake.email || userEmail,
          phone: intake.phone || "",
          mainGoal: intake.main_goal || "",
          birthCountry: intake.birth_country || "",
          currentCountry: intake.current_country || "",
          currentCity: intake.current_city || "",
          housingType: intake.housing_type || "",
          maritalStatus: intake.marital_status || "",
          hasChildren: hasChildrenVal,
        } as typeof form;

        // Campos extra desde raw (si existen)
        if (intake.raw && typeof intake.raw === "object") {
          const r = intake.raw as any;
          setForm({
            ...baseForm,
            phone: r.phone ?? baseForm.phone,
            highestEducation: r.highestEducation ?? "",
            studyArea: r.studyArea ?? "",
            degreeCountry: r.degreeCountry ?? "",
            recognitionStatus: r.recognitionStatus ?? "",
            nativeLanguage: r.nativeLanguage ?? "",
            germanLevel: r.germanLevel ?? "",
            germanCertificate: r.germanCertificate ?? "",
            germanCourse: r.germanCourse ?? "",
            otherLanguages: r.otherLanguages ?? "",
            currentlyWorking: r.currentlyWorking ?? "",
            reasonNotWorking: r.reasonNotWorking ?? "",
            currentActivityType: r.currentActivityType ?? "",
            workStudyArea: r.workStudyArea ?? "",
            trainingDuration: r.trainingDuration ?? "",
            authority: r.authority ?? "",
            benefitStatus: r.benefitStatus ?? "",
            benefits: r.benefits ?? "",
            residenceType: r.residenceType ?? "",
            residenceValidUntil: r.residenceValidUntil ?? "",
            hasFiktionsbescheinigung:
              r.hasFiktionsbescheinigung ?? baseForm.hasFiktionsbescheinigung,
            hasAsylumBamfOpen: r.hasAsylumBamfOpen ?? baseForm.hasAsylumBamfOpen,
            hasAsylumAppeal: r.hasAsylumAppeal ?? baseForm.hasAsylumAppeal,
            court: r.court ?? "",
            entryToGermany: r.entryToGermany ?? "",
            bamfApplicationDate: r.bamfApplicationDate ?? "",
            isEuCitizen: r.isEuCitizen ?? "",
            wantsToMarryInGermany: r.wantsToMarryInGermany ?? "",
            hasForeignMarriageCertificate:
              r.hasForeignMarriageCertificate ?? "",
            hasMarriageApostille: r.hasMarriageApostille ?? "",
            partnerInGermany: r.partnerInGermany ?? "",
            partnerDetails: r.partnerDetails ?? "",
            wantsToCreateCompany: r.wantsToCreateCompany ?? "",
            companyIdea: r.companyIdea ?? "",
            companySector: r.companySector ?? "",
          });
        } else {
          setForm(baseForm);
        }

        if (intake.created_at) {
          try {
            const d = new Date(intake.created_at);
            setLastUpdated(
              d.toLocaleString("de-DE", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            );
          } catch {
            setLastUpdated(null);
          }
        }

        // Hijos asociados al intake existente
        const { data: childrenRows } = await supabase
          .from("intake_children")
          .select(
            "first_name, last_name, date_of_birth, lives_in_germany, intake_id"
          )
          .eq("intake_id", intake.id);

        if (!isMounted) return;

        if (childrenRows && childrenRows.length > 0) {
          setChildren(
            (childrenRows as any[]).map((c) => ({
              firstName: c.first_name || "",
              lastName: c.last_name || "",
              dateOfBirth: c.date_of_birth || "",
              livesInGermany:
                c.lives_in_germany === true
                  ? ("yes" as YesNo)
                  : c.lives_in_germany === false
                  ? ("no" as YesNo)
                  : ("" as YesNo),
            }))
          );
        }
      } else {
        // No existe intake → prellenamos desde profiles / auth
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("id", userId)
          .maybeSingle();

        if (!isMounted) return;

        setForm((prev) => ({
          ...prev,
          firstName: profile?.first_name || "",
          lastName: profile?.last_name || "",
          email: userEmail,
        }));
      }

      setLoading(false);
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  function updateField<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateChild(index: number, field: keyof ChildForm, value: string) {
    setChildren((prev) =>
      prev.map((child, i) =>
        i === index ? { ...child, [field]: value } : child
      )
    );
  }

  function addChild() {
    setChildren((prev) => [
      ...prev,
      { firstName: "", lastName: "", dateOfBirth: "", livesInGermany: "" },
    ]);
  }

  function removeChild(index: number) {
    setChildren((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setOkMsg(null);
    setSaving(true);

    const supabase = createSupabaseBrowserClient();

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      setErrorMsg(
        "No se pudo verificar tu sesión. Inicia sesión de nuevo por favor."
      );
      setSaving(false);
      return;
    }

    const userId = userData.user.id;

    const hasChildrenBool =
      form.hasChildren === "yes"
        ? true
        : form.hasChildren === "no"
        ? false
        : null;

    const fullNameParts = [
      form.firstName,
      form.middleName,
      form.lastName,
      form.secondLastName,
    ].filter(Boolean);
    const fullName = fullNameParts.join(" ");

    const rawPayload = {
      ...form,
      children,
    };

    const mainPayload: any = {
      user_id: userId,
      source: "dashboard_cliente",
      status: "nuevo",
      first_name: form.firstName || null,
      middle_name: form.middleName || null,
      last_name: form.lastName || null,
      second_last_name: form.secondLastName || null,
      full_name: fullName || null,
      email: form.email || null,
      phone: form.phone || null,
      main_goal: form.mainGoal || null,
      birth_country: form.birthCountry || null,
      current_country: form.currentCountry || null,
      current_city: form.currentCity || null,
      housing_type: form.housingType || null,
      marital_status: form.maritalStatus || null,
      has_children: hasChildrenBool,
      raw: rawPayload,
    };

    let intakeId: string;
    let createdAt: string | null = null;

    if (existingIntakeId) {
      const { data: updated, error: updateError } = await supabase
        .from("intake_submissions")
        .update(mainPayload)
        .eq("id", existingIntakeId)
        .select("id, created_at")
        .single();

      if (updateError) {
        setErrorMsg(updateError.message);
        setSaving(false);
        return;
      }

      intakeId = (updated as any).id as string;
      createdAt = (updated as any).created_at || null;

      // Limpiar hijos anteriores y reinsertar
      await supabase.from("intake_children").delete().eq("intake_id", intakeId);
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from("intake_submissions")
        .insert(mainPayload)
        .select("id, created_at")
        .single();

      if (insertError) {
        setErrorMsg(insertError.message);
        setSaving(false);
        return;
      }

      intakeId = (inserted as any).id as string;
      createdAt = (inserted as any).created_at || null;
      setExistingIntakeId(intakeId);
    }

    const cleanChildren = children.filter(
      (c) =>
        c.firstName.trim() ||
        c.lastName.trim() ||
        c.dateOfBirth.trim() ||
        c.livesInGermany !== ""
    );

    if (cleanChildren.length > 0) {
      const rows = cleanChildren.map((c) => ({
        intake_id: intakeId,
        first_name: c.firstName || null,
        last_name: c.lastName || null,
        date_of_birth: c.dateOfBirth || null,
        lives_in_germany:
          c.livesInGermany === "yes"
            ? true
            : c.livesInGermany === "no"
            ? false
            : null,
      }));

      const { error: childError } = await supabase
        .from("intake_children")
        .insert(rows);

      if (childError) {
        setErrorMsg(
          "Tus datos básicos se guardaron; pero hubo un problema guardando los datos de hijos: " +
            childError.message
        );
        setSaving(false);
        return;
      }
    }

    if (createdAt) {
      try {
        const d = new Date(createdAt);
        setLastUpdated(
          d.toLocaleString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        );
      } catch {
        // ignorar
      }
    }

    setOkMsg(
      "Tus datos se han guardado correctamente. Puedes volver al panel del cliente cuando quieras."
    );
    setSaving(false);
  }

  function goNextStep() {
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  }

  function goPrevStep() {
    setStep((prev) => Math.max(prev - 1, 0));
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f5f7fb] to-white text-slate-900">
      <section className="mx-auto max-w-4xl px-4 pt-20 pb-16 lg:pt-24 lg:pb-20">
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
              onClick={() => router.push("/dashboard/cliente")}
              className="text-[11px] font-medium text-slate-500 hover:text-slate-800"
            >
              ← Volver al panel del cliente
            </button>
            <p className="mt-2 text-xs font-medium text-indigo-700 uppercase tracking-[0.18em]">
              Tus datos básicos
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Información para trabajar tu caso
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Este formulario nos permite entender mejor tu situación; país en el
              que estás; familia; estudios; idiomas y objetivos. Puedes
              actualizarlo cuando lo necesites. No es obligatorio rellenar todos
              los campos; llena lo que te parezca relevante.
            </p>
            {lastUpdated && (
              <p className="mt-2 text-[11px] text-slate-500">
                Última vez que guardaste este formulario: {lastUpdated}
              </p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
          className="rounded-2xl border border-slate-100 bg-white/95 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
        >
          {/* Stepper */}
          <div className="mb-6">
            <div className="flex items-center justify-between gap-2">
              {steps.map((s, idx) => {
                const active = idx === step;
                const completed = idx < step;
                return (
                  <div
                    key={s.id}
                    className="flex-1 flex flex-col items-center min-w-0"
                  >
                    <div
                      className={
                        "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold " +
                        (active
                          ? "bg-indigo-600 text-white shadow-md"
                          : completed
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-100 text-slate-500")
                      }
                    >
                      {s.id}
                    </div>
                    <p className="mt-1 text-[10px] text-center text-slate-500 truncate">
                      {s.label}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 h-1 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-1 rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-violet-500 transition-all"
                style={{
                  width: `${((step + 1) / steps.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-slate-600">
              Cargando tus datos desde Supabase...
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 text-sm">
              {/* CONTENIDO DE CADA PASO */}
              {step === 0 && (
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Datos personales
                  </h2>
                  <p className="text-xs text-slate-500">
                    Puedes corregir tu nombre o correo si es necesario. No es
                    obligatorio completar todos los campos.
                  </p>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="text-xs text-slate-600">
                        Nombre (como en tu pasaporte)
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                        value={form.firstName}
                        onChange={(e) =>
                          updateField("firstName", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600">
                        Segundo nombre (si tienes)
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                        value={form.middleName}
                        onChange={(e) =>
                          updateField("middleName", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600">
                        Primer apellido
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                        value={form.lastName}
                        onChange={(e) =>
                          updateField("lastName", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600">
                        Segundo apellido
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                        value={form.secondLastName}
                        onChange={(e) =>
                          updateField("secondLastName", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="text-xs text-slate-600">
                        Correo electrónico
                      </label>
                      <input
                        type="email"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                        value={form.email}
                        onChange={(e) => updateField("email", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600">
                        Teléfono / WhatsApp (con código de país)
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                        value={form.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Situación actual
                  </h2>
                  <p className="text-xs text-slate-500">
                    Dónde naciste y dónde vives ahora; para entender tu contexto
                    migratorio.
                  </p>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="text-xs text-slate-600">
                        País de nacimiento
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                        value={form.birthCountry}
                        onChange={(e) =>
                          updateField("birthCountry", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600">
                        País donde vives actualmente
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                        value={form.currentCountry}
                        onChange={(e) =>
                          updateField("currentCountry", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="text-xs text-slate-600">
                        Ciudad actual
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                        value={form.currentCity}
                        onChange={(e) =>
                          updateField("currentCity", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600">
                        Tipo de vivienda actual
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                        placeholder="Ej: alquiler; refugio; vivienda propia; familiar..."
                        value={form.housingType}
                        onChange={(e) =>
                          updateField("housingType", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="text-xs text-slate-600">
                        Tipo de residencia o estatus (si aplica)
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                        placeholder="Ej: Aufenthalt §25 Abs.3; Duldung; Fiktionsbescheinigung; fuera de Alemania..."
                        value={form.residenceType}
                        onChange={(e) =>
                          updateField("residenceType", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600">
                        Vigencia de la residencia (si sabes la fecha)
                      </label>
                      <input
                        type="date"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                        value={form.residenceValidUntil}
                        onChange={(e) =>
                          updateField("residenceValidUntil", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <div>
                      <label className="text-xs text-slate-600">
                        ¿Tienes Fiktionsbescheinigung?
                      </label>
                      <div className="mt-2 flex gap-2 text-[11px]">
                        <button
                          type="button"
                          onClick={() =>
                            updateField("hasFiktionsbescheinigung", "yes")
                          }
                          className={
                            "rounded-full px-3 py-1 border " +
                            (form.hasFiktionsbescheinigung === "yes"
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-white text-slate-700")
                          }
                        >
                          Sí
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateField("hasFiktionsbescheinigung", "no")
                          }
                          className={
                            "rounded-full px-3 py-1 border " +
                            (form.hasFiktionsbescheinigung === "no"
                              ? "border-slate-800 bg-slate-900 text-slate-50"
                              : "border-slate-200 bg-white text-slate-700")
                          }
                        >
                          No
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-600">
                        ¿Tienes procedimiento de asilo BAMF abierto?
                      </label>
                      <div className="mt-2 flex gap-2 text-[11px]">
                        <button
                          type="button"
                          onClick={() =>
                            updateField("hasAsylumBamfOpen", "yes")
                          }
                          className={
                            "rounded-full px-3 py-1 border " +
                            (form.hasAsylumBamfOpen === "yes"
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-white text-slate-700")
                          }
                        >
                          Sí
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateField("hasAsylumBamfOpen", "no")
                          }
                          className={
                            "rounded-full px-3 py-1 border " +
                            (form.hasAsylumBamfOpen === "no"
                              ? "border-slate-800 bg-slate-900 text-slate-50"
                              : "border-slate-200 bg-white text-slate-700")
                          }
                        >
                          No
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-600">
                        ¿Tienes recurso de asilo en tribunal?
                      </label>
                      <div className="mt-2 flex gap-2 text-[11px]">
                        <button
                          type="button"
                          onClick={() =>
                            updateField("hasAsylumAppeal", "yes")
                          }
                          className={
                            "rounded-full px-3 py-1 border " +
                            (form.hasAsylumAppeal === "yes"
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-white text-slate-700")
                          }
                        >
                          Sí
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateField("hasAsylumAppeal", "no")
                          }
                          className={
                            "rounded-full px-3 py-1 border " +
                            (form.hasAsylumAppeal === "no"
                              ? "border-slate-800 bg-slate-900 text-slate-50"
                              : "border-slate-200 bg-white text-slate-700")
                          }
                        >
                          No
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <div>
                      <label className="text-xs text-slate-600">
                        Tribunal (si tienes proceso)
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                        placeholder="Ej: VG Dresden, VG Augsburg..."
                        value={form.court}
                        onChange={(e) => updateField("court", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600">
                        Fecha de entrada a Alemania (aprox.)
                      </label>
                      <input
                        type="date"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                        value={form.entryToGermany}
                        onChange={(e) =>
                          updateField("entryToGermany", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600">
                        Fecha de solicitud BAMF (si recuerdas)
                      </label>
                      <input
                        type="date"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                        value={form.bamfApplicationDate}
                        onChange={(e) =>
                          updateField("bamfApplicationDate", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Familia e hijos
                  </h2>
                  <p className="text-xs text-slate-500">
                    Esto nos ayuda a priorizar temas de colegio; kindergarten y
                    residencia familiar. No es obligatorio rellenar todo.
                  </p>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="text-xs text-slate-600">
                        Estado civil
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                        placeholder="Soltero/a; casado/a; pareja registrada; separado/a..."
                        value={form.maritalStatus}
                        onChange={(e) =>
                          updateField("maritalStatus", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600">
                        ¿Tienes hijos menores de 18 años?
                      </label>
                      <div className="mt-2 flex gap-2 text-[11px]">
                        <button
                          type="button"
                          onClick={() => updateField("hasChildren", "yes")}
                          className={
                            "rounded-full px-3 py-1 border " +
                            (form.hasChildren === "yes"
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-white text-slate-700")
                          }
                        >
                          Sí
                        </button>
                        <button
                          type="button"
                          onClick={() => updateField("hasChildren", "no")}
                          className={
                            "rounded-full px-3 py-1 border " +
                            (form.hasChildren === "no"
                              ? "border-slate-800 bg-slate-900 text-slate-50"
                              : "border-slate-200 bg-white text-slate-700")
                          }
                        >
                          No
                        </button>
                      </div>
                    </div>
                  </div>

                  {form.hasChildren === "yes" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-slate-700">
                          Hijos declarados
                        </p>
                        <button
                          type="button"
                          onClick={addChild}
                          className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700"
                        >
                          + Añadir hijo/a
                        </button>
                      </div>

                      {children.length === 0 && (
                        <p className="text-[11px] text-slate-500">
                          Puedes añadir información de tus hijos; por ejemplo
                          para colegio; kindergarten y residencia.
                        </p>
                      )}

                      {children.map((child, idx) => (
                        <div
                          key={idx}
                          className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-[11px] font-medium text-slate-700">
                              Hijo/a {idx + 1}
                            </p>
                            <button
                              type="button"
                              onClick={() => removeChild(idx)}
                              className="text-[11px] text-rose-600 hover:text-rose-700"
                            >
                              Quitar
                            </button>
                          </div>
                          <div className="grid gap-3 md:grid-cols-2">
                            <div>
                              <label className="text-[11px] text-slate-600">
                                Nombre
                              </label>
                              <input
                                type="text"
                                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
                                value={child.firstName}
                                onChange={(e) =>
                                  updateChild(idx, "firstName", e.target.value)
                                }
                              />
                            </div>
                            <div>
                              <label className="text-[11px] text-slate-600">
                                Apellido
                              </label>
                              <input
                                type="text"
                                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
                                value={child.lastName}
                                onChange={(e) =>
                                  updateChild(idx, "lastName", e.target.value)
                                }
                              />
                            </div>
                          </div>
                          <div className="grid gap-3 md:grid-cols-2">
                            <div>
                              <label className="text-[11px] text-slate-600">
                                Fecha de nacimiento
                              </label>
                              <input
                                type="date"
                                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
                                value={child.dateOfBirth}
                                onChange={(e) =>
                                  updateChild(
                                    idx,
                                    "dateOfBirth",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div>
                              <label className="text-[11px] text-slate-600">
                                ¿Vive actualmente en Alemania?
                              </label>
                              <div className="mt-2 flex gap-2 text-[11px]">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateChild(idx, "livesInGermany", "yes")
                                  }
                                  className={
                                    "rounded-full px-3 py-1 border " +
                                    (child.livesInGermany === "yes"
                                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                      : "border-slate-200 bg-white text-slate-700")
                                  }
                                >
                                  Sí
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateChild(idx, "livesInGermany", "no")
                                  }
                                  className={
                                    "rounded-full px-3 py-1 border " +
                                    (child.livesInGermany === "no"
                                      ? "border-slate-800 bg-slate-900 text-slate-50"
                                      : "border-slate-200 bg-white text-slate-700")
                                  }
                                >
                                  No
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Estudios e idiomas
                  </h2>
                  <p className="text-xs text-slate-500">
                    Esto ayuda para temas de reconocimiento de títulos; formación
                    y búsqueda de trabajo.
                  </p>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="text-xs text-slate-600">
                        Nivel de estudios más alto
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                        placeholder="Ej: bachiller; técnico; universitario; máster..."
                        value={form.highestEducation}
                        onChange={(e) =>
                          updateField("highestEducation", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600">
                        Área de estudio / profesión
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                        placeholder="Ej: enfermería; derecho; informática; construcción..."
                        value={form.studyArea}
                        onChange={(e) =>
                          updateField("studyArea", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="text-xs text-slate-600">
                        País donde obtuviste el título principal
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                        value={form.degreeCountry}
                        onChange={(e) =>
                          updateField("degreeCountry", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600">
                        ¿Reconocimiento / Anerkennung del título?
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                        placeholder="No iniciado; en proceso; parcial; completo..."
                        value={form.recognitionStatus}
                        onChange={(e) =>
                          updateField("recognitionStatus", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="text-xs text-slate-600">
                        Idioma nativo
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                        value={form.nativeLanguage}
                        onChange={(e) =>
                          updateField("nativeLanguage", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600">
                        Otros idiomas que hablas
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                        placeholder="Ej: inglés B2; francés básico..."
                        value={form.otherLanguages}
                        onChange={(e) =>
                          updateField("otherLanguages", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <div>
                      <label className="text-xs text-slate-600">
                        Nivel aproximado de alemán
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                        placeholder="A1; A2; B1; B2; C1..."
                        value={form.germanLevel}
                        onChange={(e) =>
                          updateField("germanLevel", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600">
                        Certificados de alemán (si tienes)
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                        placeholder="TELC B1; Goethe B2..."
                        value={form.germanCertificate}
                        onChange={(e) =>
                          updateField("germanCertificate", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600">
                        Cursos de alemán actuales o recientes
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                        placeholder="Ej: Integrationskurs; Berufssprachkurs..."
                        value={form.germanCourse}
                        onChange={(e) =>
                          updateField("germanCourse", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Trabajo y apoyos sociales
                  </h2>
                  <p className="text-xs text-slate-500">
                    No es una declaración fiscal; solo para entender mejor tu
                    situación laboral y de ingresos.
                  </p>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="text-xs text-slate-600">
                        ¿Estás trabajando actualmente?
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                        placeholder="Sí; no; minijob; Teilzeit; Ausbildung..."
                        value={form.currentlyWorking}
                        onChange={(e) =>
                          updateField("currentlyWorking", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600">
                        Si no trabajas; ¿por qué?
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                        value={form.reasonNotWorking}
                        onChange={(e) =>
                          updateField("reasonNotWorking", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="text-xs text-slate-600">
                        Actividad principal actual
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                        placeholder="Ej: Ausbildung; curso; cuidado de hijos; búsqueda activa..."
                        value={form.currentActivityType}
                        onChange={(e) =>
                          updateField("currentActivityType", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600">
                        Área en la que trabajas o quieres trabajar
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                        value={form.workStudyArea}
                        onChange={(e) =>
                          updateField("workStudyArea", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="text-xs text-slate-600">
                        Duración aproximada de tu formación/curso actual
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                        placeholder="Ej: 3 años; hasta 2027..."
                        value={form.trainingDuration}
                        onChange={(e) =>
                          updateField("trainingDuration", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600">
                        Autoridad principal que te gestiona
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                        placeholder="Jobcenter; Agentur für Arbeit; Sozialamt..."
                        value={form.authority}
                        onChange={(e) =>
                          updateField("authority", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="text-xs text-slate-600">
                        Situación de apoyos / beneficios
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                        placeholder="Ej: Bürgergeld; Wohngeld; Kinderzuschlag; sin ayudas..."
                        value={form.benefitStatus}
                        onChange={(e) =>
                          updateField("benefitStatus", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600">
                        Detalles de las ayudas (si quieres)
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                        value={form.benefits}
                        onChange={(e) =>
                          updateField("benefits", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Objetivo principal y planes especiales
                  </h2>
                  <p className="text-xs text-slate-500">
                    Ahora sí, cuéntanos qué quieres lograr y si hay temas
                    especiales como UE; matrimonio o empresa.
                  </p>

                  <div>
                    <label className="text-xs text-slate-600">
                      Objetivo principal de tu asesoría
                    </label>
                    <textarea
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                      rows={5}
                      value={form.mainGoal}
                      onChange={(e) =>
                        updateField("mainGoal", e.target.value)
                      }
                      placeholder="Ejemplos: regularizar mi estatus en Alemania; traer a mi familia; reconocimiento de título; encontrar un camino legal para estudiar o trabajar; etc."
                    />
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 space-y-3">
                    <p className="text-xs font-semibold text-slate-800">
                      ¿Eres ciudadano/a de la Unión Europea?
                    </p>
                    <div className="flex gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() => updateField("isEuCitizen", "yes")}
                        className={
                          "rounded-full px-3 py-1 border " +
                          (form.isEuCitizen === "yes"
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-white text-slate-700")
                        }
                      >
                        Sí
                      </button>
                      <button
                        type="button"
                        onClick={() => updateField("isEuCitizen", "no")}
                        className={
                          "rounded-full px-3 py-1 border " +
                          (form.isEuCitizen === "no"
                            ? "border-slate-800 bg-slate-900 text-slate-50"
                            : "border-slate-200 bg-white text-slate-700")
                        }
                      >
                        No
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 space-y-3">
                    <p className="text-xs font-semibold text-slate-800">
                      ¿Quieres casarte en Alemania o regular un matrimonio ya
                      existente?
                    </p>
                    <div className="flex gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() =>
                          updateField("wantsToMarryInGermany", "yes")
                        }
                        className={
                          "rounded-full px-3 py-1 border " +
                          (form.wantsToMarryInGermany === "yes"
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-white text-slate-700")
                        }
                      >
                        Sí
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateField("wantsToMarryInGermany", "no")
                        }
                        className={
                          "rounded-full px-3 py-1 border " +
                          (form.wantsToMarryInGermany === "no"
                            ? "border-slate-800 bg-slate-900 text-slate-50"
                            : "border-slate-200 bg-white text-slate-700")
                        }
                      >
                        No
                      </button>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 mt-3">
                      <div>
                        <label className="text-[11px] text-slate-600">
                          ¿Tienes acta de matrimonio extranjera?
                        </label>
                        <div className="mt-2 flex gap-2 text-[11px]">
                          <button
                            type="button"
                            onClick={() =>
                              updateField(
                                "hasForeignMarriageCertificate",
                                "yes"
                              )
                            }
                            className={
                              "rounded-full px-3 py-1 border " +
                              (form.hasForeignMarriageCertificate === "yes"
                                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                : "border-slate-200 bg-white text-slate-700")
                            }
                          >
                            Sí
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              updateField(
                                "hasForeignMarriageCertificate",
                                "no"
                              )
                            }
                            className={
                              "rounded-full px-3 py-1 border " +
                              (form.hasForeignMarriageCertificate === "no"
                                ? "border-slate-800 bg-slate-900 text-slate-50"
                                : "border-slate-200 bg-white text-slate-700")
                            }
                          >
                            No
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-600">
                          ¿Tiene apostilla el acta de matrimonio?
                        </label>
                        <div className="mt-2 flex gap-2 text-[11px]">
                          <button
                            type="button"
                            onClick={() =>
                              updateField("hasMarriageApostille", "yes")
                            }
                            className={
                              "rounded-full px-3 py-1 border " +
                              (form.hasMarriageApostille === "yes"
                                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                : "border-slate-200 bg-white text-slate-700")
                            }
                          >
                            Sí
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              updateField("hasMarriageApostille", "no")
                            }
                            className={
                              "rounded-full px-3 py-1 border " +
                              (form.hasMarriageApostille === "no"
                                ? "border-slate-800 bg-slate-900 text-slate-50"
                                : "border-slate-200 bg-white text-slate-700")
                            }
                          >
                            No
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 mt-3">
                      <div>
                        <label className="text-[11px] text-slate-600">
                          ¿Tu pareja vive en Alemania?
                        </label>
                        <div className="mt-2 flex gap-2 text-[11px]">
                          <button
                            type="button"
                            onClick={() =>
                              updateField("partnerInGermany", "yes")
                            }
                            className={
                              "rounded-full px-3 py-1 border " +
                              (form.partnerInGermany === "yes"
                                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                : "border-slate-200 bg-white text-slate-700")
                            }
                          >
                            Sí
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              updateField("partnerInGermany", "no")
                            }
                            className={
                              "rounded-full px-3 py-1 border " +
                              (form.partnerInGermany === "no"
                                ? "border-slate-800 bg-slate-900 text-slate-50"
                                : "border-slate-200 bg-white text-slate-700")
                            }
                          >
                            No
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-600">
                          Detalles relevantes sobre tu pareja (opcional)
                        </label>
                        <input
                          type="text"
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
                          placeholder="Ciudad donde vive; nacionalidad; tipo de residencia..."
                          value={form.partnerDetails}
                          onChange={(e) =>
                            updateField("partnerDetails", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 space-y-3">
                    <p className="text-xs font-semibold text-slate-800">
                      ¿Quieres crear una empresa o actividad propia en Alemania?
                    </p>
                    <div className="flex gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() =>
                          updateField("wantsToCreateCompany", "yes")
                        }
                        className={
                          "rounded-full px-3 py-1 border " +
                          (form.wantsToCreateCompany === "yes"
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-white text-slate-700")
                        }
                      >
                        Sí
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateField("wantsToCreateCompany", "no")
                        }
                        className={
                          "rounded-full px-3 py-1 border " +
                          (form.wantsToCreateCompany === "no"
                            ? "border-slate-800 bg-slate-900 text-slate-50"
                            : "border-slate-200 bg-white text-slate-700")
                        }
                      >
                        No
                      </button>
                    </div>

                    {form.wantsToCreateCompany === "yes" && (
                      <div className="grid gap-3 md:grid-cols-2 mt-3">
                        <div>
                          <label className="text-[11px] text-slate-600">
                            Idea de negocio (breve)
                          </label>
                          <input
                            type="text"
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
                            placeholder="Ej: asesoría, comida, transporte, digital..."
                            value={form.companyIdea}
                            onChange={(e) =>
                              updateField("companyIdea", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-600">
                            Sector principal
                          </label>
                          <input
                            type="text"
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
                            value={form.companySector}
                            onChange={(e) =>
                              updateField("companySector", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mensajes */}
              {errorMsg && (
                <p className="text-[11px] text-rose-600 leading-relaxed">
                  {errorMsg}
                </p>
              )}
              {okMsg && (
                <p className="text-[11px] text-emerald-600 leading-relaxed">
                  {okMsg}
                </p>
              )}

              {/* Navegación del stepper + botón guardar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={goPrevStep}
                    disabled={step === 0}
                    className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  {step < steps.length - 1 && (
                    <button
                      type="button"
                      onClick={goNextStep}
                      className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-slate-50 shadow-md hover:bg-slate-800"
                    >
                      Siguiente
                    </button>
                  )}
                </div>

                {step === steps.length - 1 && (
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 hover:shadow-lg transition disabled:opacity-60"
                  >
                    {saving ? "Guardando..." : "Guardar mis datos"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => router.push("/dashboard/cliente")}
                  className="ml-auto text-[11px] text-slate-500 hover:text-slate-800"
                >
                  Volver al panel del cliente sin guardar
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </section>
    </main>
  );
}
