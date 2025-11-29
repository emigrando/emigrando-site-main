"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

type RolPermitido = "cliente" | "asesor" | "admin";

interface DashboardGuardProps {
  allowedRoles?: RolPermitido[];
  children: React.ReactNode;
}

export default function DashboardGuard({
  allowedRoles,
  children,
}: DashboardGuardProps) {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const pathname = usePathname();

  const [checking, setChecking] = useState(true);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function run() {
      // 1) Verificar sesión
      const { data: userData, error: authError } =
        await supabase.auth.getUser();

      if (!isMounted) return;

      if (authError || !userData?.user) {
        setBlocked(true);
        setChecking(false);
        router.replace("/auth/login");
        return;
      }

      const user = userData.user;

      // Si no hay roles específicos, basta con estar logueado
      if (!allowedRoles || allowedRoles.length === 0) {
        setChecking(false);
        return;
      }

      // 2) Cargar perfil por ID = auth.uid()
      const { data: profileRow, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id) // IMPORTANTE: aquí usamos id, NO user_id
        .maybeSingle();

      if (!isMounted) return;

      if (profileError || !profileRow) {
        // No hay perfil o error → mandamos a login
        setBlocked(true);
        setChecking(false);
        router.replace("/auth/login");
        return;
      }

      const role = (profileRow.role || "") as RolPermitido;

      if (!role || !allowedRoles.includes(role)) {
        // Usuario logueado pero sin rol permitido para esta ruta
        setBlocked(true);
        setChecking(false);
        router.replace("/auth/login");
        return;
      }

      // Todo bien
      setChecking(false);
    }

    run();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]); // si cambia de ruta dentro del dashboard, revalida

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f5f7fb] to-white px-4">
        <div className="rounded-2xl border border-slate-200 bg-white/90 px-6 py-4 shadow-md text-sm text-slate-600">
          Verificando tu acceso seguro.
        </div>
      </main>
    );
  }

  if (blocked) {
    // Mientras hace el replace al /auth/login, no mostramos nada
    return null;
  }

  return <>{children}</>;
}
