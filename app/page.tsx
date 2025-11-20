"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const [miniSending, setMiniSending] = useState(false);
  const [miniOk, setMiniOk] = useState<string | null>(null);
  const [miniErr, setMiniErr] = useState<string | null>(null);

  async function handleMiniSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  setMiniOk(null);
  setMiniErr(null);
  setMiniSending(true);

  try {
    const fd = new FormData(event.currentTarget);

    const payload = {
      nombre: (fd.get("nombre") || "").toString().trim(),
      email: (fd.get("email") || "").toString().trim(),
      telefono: (fd.get("telefono") || "").toString().trim(),
      ciudad: (fd.get("ciudad") || "").toString().trim(),
      tema: (fd.get("tema") || "").toString().trim(),
      mensaje: (fd.get("mensaje") || "").toString().trim(),
    };

    // misma validación que ya tenías
    if (
      !payload.nombre ||
      !payload.email ||
      !payload.telefono ||
      !payload.ciudad ||
      !payload.tema ||
      !payload.mensaje
    ) {
      setMiniErr("Por favor completa todos los campos del formulario.");
      setMiniSending(false);
      return;
    }

    // IMPORTANTE: no pongas Content-Type, el navegador lo pone solo (multipart/form-data)
    const r = await fetch("/api/contact", {
      method: "POST",
      body: fd,
    });

    const j = await r.json().catch(() => ({} as any));

    if (r.ok && j?.ok) {
      setMiniOk("Mensaje enviado correctamente. Te responderé por correo o WhatsApp.");
      event.currentTarget.reset();
    } else {
      setMiniErr(j?.error || "Error interno al enviar el contacto.");
    }
  } catch (e) {
    console.error(e);
    // si no quieres mostrar nada al usuario, comenta o borra esta línea:
    // setMiniErr("Error de red al enviar el contacto.");
  } finally {
    setMiniSending(false);
  }
}

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f5f7fb] to-white text-slate-900">
      {/* HERO */}
      <section
        id="servicios"
        className="relative mx-auto max-w-6xl px-4 pt-20 pb-20 lg:pt-28 lg:pb-28"
      >
        {/* Fondo sensorial: glow + partículas + ruido */}
        <div className="hero-ambient" />
        <div className="hero-noise" />

        <div
          className="particle"
          style={{
            top: "1rem",
            left: "-6rem",
            width: "360px",
            height: "360px",
            zIndex: 0,
          }}
        />
        <div
          className="particle particle--gold"
          style={{
            top: "6rem",
            right: "-6rem",
            width: "340px",
            height: "340px",
            zIndex: 0,
          }}
        />
        <div
          className="particle"
          style={{
            bottom: "-4rem",
            left: "15%",
            width: "420px",
            height: "420px",
            zIndex: 0,
          }}
        />

        <div className="relative z-10 grid items-center gap-12 lg:grid-cols-[1.1fr,1fr]">
          {/* Columna izquierda */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <p className="text-sm font-semibold tracking-[0.18em] text-indigo-500 uppercase">
              Acompañamiento claro y humano
            </p>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight leading-tight sm:text-5xl lg:text-[3.1rem]">
              Hacemos que la burocracia alemana
              <span className="block bg-gradient-to-r from-sky-400 via-indigo-500 to-violet-500 bg-clip-text text-transparent">
                se sienta comprensible.
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
              Asesoría migratoria y social con formularios inteligentes; seguimiento
              real y una visión completa de tu caso; sin miedo a las cartas en alemán
              ni a decisiones injustas; sin perderte entre leyes y plazos.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button
                size="lg"
                className="rounded-full px-6 shadow-md hover:shadow-lg hover:-translate-y-[1px] transition-all"
                onClick={() => {
                  const target = document.getElementById("contacto");
                  if (target) {
                    target.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
              >
                Quiero asesoría
              </Button>

              <button
                type="button"
                onClick={() => {
                  window.location.href = "/intake/login";
                }}
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-2 text-sm font-medium text-slate-800 shadow-sm backdrop-blur-sm hover:border-indigo-500 hover:text-indigo-600 hover:shadow-md hover:-translate-y-[1px] transition-all"
              >
                <span className="mr-2 text-xs">🔑</span>
                Clientes con clave
              </button>
            </div>

            <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.2)]" />
                Datos protegidos en Alemania
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_0_4px_rgba(245,158,11,0.2)]" />
                Atención remota en toda Alemania
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-sky-500 shadow-[0_0_0_4px_rgba(56,189,248,0.2)]" />
                Ayuda con tus trámites en Alemania con pasos claros
              </div>
            </div>
          </motion.div>

          {/* Columna derecha: tarjetas de servicios */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          >
            <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-indigo-100/80 via-white to-sky-100/70 blur-3xl" />
            <Card className="relative rounded-[2rem] border border-slate-100 bg-white/95 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.10)] card-float">
              <div className="grid gap-4 sm:grid-cols-2">
                <motion.div
                  className="group rounded-2xl border border-indigo-100 bg-indigo-50/80 px-4 py-5 shadow-sm transition-all"
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 240, damping: 20 }}
                >
                  <div className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-500 text-[13px] text-white">
                    ⇄
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Migración y residencia
                  </h3>
                  <p className="mt-2 text-xs text-slate-600">
                    Visas; permisos de residencia; asilo y protección; reagrupación
                    familiar y cambios de estatus.
                  </p>
                </motion.div>

                <motion.div
                  className="group rounded-2xl border border-violet-100 bg-violet-50/80 px-4 py-5 shadow-sm transition-all"
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 240, damping: 20 }}
                >
                  <div className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-xl bg-violet-500 text-[13px] text-white">
                    🎓
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Formación y empleo
                  </h3>
                  <p className="mt-2 text-xs text-slate-600">
                    Reconocimiento de títulos universitarios y escolares; búsqueda
                    laboral; perfiles profesionales y caminos de formación técnica
                    o universitaria.
                  </p>
                </motion.div>

                <motion.div
                  className="group rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-5 shadow-sm transition-all"
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 240, damping: 20 }}
                >
                  <div className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500 text-[13px] text-white">
                    €
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Apoyos sociales
                  </h3>
                  <p className="mt-2 text-xs text-slate-600">
                    Bürgergeld; Wohngeld; Kinderzuschlag; Kindergeld y otros
                    beneficios sociales.
                  </p>
                </motion.div>

                <motion.div
                  className="group rounded-2xl border border-rose-100 bg-rose-50/80 px-4 py-5 shadow-sm transition-all"
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 240, damping: 20 }}
                >
                  <div className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-xl bg-rose-500 text-[13px] text-white">
                    ⚖
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Asesoramiento en tu defensa administrativa
                  </h3>
                  <p className="mt-2 text-xs text-slate-600">
                    Escritos y acompañamiento ante Jobcenter; Ausländerbehörde;
                    Finanzamt y tribunales administrativos, entre otros.
                  </p>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* BLOQUES: DOCUMENTACIÓN / CUMPLIMIENTO / ACOMPAÑAMIENTO / CONTACTO */}
      <section id="titulos" className="border-t border-slate-100 bg-white/80">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="flex h-full flex-col rounded-2xl border-slate-100 bg-slate-50 p-5 shadow-md hover:-translate-y-[2px] hover:shadow-lg transition-all">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 text-xl">
                📄
              </div>
              <h3 className="text-sm font-semibold text-slate-900">
                Documentación
              </h3>
              <p className="mt-2 text-xs text-slate-500">
                Cartas y formularios oficiales listos para entregar en Behörden,
                sin demoras.
              </p>
            </Card>

            <Card className="flex h-full flex-col rounded-2xl border-slate-100 bg-slate-50 p-5 shadow-md hover:-translate-y-[2px] hover:shadow-lg transition-all">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 text-xl">
                ✅
              </div>
              <h3 className="text-sm font-semibold text-slate-900">
                Cumplimiento
              </h3>
              <p className="mt-2 text-xs text-slate-500">
                Textos legales y privacidad alineados con normativa alemana vigente
                para que duermas tranquilo.
              </p>
            </Card>

            <Card className="flex h-full flex-col rounded-2xl border-slate-100 bg-slate-50 p-5 shadow-md hover:-translate-y-[2px] hover:shadow-lg transition-all">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600 text-xl">
                🤝
              </div>
              <h3 className="text-sm font-semibold text-slate-900">
                Acompañamiento
              </h3>
              <p className="mt-2 text-xs text-slate-500">
                Te guiamos paso a paso; con contexto y explicaciones; no solo un
                documento suelto.
              </p>
            </Card>

            <Card className="flex h-full flex-col rounded-2xl border-slate-100 bg-slate-50 p-5 shadow-md hover:-translate-y-[2px] hover:shadow-lg transition-all">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 text-xl">
                ✉️
              </div>
              <h3 className="text-sm font-semibold text-slate-900">
                Contacto directo
              </h3>
              <p className="mt-2 text-xs text-slate-500">
                Respuesta clara; agenda rápida y seguimiento del estado de tu
                caso; no quedas en el limbo.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CÓMO TRABAJAMOS + MINI FORM */}
      <section
        id="como-trabajamos"
        className="border-t border-slate-100 bg-[#f8fafc]"
      >
        <div className="mx-auto max-w-6xl px-4 py-16 lg:py-18">
          <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
            {/* TEXTO LADO IZQUIERDO */}
            <div>
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-medium text-indigo-600">
                Cómo trabajamos · paso a paso
              </span>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
                Nos cuentas tu caso, te doy una oferta clara y empezamos juntos.
              </h2>
              <p className="mt-3 text-sm text-slate-600">
                No trabajamos con promesas vacías. Partimos de tu situación real y
                de lo que se puede lograr con las leyes que existen ahora mismo en
                Alemania.
              </p>
              <div className="mt-5 grid gap-3 text-sm text-slate-600">
                <div className="flex gap-3">
                  <span className="mt-[3px] h-5 w-5 shrink-0 rounded-full bg-emerald-100 text-[12px] flex items-center justify-center text-emerald-700">
                    1
                  </span>
                  <p>
                    Nos contactas y cuentas tu caso: dónde estás, qué permiso
                    tienes o buscas, qué autoridad está involucrada o qué carta te llegó.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="mt-[3px] h-5 w-5 shrink-0 rounded-full bg-sky-100 text-[12px] flex items-center justify-center text-sky-700">
                    2
                  </span>
                  <p>
                    Analizo tu situación y te envío una propuesta gratuita con
                    objetivos concretos y realistas: qué se puede hacer y qué no.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="mt-[3px] h-5 w-5 shrink-0 rounded-full bg-violet-100 text-[12px] flex items-center justify-center text-violet-700">
                    3
                  </span>
                  <p>
                    Si aceptas, haces el primer pago de anticipo y empezamos con
                    los escritos, formularios y pasos necesarios ante las autoridades
                    que correspondan.
                  </p>
                </div>
              </div>
            </div>

            {/* MINI FORM */}
            <Card
              id="contacto"
              className="rounded-2xl border-slate-100 bg-white p-6 shadow-sm"
            >
              <h3 className="text-sm font-semibold text-slate-900">
                Empecemos con un primer contacto
              </h3>
              <p className="mt-2 text-xs text-slate-500">
                Este mini formulario recoge lo básico para que pueda entender tu caso
                y darte una respuesta inicial útil.
              </p>

              <form
                className="mt-4 space-y-3 text-sm"
                onSubmit={handleMiniSubmit}
                
              >
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Nombre y apellido
                  </label>
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-0 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    type="text"
                    name="nombre"
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-700">
                      Correo electrónico
                    </label>
                    <input
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-0 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                      type="email"
                      name="email"
                      placeholder="tu@correo.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700">
                      Teléfono móvil
                    </label>
                    <input
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-0 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                      type="tel"
                      name="telefono"
                      placeholder="+49..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Ciudad en Alemania
                  </label>
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-0 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    type="text"
                    name="ciudad"
                    placeholder="Ej: Augsburg, München, Berlin..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Motivo principal de la consulta
                  </label>
                  <select
                    name="tema"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-0 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="migracion_residencia">
                      Solicitud/cambio de residencia, Duldung, etc</option>
                    <option value="formacion_empleo">
                      Reconocimiento de títulos universitarios / empleo / Formación
                    </option>
                    <option value="apoyos_sociales">
                      Apoyos sociales (Bürgergeld, Wohngeld...)
                    </option>
                    <option value="defensa_administrativa">
                      Asesoria en defensa administrativa (Jobcenter, Ausländerbehörde...)
                      </option>
                    <option value="Asilo">
                      Asilo, Solicitud, Apelación, Beneficios</option>
                    <option value="otro">Otro motivo</option>
                  </select>
                </div>
               <div>
                <label className="block text-xs font-medium text-slate-700">
                  Adjuntar documentos (opcional)
                </label>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-0 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  type="file"
                  name="adjuntos"
                  multiple
                />
                <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                  Puedes adjuntar cartas, Bescheide o documentos en PDF, JPG o PNG. Máx. 5 MB en total.
                </p>
               </div> 
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Cuéntame brevemente tu caso
                  </label>
                  <textarea
                    name="mensaje"
                    rows={3}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-0 resize-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    placeholder="Ej: Recibi una respuesta negativa de una autoridad (Ausländerbehörde, Jobcenter, Sozialamt) y necesito ayuda..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={miniSending}
                  className="mt-2 w-full rounded-full shadow-md hover:shadow-lg hover:-translate-y-[1px] transition-all disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {miniSending
                    ? "Enviando..."
                    : "Enviar y seguir al formulario completo"}
                </Button>

                {miniOk && (
                  <p className="mt-2 text-[11px] leading-relaxed text-emerald-600">
                    {miniOk}
                  </p>
                )}
                {miniErr && (
                  <p className="mt-2 text-[11px] leading-relaxed text-rose-600">
                    {miniErr}
                  </p>
                )}

                <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                  Tus datos se procesan en servidores ubicados en la UE. Puedes ampliar
                  la información más adelante en el formulario detallado de clientes.
                </p>
              </form>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
