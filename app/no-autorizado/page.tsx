export default function NoAutorizadoPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#f5f7fb] to-white text-slate-900">
      <div className="rounded-2xl border border-slate-200 bg-white/90 px-6 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <h1 className="text-xl font-semibold text-slate-900">Acceso denegado</h1>
        <p className="mt-2 text-sm text-slate-600">
          No tienes permisos para entrar a esta sección del panel.
        </p>
        <a
          href="/auth/login"
          className="mt-4 inline-flex rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-700"
        >
          Ir al login
        </a>
      </div>
    </main>
  );
}
