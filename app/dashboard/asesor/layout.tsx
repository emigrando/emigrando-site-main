"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

interface ProfileRow {
  role: string;
}

export default function AsesorDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    let isMounted = true;

    async function check() {
      // 1) Usuario autenticado
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (userError || !userData?.user) {
        router.replace("/auth/login");
        setChecking(false);
        return;
      }

      // 2) Perfil con rol en la tabla profiles
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)   // <- AQUÍ EL CAMBIO CLAVE
        .maybeSingle();

      if (!isMounted) return;

      if (profileError || !profile) {
        // No hay perfil o error: lo mando al login
        router.replace("/auth/login");
        setChecking(false);
        return;
      }

      // Solo asesor/admin pueden entrar aquí
      if (profile.role !== "asesor" && profile.role !== "admin") {
        router.replace("/auth/login");
        setChecking(false);
        return;
      }

      setUser(userData.user);
      setChecking(false);
    }

    check();

    return () => {
      isMounted = false;
    };
  }, [router, supabase]);

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f5f7fb] to-white px-4">
        <div className="rounded-2xl border border-slate-200 bg-white/90 px-6 py-4 shadow-md text-sm text-slate-600">
          Verificando acceso al panel interno...
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
