"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function ForgotPasswordPage() {
  const supabase = createSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);
    setLoading(true);

    // Ajusta esta URL a tu dominio en producción
    const redirectTo = "http://localhost:3000/auth/reset-password";

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    setOk(
      "Si el correo existe en el sistema, se ha enviado un enlace para restablecer la contraseña."
    );
    setLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f5f7fb] to-white px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-xl">
        <h1 className="text-xl font-semibold text-slate-900">
          Recuperar contraseña
        </h1>
        <p className="mt-1 text-xs text-slate-600">
          Te enviaremos un enlace al correo para que puedas definir una nueva
          contraseña.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-sm">
          <div>
            <label className="text-xs text-slate-600">Correo</label>
            <input
              type="email"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 text-xs focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {err && (
            <p className="text-[11px] text-rose-600 leading-relaxed">{err}</p>
          )}
          {ok && (
            <p className="text-[11px] text-emerald-600 leading-relaxed">
              {ok}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-indigo-600 text-white py-2 text-sm font-semibold hover:bg-indigo-700 transition shadow-md"
          >
            {loading ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>
      </div>
    </main>
  );
}
