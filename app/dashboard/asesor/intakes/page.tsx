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
  const [showRaw, setShowRaw] = useState(false);

  const [creatingCase, setCreatingCase] = useState(false);
  const [caseMsg, setCaseMsg] = useState<string | null>(null);

  const id = params?.id as string | undefined;

  function toYesNo(val: any): string {
    if (val === "yes" || val === true) return "Sí";
    if (val === "no" || val === false) return "No";
    return "";
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

      setIntake(data as IntakeDetail);

      const { data: childRows, error: childError } = await supabase
        .from("intake_children")
        .select("id, first_name, last_name, date_of_birth, lives_in_germany")
        .eq("intake_id", id)
        .order("id", { ascending: true });

      if (childError) {
        console.error("Error cargando hijos del intake:", childError.message);
        setChildren([]);
      } else {
        setChildren((childRows || []) as IntakeChild[]);
      }

      setLoading(false);
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id, supabase]);

  async function handleCreateCase() {
    if (!intake) return;

    setCreatingCase(true);
    setCaseMsg(null);
    setErr(null);

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      setErr("No se pudo determinar el usuario actual para crear el caso.");
      setCreatingCase(false);
      return;
    }

    const ownerId = userData.user.id;

    const { data, error } = await supabase
  .from("cases")
  .insert({
    owner_user_id: ownerId,
    client_user_id: intake.user_id,      // ← ESTA LÍNEA
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

  const extra = (intake?.raw ?? {}) as any;

  const hasExtraInfo =
    extra.highestEducation ||
    extra.studyArea ||
    extra.degreeCountry ||
    extra.recognitionStatus ||
    extra.nativeLanguage ||
    extra.germanLevel ||
    extra.germanCertificate ||
    extra.germanCourse ||
    extra.otherLanguages ||
    extra.currentlyWorking ||
    extra.currentActivityType ||
    extra.workStudyArea ||
    extra.trainingDuration ||
    extra.authority ||
    extra.benefitStatus ||
    extra.benefits ||
    extra.residenceType ||
    extra.residenceValidUntil ||
    extra.hasFiktionsbescheinigung ||
    extra.hasAsylumBamfOpen ||
    extra.hasAsylumAppeal ||
    extra.court ||
    extra.entryToGermany ||
    extra.bamfApplicationDate ||
    extra.isEuCitizen ||
    extra.wantsToMarryInGermany ||
    extra.hasForeignMarriageCertificate ||
    extra.hasMarriageApostille ||
    extra.partnerInGermany ||
    extra.partnerDetails ||
    extra.wantsToCreateCompany ||
    extra.companyIdea ||
    extra.companySector ||
    extra.mainGoal;

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
                {intake?.full_name || "Intake sin nombre definido"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Vista ampliada del formulario enviado por la persona. Sirve como
                base para decidir si abres un caso completo en tu tablero
                interno de trabajo.
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
              {/* Columna izquierda: datos estructurados + info extendida */}
              <div className="space-y-4">
                {/* Datos básicos */}
                <div className="rounded-2xl border border-slate-100 bg-white/95 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
                  <p className="text-[11px] font-medium text-slate-500">
                    ID del intake
                  </p>
                  <p className="text-xs font-mono text-slate-700">
                    {intake.id}
                  </p>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-medium text-slate-500">
                        Nombre completo
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {intake.full_name || "Sin nombre definido"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-slate-500">
                        Fecha de envío
                      </p>
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

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-medium text-slate-500">
                        Correo electrónico
                      </p>
                      <p className="mt-1 text-sm text-slate-800">
                        {intake.email || "Sin correo"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-slate-500">
                        Teléfono / móvil
                      </p>
                      <p className="mt-1 text-sm text-slate-800">
                        {intake.phone || "Sin teléfono"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-medium text-slate-500">
                        País de nacimiento
                      </p>
                      <p className="mt-1 text-sm text-slate-800">
                        {intake.birth_country || "No indicado"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-slate-500">
                        País / ciudad actual
                      </p>
                      <p className="mt-1 text-sm text-slate-800">
                        {intake.current_city || intake.current_country ? (
                          <>
                            {intake.current_city && (
                              <span>{intake.current_city}</span>
                            )}
                            {intake.current_city && intake.current_country && (
                              <span>, </span>
                            )}
                            {intake.current_country && (
                              <span>{intake.current_country}</span>
                            )}
                          </>
                        ) : (
                          "No indicado"
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-medium text-slate-500">
                        Tipo de vivienda
                      </p>
                      <p className="mt-1 text-sm text-slate-800">
                        {intake.housing_type || "No indicado"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-slate-500">
                        Estado civil
                      </p>
                      <p className="mt-1 text-sm text-slate-800">
                        {intake.marital_status || "No indicado"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-[11px] font-medium text-slate-500">
                      Objetivo o servicio principal solicitado
                    </p>
                    <p className="mt-1 text-sm text-slate-800 whitespace-pre-line">
                      {intake.main_goal || extra.mainGoal || "No indicado"}
                    </p>
                  </div>

                  {children.length > 0 && (
                    <div className="mt-4">
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
                            <p className="text-[11px] text-slate-600">
                              Vive en Alemania:{" "}
                              {child.lives_in_germany === true
                                ? "Sí"
                                : child.lives_in_germany === false
                                ? "No"
                                : "No indicado"}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Info ampliada desde raw */}
                <div className="rounded-2xl border border-slate-100 bg-white/95 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.04)]">
                  <p className="text-sm font-semibold text-slate-900">
                    Información ampliada del formulario
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Resumen estructurado de los datos que la persona rellenó en
                    el intake extendido. Te ayuda a tener una foto rápida sin
                    leer el JSON completo.
                  </p>

                  {!hasExtraInfo && (
                    <p className="mt-3 text-[11px] text-slate-500">
                      Este intake no tiene todavía información ampliada
                      guardada en el campo raw. Probablemente es un formulario
                      antiguo o solo se rellenaron los campos básicos.
                    </p>
                  )}

                  {hasExtraInfo && (
                    <div className="mt-4 space-y-4 text-xs text-slate-700">
                      {/* Estudios e idiomas */}
                      {(extra.highestEducation ||
                        extra.studyArea ||
                        extra.degreeCountry ||
                        extra.recognitionStatus ||
                        extra.nativeLanguage ||
                        extra.germanLevel ||
                        extra.otherLanguages ||
                        extra.germanCertificate ||
                        extra.germanCourse) && (
                        <div>
                          <p className="text-[11px] font-semibold text-slate-800">
                            Estudios e idiomas
                          </p>
                          <div className="mt-1 grid gap-2 sm:grid-cols-2">
                            {extra.highestEducation && (
                              <div>
                                <p className="text-[11px] text-slate-500">
                                  Nivel de estudios
                                </p>
                                <p>{extra.highestEducation}</p>
                              </div>
                            )}
                            {extra.studyArea && (
                              <div>
                                <p className="text-[11px] text-slate-500">
                                  Área de estudio / profesión
                                </p>
                                <p>{extra.studyArea}</p>
                              </div>
                            )}
                            {extra.degreeCountry && (
                              <div>
                                <p className="text-[11px] text-slate-500">
                                  País del título principal
                                </p>
                                <p>{extra.degreeCountry}</p>
                              </div>
                            )}
                            {extra.recognitionStatus && (
                              <div>
                                <p className="text-[11px] text-slate-500">
                                  Reconocimiento del título
                                </p>
                                <p>{extra.recognitionStatus}</p>
                              </div>
                            )}
                            {extra.nativeLanguage && (
                              <div>
                                <p className="text-[11px] text-slate-500">
                                  Idioma nativo
                                </p>
                                <p>{extra.nativeLanguage}</p>
                              </div>
                            )}
                            {extra.otherLanguages && (
                              <div>
                                <p className="text-[11px] text-slate-500">
                                  Otros idiomas
                                </p>
                                <p>{extra.otherLanguages}</p>
                              </div>
                            )}
                            {extra.germanLevel && (
                              <div>
                                <p className="text-[11px] text-slate-500">
                                  Nivel aproximado de alemán
                                </p>
                                <p>{extra.germanLevel}</p>
                              </div>
                            )}
                            {extra.germanCertificate && (
                              <div>
                                <p className="text-[11px] text-slate-500">
                                  Certificados de alemán
                                </p>
                                <p>{extra.germanCertificate}</p>
                              </div>
                            )}
                            {extra.germanCourse && (
                              <div>
                                <p className="text-[11px] text-slate-500">
                                  Cursos de alemán
                                </p>
                                <p>{extra.germanCourse}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Trabajo y apoyos */}
                      {(extra.currentlyWorking ||
                        extra.reasonNotWorking ||
                        extra.currentActivityType ||
                        extra.workStudyArea ||
                        extra.trainingDuration ||
                        extra.authority ||
                        extra.benefitStatus ||
                        extra.benefits) && (
                        <div>
                          <p className="text-[11px] font-semibold text-slate-800">
                            Trabajo y apoyos sociales
                          </p>
                          <div className="mt-1 grid gap-2 sm:grid-cols-2">
                            {extra.currentlyWorking && (
                              <div>
                                <p className="text-[11px] text-slate-500">
                                  Situación laboral actual
                                </p>
                                <p>{extra.currentlyWorking}</p>
                              </div>
                            )}
                            {extra.reasonNotWorking && (
                              <div>
                                <p className="text-[11px] text-slate-500">
                                  Motivo de no trabajar
                                </p>
                                <p>{extra.reasonNotWorking}</p>
                              </div>
                            )}
                            {extra.currentActivityType && (
                              <div>
                                <p className="text-[11px] text-slate-500">
                                  Actividad principal
                                </p>
                                <p>{extra.currentActivityType}</p>
                              </div>
                            )}
                            {extra.workStudyArea && (
                              <div>
                                <p className="text-[11px] text-slate-500">
                                  Área en la que quiere trabajar / estudia
                                </p>
                                <p>{extra.workStudyArea}</p>
                              </div>
                            )}
                            {extra.trainingDuration && (
                              <div>
                                <p className="text-[11px] text-slate-500">
                                  Duración de formación / curso
                                </p>
                                <p>{extra.trainingDuration}</p>
                              </div>
                            )}
                            {extra.authority && (
                              <div>
                                <p className="text-[11px] text-slate-500">
                                  Autoridad principal
                                </p>
                                <p>{extra.authority}</p>
                              </div>
                            )}
                            {extra.benefitStatus && (
                              <div>
                                <p className="text-[11px] text-slate-500">
                                  Situación de ayudas
                                </p>
                                <p>{extra.benefitStatus}</p>
                              </div>
                            )}
                            {extra.benefits && (
                              <div>
                                <p className="text-[11px] text-slate-500">
                                  Detalles de ayudas
                                </p>
                                <p>{extra.benefits}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Situación legal básica */}
                      {(extra.residenceType ||
                        extra.residenceValidUntil ||
                        extra.hasFiktionsbescheinigung ||
                        extra.hasAsylumBamfOpen ||
                        extra.hasAsylumAppeal ||
                        extra.court ||
                        extra.entryToGermany ||
                        extra.bamfApplicationDate) && (
                        <div>
                          <p className="text-[11px] font-semibold text-slate-800">
                            Situación legal / residencia
                          </p>
                          <div className="mt-1 grid gap-2 sm:grid-cols-2">
                            {extra.residenceType && (
                              <div>
                                <p className="text-[11px] text-slate-500">
                                  Tipo de residencia / estatus
                                </p>
                                <p>{extra.residenceType}</p>
                              </div>
                            )}
                            {extra.residenceValidUntil && (
                              <div>
                                <p className="text-[11px] text-slate-500">
                                  Vigencia de la residencia
                                </p>
                                <p>{extra.residenceValidUntil}</p>
                              </div>
                            )}
                            {extra.hasFiktionsbescheinigung && (
                              <div>
                                <p className="text-[11px] text-slate-500">
                                  Fiktionsbescheinigung
                                </p>
                                <p>
                                  {toYesNo(extra.hasFiktionsbescheinigung) ||
                                    extra.hasFiktionsbescheinigung}
                                </p>
                              </div>
                            )}
                            {extra.hasAsylumBamfOpen && (
                              <div>
                                <p className="text-[11px] text-slate-500">
                                  Asilo BAMF abierto
                                </p>
                                <p>
                                  {toYesNo(extra.hasAsylumBamfOpen) ||
                                    extra.hasAsylumBamfOpen}
                                </p>
                              </div>
                            )}
                            {extra.hasAsylumAppeal && (
                              <div>
                                <p className="text-[11px] text-slate-500">
                                  Recurso de asilo en tribunal
                                </p>
                                <p>
                                  {toYesNo(extra.hasAsylumAppeal) ||
                                    extra.hasAsylumAppeal}
                                </p>
                              </div>
                            )}
                            {extra.court && (
                              <div>
                                <p className="text-[11px] text-slate-500">
                                  Tribunal
                                </p>
                                <p>{extra.court}</p>
                              </div>
                            )}
                            {extra.entryToGermany && (
                              <div>
                                <p className="text-[11px] text-slate-500">
                                  Entrada a Alemania
                                </p>
                                <p>{extra.entryToGermany}</p>
                              </div>
                            )}
                            {extra.bamfApplicationDate && (
                              <div>
                                <p className="text-[11px] text-slate-500">
                                  Fecha solicitud BAMF
                                </p>
                                <p>{extra.bamfApplicationDate}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* UE / matrimonio / empresa */}
                      {(extra.isEuCitizen ||
                        extra.wantsToMarryInGermany ||
                        extra.hasForeignMarriageCertificate ||
                        extra.hasMarriageApostille ||
                        extra.partnerInGermany ||
                        extra.partnerDetails ||
                        extra.wantsToCreateCompany ||
                        extra.companyIdea ||
                        extra.companySector) && (
                        <div>
                          <p className="text-[11px] font-semibold text-slate-800">
                            UE · matrimonio · empresa
                          </p>
                          <div className="mt-1 grid gap-2 sm:grid-cols-2">
                            {extra.isEuCitizen && (
                              <div>
                                <p className="text-[11px] text-slate-500">
                                  Ciudadanía UE
                                </p>
                                <p>
                                  {toYesNo(extra.isEuCitizen) ||
                                    extra.isEuCitizen}
                                </p>
                              </div>
                            )}
                            {extra.wantsToMarryInGermany && (
                              <div>
                                <p className="text-[11px] text-slate-500">
                                  Quiere casarse en Alemania
                                </p>
                                <p>
                                  {toYesNo(extra.wantsToMarryInGermany) ||
                                    extra.wantsToMarryInGermany}
                                </p>
                              </div>
                            )}
                            {extra.hasForeignMarriageCertificate && (
                              <div>
                                <p className="text-[11px] text-slate-500">
                                  Acta de matrimonio extranjera
                                </p>
                                <p>
                                  {toYesNo(extra.hasForeignMarriageCertificate) ||
                                    extra.hasForeignMarriageCertificate}
                                </p>
                              </div>
                            )}
                            {extra.hasMarriageApostille && (
                              <div>
                                <p className="text-[11px] text-slate-500">
                                  Apostilla del acta
                                </p>
                                <p>
                                  {toYesNo(extra.hasMarriageApostille) ||
                                    extra.hasMarriageApostille}
                                </p>
                              </div>
                            )}
                            {extra.partnerInGermany && (
                              <div>
                                <p className="text-[11px] text-slate-500">
                                  Pareja en Alemania
                                </p>
                                <p>
                                  {toYesNo(extra.partnerInGermany) ||
                                    extra.partnerInGermany}
                                </p>
                              </div>
                            )}
                            {extra.partnerDetails && (
                              <div>
                                <p className="text-[11px] text-slate-500">
                                  Detalles de la pareja
                                </p>
                                <p>{extra.partnerDetails}</p>
                              </div>
                            )}
                            {extra.wantsToCreateCompany && (
                              <div>
                                <p className="text-[11px] text-slate-500">
                                  Quiere crear empresa
                                </p>
                                <p>
                                  {toYesNo(extra.wantsToCreateCompany) ||
                                    extra.wantsToCreateCompany}
                                </p>
                              </div>
                            )}
                            {extra.companyIdea && (
                              <div>
                                <p className="text-[11px] text-slate-500">
                                  Idea de negocio
                                </p>
                                <p>{extra.companyIdea}</p>
                              </div>
                            )}
                            {extra.companySector && (
                              <div>
                                <p className="text-[11px] text-slate-500">
                                  Sector
                                </p>
                                <p>{extra.companySector}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
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
                  {err && !loading && (
                    <p className="mt-2 text-[11px] text-rose-600">{err}</p>
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
                  <h2 className="text-sm font-semibold">
                    Raw del intake (solo uso interno)
                  </h2>
                  <p className="mt-2 text-[11px] text-slate-300">
                    Este es el JSON completo que se guardó en la columna{" "}
                    <code>raw</code>. Úsalo si necesitas revisar algún dato que
                    todavía no estemos mostrando en los campos estructurados.
                  </p>
                  <pre className="mt-3 max-h-64 overflow-auto rounded-xl bg-slate-950/60 p-3 text-[10px] leading-relaxed text-slate-100">
                    {JSON.stringify(intake.raw, null, 2)}
                  </pre>
                </div>
              </div>
            </motion.div>
          )}
        </section>
      </main>
    </DashboardGuard>
  );
}
