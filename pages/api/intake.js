// pages/api/intake.js

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

// Limpiar strings
function clean(v) {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v.trim();
  return String(v).trim();
}

// Intentar convertir "dd.mm.aaaa" o "dd/mm/aaaa" en "aaaa-mm-dd"
function parseDateOrNull(v) {
  const s = clean(v);
  if (!s) return null;
  const parts = s.split(/[./-]/).map((p) => p.trim());
  if (parts.length !== 3) return null;
  const [d, m, y] = parts;
  if (!d || !m || !y) return null;
  const dd = d.padStart(2, "0");
  const mm = m.padStart(2, "0");
  const yyyy = y.length === 2 ? `20${y}` : y.padStart(4, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default async function handler(req, res) {
  // Health check para debug de entorno
  if (req.method === "GET" && req.query?.health === "1") {
    return res.status(200).json({
      ok: true,
      env: {
        SUPABASE_URL: !!SUPABASE_URL,
        SUPABASE_ANON_KEY: !!SUPABASE_ANON_KEY,
        tables: {
          intake_submissions: "public.intake_submissions",
          intake_children: "public.intake_children",
        },
      },
    });
  }

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ ok: false, error: "Método no permitido; usa POST" });
  }

  if (!supabase) {
    return res.status(500).json({
      ok: false,
      error: "Supabase no está configurado en el servidor",
    });
  }

  try {
    const raw =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};

    // Campos básicos del cliente; basados en tu esquema actual
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

    const fullName = [nombre, segundoNombre, apellido, segundoApellido]
      .filter(Boolean)
      .join(" ");

    const birthCountry = clean(raw.pais_nac) || null;
    const currentCountry = clean(raw.pais_actual || raw.current_country) || null;
    const currentCity =
      clean(raw.ciudad_actual || raw.ciudad_residencia) || null;

    const housingType = clean(raw.tipo_vivienda) || null;
    const maritalStatus = clean(raw.estado_civil) || null;

    const hasChildren =
      Array.isArray(raw.hijos) &&
      raw.hijos.some((h) => h && (h.nombre || h.apellido));

    // Fuente del envío; por si luego lo usas también desde el panel cliente
    const source = clean(raw.source) || "public_form";

    // 1; Insertar fila principal en intake_submissions
    const { data: intakeRow, error: intakeError } = await supabase
      .from("intake_submissions")
      .insert({
        user_id: null, // en esta versión el intake es público; sin login
        source,
        status: "nuevo",

        first_name: nombre || null,
        middle_name: segundoNombre || null,
        last_name: apellido || null,
        second_last_name: segundoApellido || null,
        full_name: fullName || null,

        email: email || null,
        phone: telefono || null,
        main_goal: objetivo || null,

        birth_country: birthCountry,
        current_country: currentCountry,
        current_city: currentCity,

        housing_type: housingType,
        marital_status: maritalStatus,
        has_children: hasChildren,

        raw, // aquí guardamos TODO el formulario completo como JSON
      })
      .select("id")
      .single();

    if (intakeError) {
      console.error(
        "INTAKE SUPABASE ERROR (intake_submissions):",
        intakeError
      );
      return res.status(500).json({
        ok: false,
        error: "Error al registrar el intake en Supabase",
      });
    }

    const intakeId = intakeRow.id;

    // 2; Insertar hijos si vienen en raw.hijos
    let childrenCreated = 0;

    if (Array.isArray(raw.hijos) && raw.hijos.length > 0) {
      const childrenPayload = raw.hijos
        .filter((h) => h && (h.nombre || h.apellido))
        .map((h) => {
          const fn = parseDateOrNull(h.fn);
          return {
            intake_id: intakeId,
            first_name: clean(h.nombre) || null,
            last_name: clean(h.apellido) || null,
            date_of_birth: fn,
            lives_in_germany: null, // se puede mejorar después con campo específico
          };
        });

      if (childrenPayload.length > 0) {
        const { error: childrenError } = await supabase
          .from("intake_children")
          .insert(childrenPayload);

        if (childrenError) {
          console.error(
            "INTAKE SUPABASE ERROR (intake_children):",
            childrenError
          );
          // No rompemos el intake completo; solo no contamos los hijos
        } else {
          childrenCreated = childrenPayload.length;
        }
      }
    }

    return res.status(200).json({
      ok: true,
      intakeId,
      childrenCreated,
    });
  } catch (e) {
    console.error("INTAKE ERROR:", e);
    return res.status(500).json({
      ok: false,
      error: "Error interno al registrar el intake",
    });
  }
}
