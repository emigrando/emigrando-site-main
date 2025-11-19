'use client';

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f5f7fb] to-white text-slate-900">
      {/* Navbar ahora viene desde app/layout.tsx */}
      
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
            height: "420px", // antes 4200px
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
              >
                Quiero asesoría
              </Button>

              <button
                type="button"
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
                Formularios inteligentes y claros
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
                {/* Migración y residencia */}
                <motion.div
                  className="group rounded-2xl border border-indigo-100 bg-indigo-50/80 px-4 py-5 shadow-sm transition-all"
                  whileHover={{
                    y: -4,
                    scale: 1.01,
                  }}
                  transition={{ type: "spring", stiffness: 240, damping: 20 }}
                >
                  <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 to-indigo-600 text-[16px] text-white shadow-[0_10px_25px_rgba(79,70,229,0.55)]">
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

                {/* Formación y empleo */}
                <motion.div
                  className="group rounded-2xl border border-violet-100 bg-violet-50/80 px-4 py-5 shadow-sm transition-all"
                  whileHover={{
                    y: -4,
                    scale: 1.01,
                  }}
                  transition={{ type: "spring", stiffness: 240, damping: 20 }}
                >
                  <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-400 to-violet-600 text-[16px] text-white shadow-[0_10px_25px_rgba(129,140,248,0.55)]">
                    🎓
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Formación y empleo
                  </h3>
                  <p className="mt-2 text-xs text-slate-600">
                    Reconocimiento de títulos; búsqueda laboral; perfiles
                    profesionales y caminos de formación técnica o universitaria.
                  </p>
                </motion.div>

                {/* Apoyos sociales */}
                <motion.div
                  className="group rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-5 shadow-sm transition-all"
                  whileHover={{
                    y: -4,
                    scale: 1.01,
                  }}
                  transition={{ type: "spring", stiffness: 240, damping: 20 }}
                >
                  <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-[16px] text-white shadow-[0_10px_25px_rgba(16,185,129,0.55)]">
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

                {/* Defensa administrativa */}
                <motion.div
                  className="group rounded-2xl border border-rose-100 bg-rose-50/80 px-4 py-5 shadow-sm transition-all"
                  whileHover={{
                    y: -4,
                    scale: 1.01,
                  }}
                  transition={{ type: "spring", stiffness: 240, damping: 20 }}
                >
                  <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 to-rose-600 text-[16px] text-white shadow-[0_10px_25px_rgba(244,63,94,0.55)]">
                    ⚖
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Defensa administrativa
                  </h3>
                  <p className="mt-2 text-xs text-slate-600">
                    Escritos y acompañamiento ante Jobcenter; Ausländerbehörde;
                    Finanzamt y tribunales administrativos.
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
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-white text-lg shadow-[0_10px_24px_rgba(245,158,11,0.45)]">
                📄
              </div>
              <h3 className="text-sm font-semibold text-slate-900">
                Documentación
              </h3>
              <p className="mt-2 text-xs text-slate-500">
                Cartas y formularios oficiales listos para entregar en Behörden,
                sin traducciones raras ni dudas.
              </p>
            </Card>

            <Card className="flex h-full flex-col rounded-2xl border-slate-100 bg-slate-50 p-5 shadow-md hover:-translate-y-[2px] hover:shadow-lg transition-all">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-500 text-white text-lg shadow-[0_10px_24px_rgba(16,185,129,0.45)]">
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
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-sky-500 text-white text-lg shadow-[0_10px_24px_rgba(56,189,248,0.45)]">
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
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 to-indigo-500 text-white text-lg shadow-[0_10px_24px_rgba(79,70,229,0.45)]">
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

      {/* SECCIÓN CTA / FORMULARIO RESUMEN */}
      <section id="contacto" className="border-t border-slate-100 bg-[#f8fafc]">
        <div className="mx-auto max-w-6xl px-4 py-16 lg:py-18">
          <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
            {/* TEXTO LADO IZQUIERDO MÁS HUMANO */}
            <div>
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-medium text-indigo-600">
                Primer contacto · sin compromiso
              </span>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
                Cuéntame cómo está tu situación ahora mismo en Alemania.
              </h2>
              <p className="mt-3 text-sm text-slate-600">
                Puedes estar fuera; llegando con maletas o llevando años recibiendo
                cartas de Jobcenter o Ausländerbehörde. Este primer paso es solo
                para entender dónde estás parado y qué tiene sentido hacer contigo
                y tu familia; sin juicios y sin presión.
              </p>
              <div className="mt-5 grid gap-3 text-sm text-slate-600">
                <div className="flex gap-3">
                  <span className="mt-[3px] h-5 w-5 shrink-0 rounded-full bg-emerald-100 text-[12px] flex items-center justify-center text-emerald-700">
                    1
                  </span>
                  <p>
                    Nos dices si estás fuera de Alemania; llegando o ya dentro del
                    sistema con algún tipo de Aufenthalt.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="mt-[3px] h-5 w-5 shrink-0 rounded-full bg-sky-100 text-[12px] flex items-center justify-center text-sky-700">
                    2
                  </span>
                  <p>
                    Resumes qué te preocupa: qué autoridad está involucrada; si hay
                    un plazo; una cita o una carta concreta que no entiendes.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="mt-[3px] h-5 w-5 shrink-0 rounded-full bg-violet-100 text-[12px] flex items-center justify-center text-violet-700">
                    3
                  </span>
                  <p>
                    Te respondemos con el formulario o la propuesta de trabajo que
                    realmente aplica a tu caso; no una plantilla genérica.
                  </p>
                </div>
              </div>
            </div>

            {/* FORMULARIO */}
            <Card className="rounded-2xl border-slate-100 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">
                Empecemos con un primer contacto
              </h3>
              <p className="mt-2 text-xs text-slate-500">
                Este mini formulario solo recoge lo básico para que podamos
                entender tu caso y asignarte el tipo de asesoría correcta.
              </p>

              <form
                className="mt-4 space-y-3 text-sm"
                action="/contacto"
                method="get"
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
                    Situación actual
                  </label>
                  <select
                    name="situation"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-0 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="fuera">Estoy fuera de Alemania</option>
                    <option value="llegando">Acabo de llegar</option>
                    <option value="dentro">
                      Ya vivo en Alemania y tengo permiso
                    </option>
                    <option value="problemas">
                      Tengo un problema concreto con una autoridad
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Cuéntame brevemente tu caso
                  </label>
                  <textarea
                    name="mensaje"
                    rows={3}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-0 resize-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    placeholder="Ej: Estoy en proceso de Niederlassung y tengo dudas con Jobcenter / Ausländerbehörde..."
                  />
                </div>

                <Button
                  type="submit"
                  className="mt-2 w-full rounded-full shadow-md hover:shadow-lg hover:-translate-y-[1px] transition-all"
                >
                  Ir al formulario completo
                </Button>

                <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                  Al continuar irás al formulario detallado. Tus datos se
                  procesan en servidores ubicados en la UE.
                </p>
              </form>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
