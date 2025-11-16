"use client";
import { useState } from "react";

export default function IntakeLogin() {
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    const fd = new FormData(e.currentTarget);
    const pass = (fd.get("password") || "").toString();
    const next = (fd.get("next") || "/intake").toString();

    const res = await fetch("/api/intake-login", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ pass }),
    });
    if (res.ok) {
      window.location.href = next;
    } else {
      const j = await res.json().catch(()=>({}));
      setErr(j?.error || "Credenciales inválidas.");
    }
  }

  const next =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("next") || "/intake"
      : "/intake";

  return (
    <main className="mx-auto max-w-sm px-4 py-12">
      <h1 className="text-2xl font-extrabold">Acceso a Intake</h1>
      <p className="text-sm text-gray-600 mt-2">Introduce la clave enviada por Emigrando.de.</p>
      {err && (
        <div className="mt-4 rounded bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {err}
        </div>
      )}
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input type="hidden" name="next" value={next} />
        <input
          name="password"
          type="password"
          required
          placeholder="Contraseña"
          className="border rounded-lg p-3 w-full"
        />
        <button className="rounded-full px-6 py-3 font-semibold bg-brand-primary hover:brightness-95 shadow">
          Entrar
        </button>
      </form>
    </main>
  );
}
