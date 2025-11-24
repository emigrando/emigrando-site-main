"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  async function handleLogout() {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
    router.replace("/auth/login");
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/90 px-3 py-1.5 text-[11px] font-medium text-slate-600 shadow-sm hover:border-rose-400 hover:text-rose-600 hover:shadow-md transition disabled:opacity-60"
    >
      {loading ? "Cerrando..." : "Cerrar sesión"}
    </button>
  );
}
