// pages/api/intake.js
const BASE_URL = "https://api.airtable.com/v0";

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const AIRTABLE_BASE = process.env.AIRTABLE_BASE;

// Prioridad: ID de tabla > nombre en env > nombre por defecto.
const TBL_CLIENTES =
  process.env.AIRTABLE_TABLE_CLIENTES_ID ||
  process.env.AIRTABLE_TABLE_CLIENTES ||
  "Clients";

const TBL_HIJOS =
  process.env.AIRTABLE_TABLE_HIJOS_ID ||
  process.env.AIRTABLE_TABLE_HIJOS ||
  "Children";

function clean(v) {
  return typeof v === "string" ? v.trim() : v;
}

function dmyToISO(s) {
  if (!s || typeof s !== "string") return null;
  const t = s.trim().replace(/[/.]/g, "-");
  const m = t.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  // si ya viene como YYYY-MM-DD, la dejamos pasar
  return t.match(/^\d{4}-\d{2}-\d{2}$/) ? t : null;
}

// Campos YES/NO en Airtable que solo aceptan "Yes" o "No"
function mapYesNoToEnglish(v) {
  if (!v) return null;
  const x = v.toString().trim().toLowerCase();
  if (x === "si" || x === "sí" || x === "yes") return "Yes";
  if (x === "no") return "No";
  return null;
}

// Hijos viven en Alemania: Yes / No / Partially
function mapChildrenInGermany(v) {
  if (!v) return null;
  const x = v.toString().trim().toLowerCase();
  if (x === "sí" || x === "si" || x === "yes") return "Yes";
  if (x === "no") return "No";
  if (x.includes("algunos")) return "Partially";
  return null;
}

// Máximo nivel educativo → opciones de Airtable
function mapHighestEducation(v) {
  if (!v) return null;
  const x = v.toString().trim().toLowerCase();
  if (x === "escuela secundaria") return "Secondary";
  if (x === "formación técnica") return "Technical degree";
  if (x === "título universitario") return "Bachelor";
  if (x === "postgrado" || x === "máster" || x === "master") return "Master";
  if (x === "doctorado") return "Doctorate";
  return "Other";
}

// Estado de homologación → Recognition status
function mapRecognitionStatus(v) {
  if (!v) return null;
  const x = v.toString().trim().toLowerCase();
  if (x === "sí" || x === "si") return "Recognized";
  if (x === "no") return "Not recognized";
  if (x === "en trámite" || x === "en tramite") return "Ongoing";
  return "Not applicable";
}

// Curso de alemán → German course (Completed / Ongoing / Not started)
function mapGermanCourse(v) {
  if (!v) return null;
  const x = v.toString().trim().toLowerCase();
  if (x === "sí" || x === "si") return "Ongoing";
  if (x === "no") return "Not started";
  return null;
}

// Certificado alemán → German certificate (Yes / No / Sí)
// En tu base existen Yes, No, Sí. Reutilizamos directamente.
function mapGermanCertificate(v) {
  if (!v) return null;
  const x = v.toString().trim();
  if (x === "Sí" || x === "Si" || x === "sí" || x === "si") return "Sí";
  if (x === "No" || x === "no") return "No";
  return null;
}

// Actualmente trabaja → Currently working (Yes / No / Sí / No puede trabajar)
function mapCurrentlyWorking(v) {
  if (!v) return null;
  const x = v.toString().trim();
  if (x === "Sí" || x === "Si" || x === "sí" || x === "si") return "Sí";
  if (x === "No" || x === "no") return "No";
  if (x === "No puede trabajar") return "No puede trabajar";
  return null;
}

// Motivo no trabaja → Reason not working
// Mapeo aproximado a opciones inglesas de Airtable
// Student, Caregiver, Retired, Unable to work, Searching for work, Other
function mapReasonNotWorking(v) {
  if (!v) return null;
  const x = v.toString().trim().toLowerCase();
  if (x === "cuidado familiar") return "Caregiver";
  if (x === "enfermedad" || x === "discapacidad") return "Unable to work";
  // Sin equivalentes directos → Other
  if (x === "otro") return "Other";
  return "Other";
}

// Tipo de actividad → Current activity type (Employed / Studying / Training / Unemployed / Other)
function mapCurrentActivityType(v) {
  if (!v) return null;
  const x = v.toString().trim().toLowerCase();
  if (x === "trabajo formal" || x === "minijob") return "Employed";
  if (x === "ausbildung" || x === "umschulung" || x === "weiterbildung") return "Training";
  if (x === "otro") return "Other";
  return "Other";
}

// Beneficios (multi-select). Tus valores ya coinciden con opciones de Airtable.
function mapBenefits(arr) {
  if (!Array.isArray(arr)) return [];
  const allowed = new Set([
    "ALG I",
    "ALG II",
    "Bürgergeld",
    "SGB XII",
    "Kindergeld",
    "Housing benefit",
    "Child supplement",
    "Other",
    "Arbeitslosengeld",
    "AsylbLG",
    "SGB XIII",
    "Wohngeld",
    "Kinderzuschlag",
    "Ninguno",
  ]);
  const result = [];
  for (const v of arr) {
    if (!v) continue;
    const txt = v.toString().trim();
    if (allowed.has(txt)) result.push(txt);
  }
  return result;
}

async function airtableCreate(table, records) {
  const url = `${BASE_URL}/${AIRTABLE_BASE}/${encodeURIComponent(table)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ records }),
  });

  const txt = await res.text().catch(() => "");

  if (!res.ok) {
    console.error("AIRTABLE ERROR", table, AIRTABLE_BASE, res.status, txt);
    throw new Error(`Airtable ${res.status}: ${txt}`);
  }

  return JSON.parse(txt);
}

export default async function handler(req, res) {
  // Health check para debug de entorno
  if (req.method === "GET" && req.query?.health === "1") {
    return res.status(200).json({
      ok: true,
      env: {
        AIRTABLE_BASE: !!AIRTABLE_BASE,
        AIRTABLE_TOKEN: !!AIRTABLE_TOKEN,
        TBL_CLIENTES,
        TBL_HIJOS,
      },
    });
  }

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ ok: false, error: "Method not allowed" });
  }

  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE) {
    return res
      .status(500)
      .json({ ok: false, error: "Airtable not configured" });
  }

  try {
    const raw =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};

    const nombre = clean(raw.primer_nombre);
    const segundoNombre = clean(raw.segundo_nombre);
    const apellido = clean(raw.primer_apellido);
    const segundoApellido = clean(raw.segundo_apellido);

    const email = clean(raw["E-mail"] || raw.email);
    const telefono = clean(raw.movil || raw.telefono);
    const objetivo = clean(raw.objetivo);

    if (!nombre || !apellido) {
      return res.status(400).json({
        ok: false,
        error: "Nombre y apellido son obligatorios",
      });
    }
    if (!email && !telefono) {
      return res.status(400).json({
        ok: false,
        error: "Email o teléfono requerido",
      });
    }

    // Mapeos de selects desde raw (valores del intake)
    const housingType = clean(raw.tipo_vivienda) || null; // coincide con opciones ES ya creadas
    const maritalStatus = clean(raw.estado_civil) || null;

    const foreignMarriageCert = mapYesNoToEnglish(raw.cert_matrimonio);
    const marriageApostille = (function () {
      const v = raw.apostilla_matrimonio;
      if (!v) return null;
      const x = v.toString().trim().toLowerCase();
      if (x === "sí" || x === "si") return "Yes";
      if (x === "no") return "No";
      if (x.includes("falta")) return "Not applicable";
      return null;
    })();

    const partnerInGermany = mapYesNoToEnglish(raw.pareja_en_ale);

    const hasChildren = (function () {
      const v = raw.tiene_hijos;
      if (!v) return null;
      const x = v.toString().trim().toLowerCase();
      if (x === "si" || x === "sí") return "Yes";
      if (x === "no") return "No";
      return null;
    })();

    const minorChildren = (function () {
      const v = raw.hijos_menores;
      if (!v) return null;
      const x = v.toString().trim().toLowerCase();
      if (x === "si" || x === "sí") return "Yes";
      if (x === "no") return "No";
      return null;
    })();

    const childrenInGermany = mapChildrenInGermany(raw.hijos_viven_ale);

    const residenceValid = (function () {
      const v = raw.residencia_vigente;
      if (!v) return null;
      const x = v.toString().trim().toLowerCase();
      if (x === "sí" || x === "si") return "Sí"; // existe opción "Sí"
      if (x === "no") return "No";
      return null;
    })();

    const fiktions = mapYesNoToEnglish(raw.fiktions);
    const asylumOpen = mapYesNoToEnglish(raw.asilo_abierto);
    const asylumAppeal = mapYesNoToEnglish(raw.asilo_apelacion);

    const highestEducation = mapHighestEducation(raw.nivel_educativo);
    const recognitionStatus = mapRecognitionStatus(raw.homologacion);

    const germanLevel = clean(raw.nivel_aleman) || null; // A1/A2/B1... encaja con opciones
    const germanCertificate = mapGermanCertificate(raw.cert_aleman);
    const germanCourse = mapGermanCourse(raw.curso_aleman);

    const currentlyWorking = mapCurrentlyWorking(raw.trabaja);
    const reasonNotWorking = mapReasonNotWorking(raw.motivo_no_trabaja);
    const currentActivityType = mapCurrentActivityType(raw.tipo_actividad);

    const benefits = mapBenefits(raw.beneficios || []);
    const benefitStatus = clean(raw.estado_beneficio) || null;

    const clientFields = {
      // Identificación básica
      "First name": nombre,
      "Middle name": segundoNombre || null,
      "Last name": apellido,
      "Second last name": segundoApellido || null,

      "E-mail": email || null,
      "Phone number": telefono || null,
      "Main goal or service requested": objetivo || null,

      // Datos personales
      "Birth date": dmyToISO(clean(raw.fnac_cliente)) || null,
      "Birth city": clean(raw.ciudad_nac) || null,
      "Birth country": clean(raw.pais_nac) || null,
      Nationality: clean(raw.nacionalidad) || null,
      Address: clean(raw.direccion) || null,
      Photo: null, // por ahora, la foto se subirá directamente en Airtable

      // Vivienda y familia (selects y texto)
      "Housing type": housingType,
      "Marital status": maritalStatus,
      "Foreign marriage certificate": foreignMarriageCert,
      "Marriage apostille": marriageApostille,
      "Partner in Germany": partnerInGermany,
      "Partner details": clean(raw.pareja_info) || null,
      "Has children": hasChildren,
      "Minor children": minorChildren,
      "Children live in Germany": childrenInGermany,

      // Estatus legal / asilo
      "Residence valid": residenceValid,
      "Residence type": clean(raw.tipo_residencia) || null,
      Fiktionsbescheinigung: fiktions,
      "Asylum BAMF open": asylumOpen,
      "Asylum appeal": asylumAppeal,
      Court: clean(raw.tribunal) || null,
      "Entry to Germany": dmyToISO(clean(raw.ingreso_ale)) || null,
      "BAMF application date": dmyToISO(clean(raw.fecha_bamf)) || null,

      // Educación
      "Highest education": highestEducation,
      "Study area": clean(raw.area_estudio) || null,
      "Degree country": clean(raw.pais_titulo) || null,
      "Recognition status": recognitionStatus,

      // Idiomas
      "Native language": clean(raw.idioma_materno) || null,
      "German level": germanLevel,
      "German certificate": germanCertificate,
      "German course": germanCourse,
      "Other languages": clean(raw.otros_idiomas) || null,

      // Trabajo / formación
      "Currently working": currentlyWorking,
      "Reason not working": reasonNotWorking,
      "Current activity type": currentActivityType,
      "Work/study area": clean(raw.area_trabajo) || null,
      "Training duration": clean(raw.duracion_formacion) || null,
      "Authority support": clean(raw.apoyo_autoridad) || null,

      // Beneficios
      Benefits: benefits.length ? benefits : null,
      "Benefits authority": clean(raw.autoridad_beneficios) || null,
      "Benefit start date": dmyToISO(clean(raw.fecha_beneficio)) || null,
      "Benefit status": benefitStatus,

      // Observaciones
      "Additional notes": clean(raw.observaciones) || null,

      // Toda la info cruda del intake
      Raw: JSON.stringify(raw),
    };

    const created = await airtableCreate(TBL_CLIENTES, [
      { fields: clientFields },
    ]);
    const clientId = created.records?.[0]?.id;

    const hijos = Array.isArray(raw.hijos) ? raw.hijos : [];
    const childRecs = hijos
      .filter((h) => h && (h.nombre || h.apellido))
      .map((h) => ({
        fields: {
          Client: clientId ? [clientId] : [],
          "First name": clean(h.nombre) || null,
          "Last name": clean(h.apellido) || null,
          "Date of birth": dmyToISO(clean(h.fn)) || null,
        },
      }));

    if (childRecs.length && clientId) {
      await airtableCreate(TBL_HIJOS, childRecs);
    }

    return res.status(200).json({
      ok: true,
      clientId,
      childrenCreated: childRecs.length,
    });
  } catch (e) {
    console.error("INTAKE ERROR:", e);
    return res.status(500).json({
      ok: false,
      error: "Error interno al registrar el intake",
    });
  }
}
