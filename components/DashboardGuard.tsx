"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

type Role = "cliente" | "asesor" | "admin";

interface DashboardGuardProps {
  children: ReactNode;
  // Roles permitidos para esta ruta. Si no se pasa, cualquier rol con sesión puede entrar.
  allowedRoles?: Role[];
}

export default function DashboardGuard({
  children,
  allowedRoles,
}: DashboardGuardProps) {
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    let isMounted = true;

    async function checkSessionAndRole() {
      // 1) Sesión
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (sessionError || !session) {
        router.replace("/auth/login");
        return;
      }

      const userId = session.user.id;

      // 2) Buscar profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, role, full_name")
        .eq("id", userId)
        .maybeSingle();

      if (!isMounted) return;

      let finalProfile = profile;

      // 3) Si no hay profile, crear uno por defecto (role = cliente)
      if (!profile) {
        const { data: inserted, error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: userId,
            role: "cliente",
            full_name: session.user.email ?? null,
          })
          .select("id, role, full_name")
          .single();

        if (!isMounted) return;

        if (insertError) {
          console.error("Error creando profile por defecto", insertError);
          router.replace("/auth/login");
          return;
        }

        finalProfile = inserted;
      } else if (profileError) {
        console.error("Error cargando profile", profileError);
        router.replace("/auth/login");
        return;
      }

      // 4) Si la ruta exige roles y el usuario no está permitido, lo sacamos
      if (allowedRoles && allowedRoles.length > 0) {
        const role = (finalProfile?.role ?? "cliente") as Role;
        if (!allowedRoles.includes(role)) {
          router.replace("/");
          return;
        }
      }

      if (!isMounted) return;
      setChecking(false);
    }

    checkSessionAndRole();

    return () => {
      isMounted = false;
    };
  }, [router, supabase, allowedRoles]);

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f5f7fb] to-white">
        <p className="text-sm text-slate-600">Verificando acceso...</p>
      </main>
    );
  }

  return <>{children}</>;
}
