// pages/api/log-visit.js

const BASE_URL = "https://api.airtable.com/v0";
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const AIRTABLE_BASE = process.env.AIRTABLE_BASE;

// Puedes usar el ID de la tabla o el nombre "Visits"
const TBL_VISITS =
  process.env.AIRTABLE_TABLE_VISITS_ID ||
  process.env.AIRTABLE_TABLE_VISITS ||
  "Visits";

export default async function handler(req, res) {
  // Health check rápido: GET /api/log-visit?health=1
  if (req.method === "GET" && req.query?.health === "1") {
    return res.status(200).json({
      ok: true,
      table: TBL_VISITS,
      base: !!AIRTABLE_BASE,
      token: !!AIRTABLE_TOKEN,
    });
  }

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ ok: false, error: "Method not allowed" });
  }

  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE) {
    console.error("VISIT LOG: Airtable not configured");
    // No rompemos la web si falta config
    return res.status(200).json({ ok: false });
  }

  try {
    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body || {};

    const path = body.path || "/";
    const referer = body.referer || "";

    // Solo escribimos campos seguros que aceptan texto.
    // NO mandamos "Visit Time" para evitar el 422.
    const fields = {
      Path: path,
      Referer: referer,
      // Si algún día creas más columnas de texto, las añades aquí.
      // Ejemplo: "User agent": body.ua || ""
    };

    const response = await fetch(
      `${BASE_URL}/${AIRTABLE_BASE}/${encodeURIComponent(TBL_VISITS)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AIRTABLE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          records: [{ fields }],
        }),
      }
    );

    const txt = await response.text().catch(() => "");
    if (!response.ok) {
      console.error(
        "VISIT LOG AIRTABLE ERROR",
        TBL_VISITS,
        response.status,
        txt
      );
      // No mostramos error al usuario, solo log.
      return res.status(200).json({ ok: false });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("VISIT LOG ERROR:", err);
    return res.status(200).json({ ok: false });
  }
}
