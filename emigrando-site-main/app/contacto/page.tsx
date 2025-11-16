"use client";
import { useState } from "react";

export default function Contacto() {
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setOk(null);
    setErr(null);

    const form = e.currentTarget;
    const data = new FormData(form);

    // Validación local: adjuntos ≤ 5 MB total
    const files = data.getAll("adjuntos").filter(Boolean) as File[];
    const totalBytes = files.reduce((acc, f) => acc + f.size, 0);
    if (totalBytes > 5 * 1024 * 1024) {
      setErr("Los adjuntos no pueden superar 5 MB en total.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/contact", { method: "POST", body: data });
      const json = await res.json().catch(() => ({} as any));

      if (res.ok && json?.ok) {
        setOk("Enviado. Te contactaremos en 24–48 h.");
        form.reset();
      } else {
        setErr(json?.error || "Ups, ocurrió un problema. Intenta de nuevo.");
      }
    } catch {
      setErr("No se pudo conectar con el servidor. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold">Contáctanos</h1>
      <p className="text-brand-muted mt-2">Respuesta en 24–48 h.</p>

      {ok && (
        <div className="mt-6 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
          {ok}
        </div>
      )}
      {err && (
        <div className="mt-6 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {err}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-4" encType="multipart/form-data">
        <div className="grid sm:grid-cols-2 gap-4">
          <input name="nombre" required placeholder="Nombre completo *" className="border rounded-lg p-3 w-full" />
          <input name="email" type="email" required placeholder="Email *" className="border rounded-lg p-3 w-full" />
          <input name="telefono" required placeholder="Teléfono / WhatsApp *" className="border rounded-lg p-3 w-full" />
          <input name="ciudad" required placeholder="Ciudad / Estado *" className="border rounded-lg p-3 w-full" />
        </div>

        <select name="tema" required className="border rounded-lg p-3 w-full">
          <option value="">Motivo de contacto *</option>
          <option>Residencia / Ausländerbehörde</option>
          <option>Reconocimiento de títulos</option>
          <option>Apoyos sociales</option>
          <option>Defensa administrativa</option>
          <option>Formación y empleo</option>
          <option>Creación de empresa</option>
          <option>Asilo</option>
          <option>Otros</option>
        </select>

        <textarea name="mensaje" required rows={5} placeholder="Mensaje *" className="border rounded-lg p-3 w-full" />

        <div>
          <label className="text-sm">Adjuntar archivos (opcional)</label>
          <input
            name="adjuntos"
            type="file"
            multiple
            className="block mt-1"
            // Si quieres limitar tipos:
            // accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />
        </div>

        <button
          disabled={loading}
          className="rounded-full px-6 py-3 font-semibold bg-brand-primary hover:brightness-95 shadow disabled:opacity-60"
        >
          {loading ? "Enviando…" : "Enviar"}
        </button>
      </form>
    </main>
  );
}
