'use client';

import { useState, FormEvent } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { motion } from "framer-motion";
const scrollToId = (id: string) => {
  if (typeof document === "undefined") return;
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    situation: "",
    mensaje: "",
  });

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSent(false);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.nombre,
          email: formData.email,
          situation: formData.situation,
          message: formData.mensaje,
          source: "home-mini-form",
        }),
      });

      if (!res.ok) {
        throw new Error("Respuesta no válida del servidor");
      }

      setSent(true);
      setFormData({
        nombre: "",
        email: "",
        situation: "",
        mensaje: "",
      });
    } catch (err) {
      console.error(err);
      setError(
        "No se pudo enviar el mensaje. Inténtalo de nuevo o usa el botón de contactar asesor."
      );
    } finally {
      setLoading(false);
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
                className="rounded-full px-6 shadow-md hover:shadow-lg hover:-translate-y-[1px] transition-all"
                onClick={() => scrollToId("contacto")}
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
                  whileHover={{
                    y: -4,
                    scale: 1.01,
                  }}
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
                  whileHover={{
                    y: -4,
                    scale: 1.01,
                  }}
                  transition={{ type: "spring", stiffness: 240, damping: 20 }}
                >
                  <div className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-xl bg-violet-500 text-[13px] text-white">
                    🎓
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Formación y empleo
                  </h3>
                  <p className="mt-2 text-xs text-slate-600">
                    Reconocimiento de títulos universitarios y escolares; búsqueda laboral; 
                    perfiles profesionales y caminos de formación técnica o universitaria.
                  </p>
                </motion.div>

                <motion.div
                  className="group rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-5 shadow-sm transition-all"
                  whileHover={{
                    y: -4,
                    scale: 1.01,
                  }}
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
                  whileHover={{
                    y: -4,
                    scale: 1.01,
                  }}
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
                    Finanzamt y tribunales administrativos entre otros.
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
                sin demoras
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

      {/* SECCIÓN CTA / FORMULARIO RESUMEN */}
      <section
  id="como-trabajamos"
  className="border-t border-slate-100 bg-[#f8fafc]"
>
  <div className="mx-auto max-w-6xl px-4 py-16 lg:py-18">
    <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
      {/* TEXTO LADO IZQUIERDO: CÓMO TRABAJAMOS */}
      <div>
        <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-medium text-indigo-600">
          Cómo trabajamos · paso a paso
        </span>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
          Nos cuentas tu caso, te damos una oferta clara y empezamos juntos.
        </h2>
        <p className="mt-3 text-sm text-slate-600">
          No trabajamos con promesas vacías. Partimos de tu
          situación real y de lo que se puede lograr con las leyes que existen
          ahora mismo en Alemania.
        </p>
        <div className="mt-5 grid gap-3 text-sm text-slate-600">
          <div className="flex gap-3">
            <span className="mt-[3px] h-5 w-5 shrink-0 rounded-full bg-emerald-100 text-[12px] flex items-center justify-center text-emerald-700">
              1
            </span>
            <p>
              Nos contactas y nos cuentas sobre tu caso: dónde estás, qué permiso tienes
              o buscas, qué autoridad está involucrada o cualquier otra inquietud.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="mt-[3px] h-5 w-5 shrink-0 rounded-full bg-sky-100 text-[12px] flex items-center justify-center text-sky-700">
              2
            </span>
            <p>
              Analizamos tu situación y te envíamos una propuesta gratuita con objetivos
              concretos y realistas; qué se puede hacer y qué no.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="mt-[3px] h-5 w-5 shrink-0 rounded-full bg-violet-100 text-[12px] flex items-center justify-center text-violet-700">
              3
            </span>
            <p>
              Si aceptas, haces el primer pago de anticipo y empezamos de inmediato
              con los escritos, formularios y pasos necesarios ante las autoridades
              que correspondan.
            </p>
          </div>
        </div>
      </div>


            {/* FORMULARIO (envía directo a /api/contact) */}
            <Card 
            id="contacto"
            className="rounded-2xl border-slate-100 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">
                Empecemos con un primer contacto
              </h3>
              <p className="mt-2 text-xs text-slate-500">
                Este mini formulario solo recoge lo básico para que podamos
                entender tu caso y asignarte el tipo de asesoría correcta.
              </p>

              <form
                className="mt-4 space-y-3 text-sm"
                onSubmit={handleSubmit}
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
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    required
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
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Situación actual
                  </label>
                  <select
                    name="situation"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-0 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    value={formData.situation}
                    onChange={(e) =>
                      setFormData({ ...formData, situation: e.target.value })
                    }
                    required
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
                    value={formData.mensaje}
                    onChange={(e) =>
                      setFormData({ ...formData, mensaje: e.target.value })
                    }
                    required
                  />
                </div>

                {error && (
                  <p className="text-[11px] text-rose-500">{error}</p>
                )}

                {sent && !error && (
                  <p className="text-[11px] text-emerald-600">
                    Mensaje enviado. Te responderé lo antes posible.
                  </p>
                )}

                <Button
                  type="submit"
                  className="mt-2 w-full rounded-full shadow-md hover:shadow-lg hover:-translate-y-[1px] transition-all disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? "Enviando..." : "Ir al formulario completo"}
                </Button>

                <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                  Tus datos se procesan en servidores ubicados en la UE. Si tienes
                  prisa, también puedes escribirme directo por WhatsApp o Telegram.
                </p>
              </form>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
