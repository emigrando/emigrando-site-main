import formidable from "formidable";
import nodemailer from "nodemailer";

export const config = {
  api: { bodyParser: false },
};

function send(res, status, data) {
  res.status(status).json(data);
}
function allowCORS(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS,HEAD");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  allowCORS(res);
  if (req.method === "OPTIONS") return res.end();

  // health para monitores (GET o HEAD ?health=1)
  if ((req.method === "GET" || req.method === "HEAD") && req.query?.health === "1") {
    if (req.method === "HEAD") return res.status(200).end();
    return send(res, 200, { ok: true });
  }

  if (req.method !== "POST") {
    return send(res, 405, { error: "Method not allowed" });
  }

  try {
    const contentType = req.headers["content-type"] || "";
    let fields = {};
    let files = [];

    if (contentType.includes("multipart/form-data")) {
      const form = formidable({
        multiples: true,
        maxFileSize: 10 * 1024 * 1024,
        allowEmptyFiles: true,
        filter: ({ originalFilename }) => !!originalFilename,
      });

      const { fields: f, files: fl } = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) return reject(err);
          resolve({ fields, files });
        });
      });

      fields = f;

      const arr = Array.isArray(fl?.adjuntos)
        ? fl.adjuntos
        : fl?.adjuntos
        ? [fl.adjuntos]
        : [];
      files = arr.filter((fi) => fi && (fi.size || 0) > 0);

      const total = files.reduce((sum, fi) => sum + (fi.size || 0), 0);
      if (total > 5 * 1024 * 1024) {
        return send(res, 400, {
          error: "Los adjuntos no pueden superar 5 MB en total.",
        });
      }
    } else {
      // JSON
      const body = await new Promise((resolve) => {
        let data = "";
        req.on("data", (c) => (data += c));
        req.on("end", () => resolve(data));
      });
      fields = body ? JSON.parse(body) : {};
    }

    const nombre = (fields.nombre || "").toString().trim();
    const email = (fields.email || "").toString().trim();
    const telefono = (fields.telefono || "").toString().trim();
    const ciudad = (fields.ciudad || "").toString().trim();
    const tema = (fields.tema || "").toString().trim();
    const mensaje = (fields.mensaje || "").toString().trim();

    if (!nombre || !email || !telefono || !ciudad || !tema || !mensaje) {
      return send(res, 400, { error: "Faltan campos obligatorios." });
    }

    // Si no hay SMTP configurado (por ejemplo en desarrollo local),
    // no lanzamos error; simplemente simulamos envío correcto.
    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS ||
      !process.env.CONTACT_FROM ||
      !process.env.CONTACT_TO
    ) {
      console.error("CONTACT: SMTP no configurado, simulando envío OK (entorno local)");
      return send(res, 200, { ok: true, simulated: true });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    const attachments = (files || []).map((f) => ({
      filename: f.originalFilename || f.newFilename,
      path: f.filepath,
      contentType: f.mimetype,
    }));

    const subject = `Contacto web: ${tema} — ${nombre}`;

    await transporter.sendMail({
      from: process.env.CONTACT_FROM,
      to: process.env.CONTACT_TO,
      replyTo: email,
      subject,
      text: `Nombre: ${nombre}
Email: ${email}
Teléfono: ${telefono}
Ciudad: ${ciudad}
Tema: ${tema}
Mensaje:
${mensaje}
`,
      attachments,
    });

    return send(res, 200, { ok: true });
  } catch (err) {
    console.error("CONTACT ERROR:", err);
    return send(res, 500, { error: "Error interno al enviar el contacto." });
  }
}
