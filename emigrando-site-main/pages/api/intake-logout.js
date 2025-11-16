export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Borra la cookie expirándola
  res.setHeader(
    "Set-Cookie",
    "INTAKE_AUTH=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax"
  );
  return res.status(200).json({ ok: true });
}
