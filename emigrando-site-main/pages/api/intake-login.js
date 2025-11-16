// pages/api/intake-login.js
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const pass = (body?.pass || "").toString();

  if (!process.env.INTAKE_PASS) return res.status(500).json({ error: "INTAKE_PASS no configurado" });
  if (pass !== process.env.INTAKE_PASS) return res.status(401).json({ error: "Clave incorrecta"});

  if (!process.env.INTAKE_SECRET) return res.status(500).json({ error: "INTAKE_SECRET no configurado" });

  // payload
  const payload = { created: Date.now(), exp: Date.now() + 7*24*3600*1000 };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64");
  const sig = crypto.createHmac("sha256", process.env.INTAKE_SECRET).update(payloadB64).digest("hex");
  const cookieValue = `${payloadB64}.${sig}`;

  // cookie HttpOnly, Secure; path /; SameSite=Lax
  res.setHeader("Set-Cookie", `INTAKE_AUTH=${cookieValue}; Path=/; Max-Age=${7*24*3600}; HttpOnly; Secure; SameSite=Lax`);
  return res.status(200).json({ ok: true });
}
