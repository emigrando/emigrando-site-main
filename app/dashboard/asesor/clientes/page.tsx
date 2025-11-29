"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import LogoutButton from "@/components/LogoutButton";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

interface ProfileRow {
  id: string;
  role: string | null;
  first_name: string | null;
  last_name: string | null;
  birth_date: string | null;
  nationality: string | null;
  residence_status: string | null;
  address: string | null;
  created_at: string | null;
}

export default function ClientesListPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function searchProfiles() {
      setLoading(true);
      setErr(null);

      const term = searchTerm.trim().toLowerCase();

      if (!term) {
        const { data, error } = await supabase
          .from("profiles")
          .select(
            "id, role, first_name, last_name, birth_date, nationality, residence_status, address, created_at"
          )
          .eq("role", "cliente")
          .order("created_at", { ascending: false })
          .limit(30);

        if (!isMounted) return;

        if (error) {
          setErr(error.message);
          setLoading(false);
        } else {
          setProfiles((data || []) as ProfileRow[]);
          setLoading(false);
        }

        return;
      }

      const pattern = `%${term}%`;

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, role, first_name, last_name, birth_date, nationality, residence_status, address, created_at"
        )
        .eq("role", "cliente")
        .or(
          [
            `first_name.ilike.${pattern}`,
            `last_name.ilike.${pattern}`,
            `address.ilike.${pattern}`,
            `nationality.ilike.${pattern}`,
            `residence_status.ilike.${pattern}`,
          ].join(",")
        )
        .order("created_at", { ascending: false })
        .limit(20);

      if (!isMounted) return;

      if (error) {
        setErr(error.message);
        setLoading(false);
      } else {
        setProfiles((data || []) as ProfileRow[]);
        setLoading(false);
      }
    }

    searchProfiles();

    return () => {
      isMounted = false;
    };
  }, [searchTerm, supabase]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f5f7fb] to-white text-slate-900">
      <section className="mx-auto max-w-6xl px-4 pt-20 pb-16 lg:pt-24 lg:pb-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between"
        >
          <div>
            <button
              type="button"
              onClick={() => router.push("/dashboard/asesor")}
              className="text-[11px] font-medium text-slate-500 hover:text-slate-800"
            >
              ← Volver al tablero de casos
            </button>
            <p className="mt-2 text-xs font-medium text-indigo-700 uppercase tracking-[0.18em]">
              Clientes
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Lista de perfiles de clientes
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Aquí ves a todas las personas que se han registrado con rol
              cliente. Puedes entrar al detalle para corregir datos; ver sus
              casos asociados y gestionar su información.
            </p>
          </div>
          <div className="mt-1 flex flex-col items-end gap-2 md:mt-0">
            <span className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-slate-50 shadow-md">
              Total clientes: {profiles.length}
            </span>
            <LogoutButton />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
          className="mb-4 rounded-2xl border border-slate-100 bg-white/95 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
        >
          <label className="text-[11px] font-medium text-slate-600">
            Buscar por nombre; nacionalidad; dirección o situación migratoria
          </label>
          <input
            type="text"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            placeholder="Ej: García; venezolana; Aufenthalt; Augsburg..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <p className="mt-2 text-[11px] text-slate-500">
            La búsqueda es flexible: si escribes una parte del nombre o de la
            palabra, intentará encontrar coincidencias aproximadas.
          </p>
        </motion.div>

        {loading && (
          <p className="text-sm text-slate-600">
            Cargando lista de clientes desde Supabase...
          </p>
        )}

        {!loading && err && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {err}
          </div>
        )}

        {!loading && !err && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
            className="rounded-2xl border border-slate-100 bg-white/95 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
          >
            {profiles.length === 0 ? (
              <p className="text-sm text-slate-600">
                No se encontraron perfiles de clientes con la búsqueda actual.
              </p>
            ) : (
              <div className="space-y-3">
                {profiles.map((p) => {
                  const nombre =
                    `${p.first_name || ""} ${p.last_name || ""}`.trim() ||
                    "Sin nombre definido";

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() =>
                        router.push(`/dashboard/asesor/clientes/${p.id}`)
                      }
                      className="w-full text-left rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-xs text-slate-700 shadow-sm transition-all hover:-translate-y-[2px] hover:bg-white hover:shadow-md"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {nombre}
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-500">
                            {p.nationality || "Nacionalidad no indicada"} ·{" "}
                            {p.residence_status ||
                              "Situación migratoria no indicada"}
                          </p>
                        </div>
                        <div className="text-right text-[11px] text-slate-500">
                          {p.address && <p>{p.address}</p>}
                          {p.created_at && (
                            <p>
                              Registrado el{" "}
                              {new Date(
                                p.created_at
                              ).toLocaleDateString("de-DE")}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </section>
    </main>
  );
}
