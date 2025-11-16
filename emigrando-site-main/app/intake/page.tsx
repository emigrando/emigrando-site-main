"use client";

import { useEffect, useMemo, useState } from "react";

type Child = { nombre: string; apellido: string; fn: string };

function parseDateFlexible(s: string) {
  if (!s) return null;
  const m = s.trim().match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2}|\d{4})$/);
  if (!m) return null;
  let [_, d, mo, y] = m;
  let Y = +y;
  if (Y < 100) Y = Y >= 30 ? 1900 + Y : 2000 + Y;
  const M = +mo - 1;
  const D = +d;
  const dt = new Date(Y, M, D);
  if (dt.getFullYear() !== Y || dt.getMonth() !== M || dt.getDate() !== D) return null;
  return dt;
}
function calcAge(dt: Date | null) {
  if (!dt) return null;
  const now = new Date();
  let a = now.getFullYear() - dt.getFullYear();
  const m = now.getMonth() - dt.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dt.getDate())) a--;
  return a;
}

export default function IntakeWizard() {
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

  const [step, setStep] = useState(0);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [datos, setDatos] = useState<Record<string, any>>({
    primer_nombre: "",
    segundo_nombre: "",
    primer_apellido: "",
    segundo_apellido: "",
    fnac_cliente: "",
    ciudad_nac: "",
    pais_nac: "",
    nacionalidad: "",
    direccion: "",
    movil: "",
    "E-mail": "",
    tipo_vivienda: "",
    estado_civil: "",
    cert_matrimonio: "",
    apostilla_matrimonio: "",
    pareja_en_ale: "",
    pareja_info: "",
    tiene_hijos: "",
    hijos_menores: "",
    hijos_viven_ale: "",
    residencia_vigente: "",
    tipo_residencia: "",
    fiktions: "",
    asilo_abierto: "",
    asilo_apelacion: "",
    tribunal: "",
    ingreso_ale: "",
    fecha_bamf: "",
    nivel_educativo: "",
    area_estudio: "",
    pais_titulo: "",
    homologacion: "",
    idioma_materno: "",
    nivel_aleman: "",
    cert_aleman: "",
    curso_aleman: "",
    otros_idiomas: "",
    trabaja: "",
    motivo_no_trabaja: "",
    tipo_actividad: "",
    area_trabajo: "",
    duracion_formacion: "",
    apoyo_autoridad: "",
    beneficios: [] as string[],
    autoridad_beneficios: "",
    fecha_beneficio: "",
    estado_beneficio: "",
    objetivo: "",
    observaciones: "",
    consent: false,
  });
  const [hijos, setHijos] = useState<Child[]>([]);

  // Autosave local
  useEffect(() => {
    const raw = localStorage.getItem("intake_emigrando");
    if (raw) {
      try {
        const j = JSON.parse(raw);
        setDatos((d) => ({ ...d, ...j.datos }));
        setHijos(j.hijos || []);
      } catch {}
    }
  }, []);
  useEffect(() => {
    const t = setTimeout(() => {
      localStorage.setItem("intake_emigrando", JSON.stringify({ datos, hijos }));
    }, 150);
    return () => clearTimeout(t);
  }, [datos, hijos]);

  const edadCliente = useMemo(
    () => calcAge(parseDateFlexible(datos.fnac_cliente || "")),
    [datos.fnac_cliente]
  );

  function set<K extends keyof typeof datos>(k: K, v: any) {
    setDatos((d) => ({ ...d, [k]: v }));
  }
  function addHijo() {
    setHijos((xs) => [...xs, { nombre: "", apellido: "", fn: "" }]);
  }
  function setHijo(i: number, k: keyof Child, v: string) {
    setHijos((xs) => xs.map((h, ix) => (ix === i ? { ...h, [k]: v } : h)));
  }
  function delHijo(i: number) {
    setHijos((xs) => xs.filter((_, ix) => ix !== i));
  }

  function next() {
    setErr(null);
    const requiredByStep: Record<number, string[]> = {
      0: ["primer_nombre", "primer_apellido", "fnac_cliente", "tipo_vivienda", "estado_civil"],
      1: ["tiene_hijos"],
      2: ["residencia_vigente"],
      3: [],
      4: ["objetivo", "consent"],
    };
    const req = requiredByStep[step] || [];
    for (const k of req) {
      const v = (datos as any)[k];
      if (!v) {
        setErr("Faltan campos obligatorios en este paso.");
        return;
      }
      if (k === "fnac_cliente" && !parseDateFlexible(v)) {
        setErr("Formato de fecha inválido.");
        return;
      }
    }
    setStep((s) => Math.min(4, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function prev() {
    setStep((s) => Math.max(0, s - 1));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setOk(null);
    setErr(null);

    const email = (datos["E-mail"] || "").trim();
    const tel = (datos.movil || "").trim();
    if (!email && !tel) {
      setErr("Debes indicar e-mail o teléfono.");
      return;
    }
    if (!datos.objetivo) {
      setErr("Debes indicar tu objetivo de consulta.");
      return;
    }

    const payload: any = {
      ...datos,
      hijos,
      privacidad_aceptada: !!datos.consent,
      timestamp: new Date().toISOString(),
    };
    try {
      const r = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j?.ok) {
        setOk("Datos enviados correctamente.");
      } else {
        setErr(j?.error || "Error interno al registrar el intake");
        console.error("INTAKE detail:", j?.detail);
      }
    } catch (ex) {
      setErr("Error de red enviando el formulario.");
      console.error(ex);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const total = 5;
  const pct = Math.round(((step + 1) / total) * 100);

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold">Formulario de información inicial</h1>
      <p className="text-sm text-gray-600 mt-1">Solo para clientes con acceso autorizado.</p>

      {/* Botón de cierre de sesión */}
  <div className="mt-4 flex justify-end">
    <button
      onClick={async () => {
        await fetch("/api/intake-logout", { method: "POST" }).catch(()=>{});
        window.location.href = "/intake/login";
      }}
      className="text-sm border border-gray-300 rounded-full px-4 py-2 hover:bg-gray-50"
    >
      Salir
    </button>
  </div>

      <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-2 bg-brand-primary" style={{ width: pct + "%" }} />
      </div>
      <div className="text-xs text-gray-500 mt-1">Progreso: {step + 1} / {total}</div>

      {ok && (
        <div className="mt-4 rounded bg-green-50 border border-green-200 p-3 text-sm text-green-700">
          {ok}
        </div>
      )}
      {err && (
        <div className="mt-4 rounded bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {err}
        </div>
      )}

      <form onSubmit={submit} className="mt-6 space-y-6">
        {/* STEP 1: Datos personales + vivienda */}
        {step === 0 && (
          <section className="space-y-4">
            <h2 className="font-bold text-brand-primary">A. Datos personales</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                placeholder="Primer nombre *"
                value={datos.primer_nombre}
                onChange={(e) => set("primer_nombre", e.target.value)}
                className="border rounded-lg p-3"
              />
              <input
                placeholder="Segundo nombre"
                value={datos.segundo_nombre}
                onChange={(e) => set("segundo_nombre", e.target.value)}
                className="border rounded-lg p-3"
              />
              <input
                placeholder="Primer apellido *"
                value={datos.primer_apellido}
                onChange={(e) => set("primer_apellido", e.target.value)}
                className="border rounded-lg p-3"
              />
              <input
                placeholder="Segundo apellido"
                value={datos.segundo_apellido}
                onChange={(e) => set("segundo_apellido", e.target.value)}
                className="border rounded-lg p-3"
              />
              <input
                placeholder="Fecha de nacimiento; DD.MM.AAAA o DD/MM/AAAA *"
                value={datos.fnac_cliente}
                onChange={(e) => set("fnac_cliente", e.target.value)}
                className="border rounded-lg p-3 sm:col-span-2"
              />
              <div className="text-xs text-gray-500 sm:col-span-2">Edad: {edadCliente ?? "—"}</div>
              <input
                placeholder="Ciudad de nacimiento"
                value={datos.ciudad_nac}
                onChange={(e) => set("ciudad_nac", e.target.value)}
                className="border rounded-lg p-3"
              />
              <input
                placeholder="País de nacimiento"
                value={datos.pais_nac}
                onChange={(e) => set("pais_nac", e.target.value)}
                className="border rounded-lg p-3"
              />
              <input
                placeholder="Nacionalidad"
                value={datos.nacionalidad}
                onChange={(e) => set("nacionalidad", e.target.value)}
                className="border rounded-lg p-3"
              />
              <input
                placeholder="Dirección actual"
                value={datos.direccion}
                onChange={(e) => set("direccion", e.target.value)}
                className="border rounded-lg p-3 sm:col-span-2"
              />
              <input
                placeholder="Teléfono; +49…"
                value={datos.movil}
                onChange={(e) => set("movil", e.target.value)}
                className="border rounded-lg p-3"
              />
              <input
                placeholder="E-mail"
                value={datos["E-mail"]}
                onChange={(e) => set("E-mail", e.target.value)}
                className="border rounded-lg p-3"
              />
            </div>

            <h3 className="font-bold text-brand-primary mt-2">B. Vivienda y familia; básico</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <select
                value={datos.tipo_vivienda}
                onChange={(e) => set("tipo_vivienda", e.target.value)}
                className="border rounded-lg p-3"
              >
                <option value="">Tipo de vivienda *</option>
                <option>Contrato privado a mi nombre</option>
                <option>Alojamiento de autoridad (Sozialamt/Landratsamt/Jugendamt)</option>
                <option>Vivo con padres/familiares</option>
                <option>Otro</option>
              </select>
              <select
                value={datos.estado_civil}
                onChange={(e) => set("estado_civil", e.target.value)}
                className="border rounded-lg p-3"
              >
                <option value="">Estado civil *</option>
                <option>Soltero/a</option>
                <option>Casado/a</option>
                <option>Divorciado/a</option>
                <option>Viudo/a</option>
                <option>Pareja registrada</option>
                <option>Unión libre</option>
              </select>
            </div>
          </section>
        )}

        {/* STEP 2: Estado civil y familia */}
        {step === 1 && (
          <section className="space-y-4">
            <h2 className="font-bold text-brand-primary">B. Estado civil y familia</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <select
                value={datos.cert_matrimonio}
                onChange={(e) => set("cert_matrimonio", e.target.value)}
                className="border rounded-lg p-3"
              >
                <option value="">¿Certificado de matrimonio extranjero?</option>
                <option>Sí</option>
                <option>No</option>
                <option>En trámite</option>
              </select>
              <select
                value={datos.apostilla_matrimonio}
                onChange={(e) => set("apostilla_matrimonio", e.target.value)}
                className="border rounded-lg p-3"
              >
                <option value="">¿Apostillado?</option>
                <option>Sí</option>
                <option>No</option>
                <option>Falta la apostilla</option>
              </select>
              <select
                value={datos.pareja_en_ale}
                onChange={(e) => set("pareja_en_ale", e.target.value)}
                className="border rounded-lg p-3"
              >
                <option value="">¿Pareja vive en Alemania?</option>
                <option>Sí</option>
                <option>No</option>
              </select>
              <input
                placeholder="Nombre/estatus migratorio de la pareja"
                value={datos.pareja_info}
                onChange={(e) => set("pareja_info", e.target.value)}
                className="border rounded-lg p-3"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <select
                value={datos.tiene_hijos}
                onChange={(e) => set("tiene_hijos", e.target.value)}
                className="border rounded-lg p-3"
              >
                <option value="">¿Tiene hijos? *</option>
                <option value="no">No</option>
                <option value="si">Sí</option>
              </select>
              {datos.tiene_hijos === "si" && (
                <select
                  value={datos.hijos_menores}
                  onChange={(e) => set("hijos_menores", e.target.value)}
                  className="border rounded-lg p-3"
                >
                  <option value="">¿Son menores de edad?</option>
                  <option value="no">No</option>
                  <option value="si">Sí</option>
                </select>
              )}
            </div>

            {datos.tiene_hijos === "si" && datos.hijos_menores === "si" && (
              <div className="space-y-3">
                <select
                  value={datos.hijos_viven_ale}
                  onChange={(e) => set("hijos_viven_ale", e.target.value)}
                  className="border rounded-lg p-3"
                >
                  <option value="">¿Viven con usted en Alemania?</option>
                  <option>Sí</option>
                  <option>No</option>
                  <option>Algunos sí</option>
                </select>

                {hijos.map((h, i) => (
                  <div key={i} className="grid sm:grid-cols-3 gap-3 border rounded-lg p-3">
                    <input
                      value={h.nombre}
                      onChange={(e) => setHijo(i, "nombre", e.target.value)}
                      placeholder="Nombre"
                      className="border rounded-lg p-2"
                    />
                    <input
                      value={h.apellido}
                      onChange={(e) => setHijo(i, "apellido", e.target.value)}
                      placeholder="Apellido"
                      className="border rounded-lg p-2"
                    />
                    <input
                      value={h.fn}
                      onChange={(e) => setHijo(i, "fn", e.target.value)}
                      placeholder="Fecha nacimiento; DD.MM.AAAA o DD/MM/AAAA"
                      className="border rounded-lg p-2"
                    />
                    <div className="sm:col-span-3">
                      <button
                        type="button"
                        onClick={() => delHijo(i)}
                        className="text-xs text-red-600"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addHijo}
                  className="text-sm font-semibold text-brand-primary"
                >
                  Añadir hijo/a
                </button>
              </div>
            )}
          </section>
        )}

        {/* STEP 3: Estatus migratorio */}
        {step === 2 && (
          <section className="space-y-4">
            <h2 className="font-bold text-brand-primary">C. Estatus migratorio y legal</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <select
                value={datos.residencia_vigente}
                onChange={(e) => set("residencia_vigente", e.target.value)}
                className="border rounded-lg p-3"
              >
                <option value="">¿Tienes residencia vigente? *</option>
                <option>Sí</option>
                <option>No</option>
              </select>
              <input
                placeholder="Tipo de residencia; §25 Abs.3; §18b; §16a…"
                value={datos.tipo_residencia}
                onChange={(e) => set("tipo_residencia", e.target.value)}
                className="border rounded-lg p-3"
              />
              <select
                value={datos.fiktions}
                onChange={(e) => set("fiktions", e.target.value)}
                className="border rounded-lg p-3"
              >
                <option value="">¿Fiktionsbescheinigung?</option>
                <option>Sí</option>
                <option>No</option>
                <option>No lo sé</option>
              </select>
              <select
                value={datos.asilo_abierto}
                onChange={(e) => set("asilo_abierto", e.target.value)}
                className="border rounded-lg p-3"
              >
                <option value="">¿Proceso de asilo abierto ante BAMF?</option>
                <option>Sí</option>
                <option>No</option>
                <option>No lo sé</option>
              </select>
              <select
                value={datos.asilo_apelacion}
                onChange={(e) => set("asilo_apelacion", e.target.value)}
                className="border rounded-lg p-3"
              >
                <option value="">¿Asilo en apelación (Verwaltungsgericht)?</option>
                <option>Sí</option>
                <option>No</option>
              </select>
              {datos.asilo_apelacion === "Sí" && (
                <input
                  placeholder="Tribunal responsable; VG Augsburg; VG München…"
                  value={datos.tribunal}
                  onChange={(e) => set("tribunal", e.target.value)}
                  className="border rounded-lg p-3"
                />
              )}
              <input
                placeholder="Fecha de ingreso a Alemania; DD.MM.AAAA o DD/MM/AAAA"
                value={datos.ingreso_ale}
                onChange={(e) => set("ingreso_ale", e.target.value)}
                className="border rounded-lg p-3"
              />
              <input
                placeholder="Fecha solicitud formal ante BAMF; DD.MM.AAAA o DD/MM/AAAA"
                value={datos.fecha_bamf}
                onChange={(e) => set("fecha_bamf", e.target.value)}
                className="border rounded-lg p-3"
              />
            </div>
          </section>
        )}

        {/* STEP 4: Formación, idiomas, trabajo */}
        {step === 3 && (
          <section className="space-y-4">
            <h2 className="font-bold text-brand-primary">D. Formación y educación</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <select
                value={datos.nivel_educativo}
                onChange={(e) => set("nivel_educativo", e.target.value)}
                className="border rounded-lg p-3"
              >
                <option value="">Nivel educativo más alto</option>
                <option>Escuela secundaria</option>
                <option>Formación técnica</option>
                <option>Título universitario</option>
                <option>Postgrado</option>
                <option>Máster</option>
                <option>Doctorado</option>
              </select>
              <input
                placeholder="Área o título de estudio"
                value={datos.area_estudio}
                onChange={(e) => set("area_estudio", e.target.value)}
                className="border rounded-lg p-3"
              />
              <input
                placeholder="País del título"
                value={datos.pais_titulo}
                onChange={(e) => set("pais_titulo", e.target.value)}
                className="border rounded-lg p-3"
              />
              <select
                value={datos.homologacion}
                onChange={(e) => set("homologacion", e.target.value)}
                className="border rounded-lg p-3"
              >
                <option value="">Traducciones u homologación en curso</option>
                <option>Sí</option>
                <option>No</option>
                <option>En trámite</option>
              </select>
            </div>

            <h3 className="font-bold text-brand-primary">E. Idiomas</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                placeholder="Idioma materno"
                value={datos.idioma_materno}
                onChange={(e) => set("idioma_materno", e.target.value)}
                className="border rounded-lg p-3"
              />
              <select
                value={datos.nivel_aleman}
                onChange={(e) => set("nivel_aleman", e.target.value)}
                className="border rounded-lg p-3"
              >
                <option value="">Nivel de alemán</option>
                <option>A1</option>
                <option>A2</option>
                <option>B1</option>
                <option>B2</option>
                <option>C1</option>
                <option>C2</option>
                <option>Sin curso</option>
              </select>
              <select
                value={datos.cert_aleman}
                onChange={(e) => set("cert_aleman", e.target.value)}
                className="border rounded-lg p-3"
              >
                <option value="">¿Certificado oficial? TELC; Goethe; ÖSD; TestDaF; DSH</option>
                <option>Sí</option>
                <option>No</option>
              </select>
              <select
                value={datos.curso_aleman}
                onChange={(e) => set("curso_aleman", e.target.value)}
                className="border rounded-lg p-3"
              >
                <option value="">¿Actualmente en curso de alemán?</option>
                <option>Sí</option>
                <option>No</option>
              </select>
              <input
                placeholder="Otros idiomas y nivel; Inglés (B2)…"
                value={datos.otros_idiomas}
                onChange={(e) => set("otros_idiomas", e.target.value)}
                className="border rounded-lg p-3 sm:col-span-2"
              />
            </div>

            <h3 className="font-bold text-brand-primary">F. Situación laboral y formativa</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <select
                value={datos.trabaja}
                onChange={(e) => set("trabaja", e.target.value)}
                className="border rounded-lg p-3"
              >
                <option value="">¿Actualmente trabaja?</option>
                <option>Sí</option>
                <option>No</option>
                <option>No puede trabajar</option>
              </select>
              <select
                value={datos.motivo_no_trabaja}
                onChange={(e) => set("motivo_no_trabaja", e.target.value)}
                className="border rounded-lg p-3"
              >
                <option value="">Si no trabaja; motivo</option>
                <option>Enfermedad</option>
                <option>Discapacidad</option>
                <option>Cuidado familiar</option>
                <option>Otro</option>
              </select>
              <select
                value={datos.tipo_actividad}
                onChange={(e) => set("tipo_actividad", e.target.value)}
                className="border rounded-lg p-3"
              >
                <option value="">Tipo de empleo/estudio actual</option>
                <option>Trabajo formal</option>
                <option>Ausbildung</option>
                <option>Umschulung</option>
                <option>Weiterbildung</option>
                <option>Minijob</option>
                <option>Otro</option>
              </select>
              <input
                placeholder="Área del trabajo/formación"
                value={datos.area_trabajo}
                onChange={(e) => set("area_trabajo", e.target.value)}
                className="border rounded-lg p-3"
              />
              <input
                placeholder="Duración del curso/formación"
                value={datos.duracion_formacion}
                onChange={(e) => set("duracion_formacion", e.target.value)}
                className="border rounded-lg p-3"
              />
              <input
                placeholder="Apoyo de autoridad; Agentur für Arbeit; Jobcenter…"
                value={datos.apoyo_autoridad}
                onChange={(e) => set("apoyo_autoridad", e.target.value)}
                className="border rounded-lg p-3"
              />
            </div>
          </section>
        )}

        {/* STEP 5: Beneficios y objetivo */}
        {step === 4 && (
          <section className="space-y-4">
            <h2 className="font-bold text-brand-primary">G. Beneficios y apoyos</h2>
            <div className="grid gap-3">
              <div className="flex flex-wrap gap-2">
                {[
                  "Bürgergeld",
                  "Arbeitslosengeld",
                  "AsylbLG",
                  "SGB XIII",
                  "Wohngeld",
                  "Kindergeld",
                  "Kinderzuschlag",
                  "Ninguno",
                ].map((opt) => (
                  <label
                    key={opt}
                    className="inline-flex items-center gap-2 border rounded-full px-3 py-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={(datos.beneficios as string[]).includes(opt)}
                      onChange={(e) => {
                        const list = new Set(datos.beneficios as string[]);
                        e.target.checked ? list.add(opt) : list.delete(opt);
                        set("beneficios", Array.from(list));
                      }}
                    />
                    {opt}
                  </label>
                ))}
              </div>
              <input
                placeholder="Autoridad que gestiona; Jobcenter Augsburg; Familienkasse…"
                value={datos.autoridad_beneficios}
                onChange={(e) => set("autoridad_beneficios", e.target.value)}
                className="border rounded-lg p-3"
              />
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  placeholder="Fecha de inicio del beneficio; DD.MM.AAAA o DD/MM/AAAA"
                  value={datos.fecha_beneficio}
                  onChange={(e) => set("fecha_beneficio", e.target.value)}
                  className="border rounded-lg p-3"
                />
                <select
                  value={datos.estado_beneficio}
                  onChange={(e) => set("estado_beneficio", e.target.value)}
                  className="border rounded-lg p-3"
                >
                  <option value="">Estado del beneficio</option>
                  <option>Vigente</option>
                  <option>Suspendido</option>
                  <option>En revisión</option>
                  <option>Finalizado</option>
                </select>
              </div>

              <h3 className="font-bold text-brand-primary">H. Objetivos y observaciones</h3>
              <textarea
                placeholder="¿Qué tipo de ayuda buscas? *"
                value={datos.objetivo}
                onChange={(e) => set("objetivo", e.target.value)}
                className="border rounded-lg p-3 min-h-[110px]"
              />
              <textarea
                placeholder="Comentarios / información relevante"
                value={datos.observaciones}
                onChange={(e) => set("observaciones", e.target.value)}
                className="border rounded-lg p-3 min-h-[110px]"
              />
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!datos.consent}
                  onChange={(e) => set("consent", e.target.checked)}
                />
                <span>
                  Acepto la{" "}
                  <a className="underline" href="/datenschutz" target="_blank">
                    política de privacidad
                  </a>
                  .
                </span>
              </label>
            </div>
          </section>
        )}

        {/* Navegación */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={prev}
            className="border rounded-lg px-4 py-2 text-sm"
          >
            {step === 0 ? " " : "← Atrás"}
          </button>
          <div className="flex gap-2">
            {step < total - 1 && (
              <button
                type="button"
                onClick={next}
                className="rounded-full px-6 py-3 font-semibold bg-brand-primary hover:brightness-95 shadow"
              >
                Siguiente →
              </button>
            )}
            {step === total - 1 && (
              <button
                type="submit"
                className="rounded-full px-6 py-3 font-semibold bg-brand-primary hover:brightness-95 shadow"
              >
                Enviar
              </button>
            )}
          </div>
        </div>
      </form>
    </main>
  );
}

