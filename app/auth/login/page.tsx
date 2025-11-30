"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import SplineBackground from "@/components/SplineBackground";

export default function LoginPage() {
  const supabase = createSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    window.location.href = "/dashboard/cliente";
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-[#e1f2ff] px-4 overflow-hidden">
      {/* Fondo 3D de Spline */}
      <SplineBackground />

      {/* Tarjeta de login */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-xl backdrop-blur-xl">
        <h1 className="text-xl font-semibold text-slate-900">
          Acceso a tu cuenta
        </h1>

        <form onSubmit={handleLogin} className="mt-4 space-y-4 text-sm">
          <div>
            <label className="text-xs text-slate-600">Correo electrónico</label>
            <input
              type="email"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 text-xs focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-slate-600">Contraseña</label>
            <input
              type="password"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 text-xs focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
              placeholder="••••••••"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
            />
          </div>

          {err && (
            <p className="text-[11px] text-rose-600 leading-relaxed">{err}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-indigo-600 text-white py-2 text-sm font-semibold hover:bg-indigo-700 transition shadow-md disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-4 flex flex-col gap-1 text-xs text-slate-600">
          <p>
            ¿No tienes cuenta?{" "}
            <a href="/auth/register" className="text-indigo-600 font-medium">
              Crear una
            </a>
          </p>
          <p>
            ¿Olvidaste tu contraseña?{" "}
            <a
              href="/auth/forgot-password"
              className="text-indigo-600 font-medium"
            >
              Recuperar acceso
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
