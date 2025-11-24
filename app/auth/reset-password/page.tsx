"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};:,.?]).{6,}$/;

export default function ResetPasswordPage() {
  const supabase = createSupabaseBrowserClient();

  const [pass, setPass] = useState("");
  const [passConfirm, setPassConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate() {
    if (!pass || !passConfirm) {
      return "Debes introducir y confirmar la nueva contraseña.";
    }
    if (pass !== passConfirm) {
      return "Las contraseñas no coinciden.";
    }
    if (!passwordRegex.test(pass)) {
      return "La contraseña debe tener mínimo 6 caracteres; al menos una mayúscula; una minúscula y un carácter especial.";
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);

    const v = validate();
    if (v) {
      setErr(v);
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: pass,
    });

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    setOk("Contraseña actualizada. Ya puedes iniciar sesión con la nueva clave.");
    setLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f5f7fb] to-white px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-xl">
        <h1 className="text-xl font-semibold text-slate-900">
          Definir nueva contraseña
        </h1>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-sm">
          <div>
            <label className="text-xs text-slate-600">Nueva contraseña</label>
            <input
              type="password"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 text-xs focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-slate-600">
              Confirmar contraseña
            </label>
            <input
              type="password"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 text-xs focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
              value={passConfirm}
              onChange={(e) => setPassConfirm(e.target.value)}
            />
          </div>

          <p className="text-[11px] text-slate-500">
            Debe tener mínimo 6 caracteres; al menos una letra mayúscula; una
            minúscula y un carácter especial.
          </p>

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
            {loading ? "Guardando..." : "Guardar nueva contraseña"}
          </button>
        </form>
      </div>
    </main>
  );
}
