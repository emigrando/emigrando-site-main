"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};:,.?]).{6,}$/;

export default function RegisterPage() {
  const supabase = createSupabaseBrowserClient();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [nationality, setNationality] = useState("");
  const [residenceStatus, setResidenceStatus] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [passConfirm, setPassConfirm] = useState("");

  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validateForm() {
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !birthDate ||
      !nationality.trim() ||
      !residenceStatus.trim() ||
      !address.trim() ||
      !email.trim() ||
      !pass ||
      !passConfirm
    ) {
      return "Todos los campos son obligatorios.";
    }

    if (pass !== passConfirm) {
      return "Las contraseñas no coinciden.";
    }

    if (!passwordRegex.test(pass)) {
      return "La contraseña debe tener mínimo 6 caracteres; al menos una mayúscula; una minúscula y un carácter especial (!@#$%^&*()_+-=[]{};:,.?).";
    }

    return null;
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);

    const validationError = validateForm();
    if (validationError) {
      setErr(validationError);
      return;
    }

    setLoading(true);

    // 1) Crear usuario en Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
    });

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    const user = data.user;

    // 2) Crear registro en profiles con rol por defecto "cliente"
    if (user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: user.id,
        role: "cliente",
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        birth_date: birthDate || null,
        nationality: nationality.trim(),
        residence_status: residenceStatus.trim(),
        address: address.trim(),
      });

      if (profileError) {
        setErr(
          "Se creó el usuario pero hubo un problema creando el perfil interno. Revisa la tabla profiles en Supabase. Detalle: " +
            profileError.message
        );
        setLoading(false);
        return;
      }
    }

    setOk(
      "Cuenta creada. Revisa tu correo para confirmar tu dirección antes de iniciar sesión."
    );
    setLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f5f7fb] to-white px-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-xl">
        <h1 className="text-xl font-semibold text-slate-900">
          Crear nueva cuenta
        </h1>
        <p className="mt-1 text-xs text-slate-600">
          Los datos se usan solo para gestionar tu caso y tu acceso al panel.
        </p>

        <form onSubmit={handleRegister} className="mt-4 space-y-4 text-sm">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs text-slate-600">Nombre</label>
              <input
                type="text"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 text-xs focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-600">Apellido</label>
              <input
                type="text"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 text-xs focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs text-slate-600">
                Fecha de nacimiento
              </label>
              <input
                type="date"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 text-xs focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-600">Nacionalidad</label>
              <input
                type="text"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 text-xs focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                placeholder="Venezolana; colombiana; etc."
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-600">
              Residencia o situación migratoria actual
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 text-xs focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
              placeholder="Ej: Aufenthalt §25 Abs.3; Duldung; Asylverfahren offen; fuera de Alemania..."
              value={residenceStatus}
              onChange={(e) => setResidenceStatus(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-slate-600">Dirección</label>
            <input
              type="text"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 text-xs focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
              placeholder="Ciudad y código postal al menos"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

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

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs text-slate-600">Contraseña</label>
              <input
                type="password"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 text-xs focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                placeholder="••••••"
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
                placeholder="••••••"
                value={passConfirm}
                onChange={(e) => setPassConfirm(e.target.value)}
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            La contraseña debe tener mínimo 6 caracteres; al menos una letra
            mayúscula; una minúscula y un carácter especial; por ejemplo:
            !@#$%^&amp;*()_+-=[]{};:,.?
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
            className="w-full rounded-full bg-indigo-600 text-white py-2 text-sm font-semibold hover:bg-indigo-700 transition shadow-md disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-4 text-xs text-slate-600">
          ¿Ya tienes cuenta?{" "}
          <a href="/auth/login" className="text-indigo-600 font-medium">
            Iniciar sesión
          </a>
        </p>
      </div>
    </main>
  );
}
