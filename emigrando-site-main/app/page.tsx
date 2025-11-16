"use client";

import React, { useEffect } from "react";
import { Mail, ShieldCheck, FileText, Users, MapPin, Phone } from "lucide-react";

export default function Home() {
  // Log de visita
  useEffect(() => {
    fetch("/api/log-visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: location.pathname,
        referer: document.referrer,
        ua: navigator.userAgent,
      }),
    }).catch(() => {});
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* HERO */}
      <section className="grid lg:grid-cols-2 gap-8 items-center">
        <div>
          <span className="badge-pill bg-brand-primary/20 text-brand-fg">
            Acompañamiento claro y humano
          </span>

          <h1
            className="mt-3 text-4xl sm:text-5xl font-extrabold tracking-tight"
            style={{ fontFamily: "GlacialIndifference, MontserratVar" }}
          >
            Emigrando.de
          </h1>

          <p className="mt-3 text-lg text-gray-700">
            Hacemos que la burocracia alemana se entienda. Asesoría migratoria y social con formularios inteligentes y apoyo real.
          </p>

          <div className="mt-6 flex gap-3">
            <a
              href="#contacto"
              className="rounded-full px-6 py-3 font-semibold shadow-soft text-black"
              style={{ background: "#F9C51B" }}
            >
              Quiero asesoría
            </a>
            <a href="/intake/login" className="rounded-full px-6 py-3 font-semibold border">
              Clientes con clave
            </a>
          </div>

          <ul className="mt-6 grid grid-cols-2 gap-3 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Datos protegidos</span>
            </li>
            <li className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Quieres venir a vivir a Alemania, nosotros te ayudamos con todos los trámites.</span>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Atención remota en toda Alemania</span>
            </li>
            <li className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Documentos y recursos</span>
            </li>
          </ul>
        </div>

        {/* Visual limpio sin verde */}
        <div>
          <div className="h-1 w-24 rounded-full mb-4" style={{ background: "#F9C51B" }} />
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-soft">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="card-ios p-5">
                <h3 className="font-bold">Migración y residencia</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Visas; Solicitud y cambios permisos de residencia;
                  Asilo y reagrupación Familiar.
                </p>
              </div>
              <div className="card-ios p-5">
                <h3 className="font-bold">Formación y empleo</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Reconocimiento de titulos Universitario; Técnicos, ingenierias, medicina, administración, etc
                  Búsqueda laboral, elaboración de perfil profesional; 
                  Búsqueda de Formación técnica o universitaria en Alemania
                </p>
              </div>
              <div className="card-ios p-5">
                <h3 className="font-bold">Apoyos sociales</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Bürgergeld; Wohngeld; Kinderzuschlag; Kindergeld.
                </p>
              </div>
              <div className="card-ios p-5">
                <h3 className="font-bold">Defensa administrativa</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Escritos y asesoría ante cualquier autoridad (Jobcenter, Ausländerbehörde y tribunales.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FRANJA DE SERVICIOS CON TARJETAS NEUMÓRFICAS */}
      <section id="servicios" className="mt-12 card-neo p-6">
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { icon: <FileText />, t: "Documentación", d: "Cartas y formularios oficiales listos para entregar." },
            { icon: <ShieldCheck />, t: "Cumplimiento", d: "Textos legales y privacidad al día." },
            { icon: <Users />, t: "Acompañamiento", d: "Te guiamos paso a paso;." },
            { icon: <Mail />, t: "Contacto directo", d: "Respuesta clara, agenda rápida y buenos resultados." },
          ].map((c, i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-soft">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
                style={{ background: "#F9C51B" }}
              >
                {c.icon}
              </div>
              <div className="font-semibold">{c.t}</div>
              <div className="text-sm text-gray-600 mt-1">{c.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* MISIÓN Y VISIÓN */}
      <section className="mt-12 grid lg:grid-cols-2 gap-6">
        <article className="bg-brand-green-50 rounded-2xl p-6 border">
          <h2 className="text-2xl font-bold">Visión</h2>
          <p className="mt-2 text-gray-700">
            Acompañar a cada migrante en Alemania hacia la estabilidad y la integración real.
          </p>
        </article>
        <article className="bg-brand-brown-50 rounded-2xl p-6 border">
          <h2 className="text-2xl font-bold">Misión</h2>
          <p className="mt-2 text-gray-700">
            Orientación legal y social clara, humana y digitalmente accesible; con herramientas útiles y acompañamiento personalizado.
          </p>
        </article>
      </section>

      {/* CONTACTO EN EL “HUECO” */}
      <section id="contacto" className="mt-12 grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-3">
          <h2 className="text-3xl font-extrabold">¿Hablamos?</h2>
          <p className="text-gray-700">
            Hay personas que no sabe por dónde empezar; aquí lo hacemos fácil. Déjanos un mensaje y te guiamos.
          </p>
          <a href="mailto:info@emigrando.de" className="inline-flex items-center gap-2 font-semibold">
            <Mail className="w-4 h-4" />
            <span>info@emigrando.de</span>
          </a>
          <div className="text-gray-700 flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>Atención online en toda Alemania</span>
          </div>
        </div>

        <div className="rounded-2xl border shadow-soft p-4 bg-white">
          {/* Tu formulario existente vive en /contacto */}
          <iframe src="/contacto" className="w-full h-[520px] rounded-xl" title="Formulario de contacto" />
        </div>
      </section>

      {/* FOOTER con bandas */}
      <footer className="mt-16 rounded-2xl overflow-hidden">
        <div className="bg-black text-white px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="font-semibold">Emigrando.de</div>
          <div className="flex items-center gap-4 text-sm">
            <a href="/impressum" className="hover:underline">Impressum</a>
            <a href="/datenschutz" className="hover:underline">Datenschutz</a>
            <a href="/agb" className="hover:underline">AGB</a>
          </div>
        </div>
        <div className="h-1 w-full" style={{ background: "#F9C51B" }} />
        <div className="h-1 w-full" style={{ background: "#D54F54" }} />
      </footer>
    </main>
  );
}

