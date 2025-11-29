"use client";

import { useEffect, useState } from "react";
import type React from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { motion } from "framer-motion";

export default function AsesorDashboard() {
  const supabase = createSupabaseBrowserClient();

  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  // Campos del formulario de crear caso
  const [newCliente, setNewCliente] = useState("");
  const [newTipo, setNewTipo] = useState("");
  const [newAutoridad, setNewAutoridad] = useState("");
  const [newEstado, setNewEstado] = useState("");
  const [newNotas, setNewNotas] = useState("");
  const [newPrioridad, setNewPrioridad] = useState("media");

  // ID real del cliente seleccionado
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  // Buscador de clientes
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [clientSearchLoading, setClientSearchLoading] = useState(false);
  const [clientSearchResults, setClientSearchResults] = useState<any[]>([]);
  const [clientSearchError, setClientSearchError] = useState<string | null>(
    null
  );

  const fetchCases = async () => {
    setLoading(true);
    setErr(null);

    const { data, error } = await supabase
      .from("cases")
      .select(
        "id, case_code, cliente, tipo, autoridad, estado, prioridad, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    setCases(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // BUSCAR CLIENTES EN SUPABASE
  const handleClientSearch = async () => {
  const term = clientSearchTerm.trim();

  if (!term) {
    setClientSearchResults([]);
    setClientSearchError(null);
    return;
  }

  setClientSearchLoading(true);
  setClientSearchError(null);

  const pattern = `%${term}%`;

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, first_name, last_name, nationality, residence_status, address, role"
    )
    .eq("role", "cliente")
    .or(
      [
        `first_name.ilike.${pattern}`,
        `last_name.ilike.${pattern}`,
        `nationality.ilike.${pattern}`,
        `residence_status.ilike.${pattern}`,
        `address.ilike.${pattern}`,
      ].join(",")
    )
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Error buscando clientes:", error.message);
    setClientSearchError(error.message);
    setClientSearchResults([]);
    setClientSearchLoading(false);
    return;
  }

  setClientSearchResults(data || []);
  setClientSearchLoading(false);
};

  // CREAR CASO NUEVO
  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (!selectedClientId) {
      setErr("Debes seleccionar un cliente para crear un caso.");
      return;
    }

    const {
      data: userData,
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      setErr("No se pudo obtener el usuario autenticado: " + userError.message);
      return;
    }

    const ownerId = userData?.user?.id ?? null;

    const { error } = await supabase.from("cases").insert({
      cliente: newCliente.trim(),
      tipo: newTipo.trim(),
      autoridad: newAutoridad.trim(),
      estado: newEstado.trim(),
      prioridad: newPrioridad,
      owner_user_id: ownerId,
      client_user_id: selectedClientId,
      notas_breves: newNotas.trim(),
    });

    if (error) {
      setErr("Error creando caso: " + error.message);
      return;
    }

    // Resetear formulario
    setNewCliente("");
    setNewTipo("");
    setNewAutoridad("");
    setNewEstado("");
    setNewNotas("");
    setNewPrioridad("media");
    setSelectedClientId(null);
    setClientSearchTerm("");
    setClientSearchResults([]);
    setClientSearchError(null);

    fetchCases();
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f5f7fb] to-white px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-2xl font-bold">Panel del Asesor</h1>

        {/* FORMULARIO CREAR CASO */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 rounded-xl border border-slate-200 bg-white/80 p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold">Crear nuevo caso</h2>
          <p className="mb-4 text-xs text-slate-600">
            Completa todos los datos del caso y selecciona el cliente.
          </p>

          <form onSubmit={handleCreateCase} className="space-y-4 text-sm">
            {/* BUSCADOR DE CLIENTES */}
            <div className="space-y-1">
              <label className="text-xs text-slate-600">
                Buscar cliente (nombre, apellido, email, nacionalidad,
                dirección)
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  value={clientSearchTerm}
                  onChange={(e) => setClientSearchTerm(e.target.value)}
                  placeholder="Ej: González, Maria, venezolana, Augsburg..."
                />
                <button
                  type="button"
                  onClick={handleClientSearch}
                  className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-indigo-700"
                  disabled={clientSearchLoading}
                >
                  {clientSearchLoading ? "Buscando..." : "Buscar"}
                </button>
              </div>

              {clientSearchError && (
                <p className="text-[11px] text-rose-600">
                  {clientSearchError}
                </p>
              )}

              {clientSearchResults.length > 0 && (
                <div className="mt-2 max-h-52 divide-y overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                  {clientSearchResults.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedClientId(p.id);
                        setNewCliente(
                          `${p.first_name || ""} ${
                            p.last_name || ""
                          }`.trim() || "Sin nombre"
                        );
                        setClientSearchTerm("");
                        setClientSearchResults([]);
                        setClientSearchError(null);
                      }}
                      className="w-full px-4 py-2 text-left text-xs hover:bg-indigo-50"
                    >
                      <span className="font-semibold">
                        {p.first_name} {p.last_name}
                      </span>{" "}
                      · {p.email || "sin email"} ·{" "}
                      {p.nationality || "—"}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* CLIENTE SELECCIONADO */}
            {selectedClientId && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[11px]">
                Cliente seleccionado:{" "}
                <span className="font-semibold">{newCliente}</span>
              </div>
            )}

            {/* CAMPOS DEL CASO */}
            <div>
              <label className="text-xs text-slate-600">Cliente (texto)</label>
              <input
                type="text"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:bg-white"
                value={newCliente}
                onChange={(e) => setNewCliente(e.target.value)}
                placeholder="Ej: Familia González"
              />
            </div>

            <div>
              <label className="text-xs text-slate-600">Tipo de caso</label>
              <input
                type="text"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:bg-white"
                value={newTipo}
                onChange={(e) => setNewTipo(e.target.value)}
                placeholder="Ej: Permiso de residencia"
              />
            </div>

            <div>
              <label className="text-xs text-slate-600">Autoridad</label>
              <input
                type="text"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:bg-white"
                value={newAutoridad}
                onChange={(e) => setNewAutoridad(e.target.value)}
                placeholder="Ej: Ausländerbehörde, Jobcenter, BAMF..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-600">Estado</label>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:bg-white"
                  value={newEstado}
                  onChange={(e) => setNewEstado(e.target.value)}
                >
                  <option value="">Selecciona</option>
                  <option value="nuevo">Nuevo</option>
                  <option value="revision">En revisión</option>
                  <option value="pendiente_cliente">
                    Pendiente del cliente
                  </option>
                  <option value="completado">Completado</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-600">Prioridad</label>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:bg-white"
                  value={newPrioridad}
                  onChange={(e) => setNewPrioridad(e.target.value)}
                >
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-600">Notas internas</label>
              <textarea
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:bg-white"
                rows={3}
                value={newNotas}
                onChange={(e) => setNewNotas(e.target.value)}
                placeholder="Notas breves sobre el caso al momento de crearlo."
              />
            </div>

            {err && (
              <p className="text-[11px] text-rose-600">
                {err}
              </p>
            )}

            <div className="pt-2">
              <button
                type="submit"
                className="rounded-full bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-60"
                disabled={!selectedClientId}
              >
                Guardar caso
              </button>
              {!selectedClientId && (
                <p className="mt-1 text-[11px] text-slate-500">
                  Primero selecciona un cliente en el buscador de arriba.
                </p>
              )}
            </div>
          </form>
        </motion.div>

        {/* LISTADO DE CASOS */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-xl border border-slate-200 bg-white/80 p-6 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-semibold">Casos registrados</h2>

          {loading && (
            <p className="text-sm text-slate-500">Cargando casos...</p>
          )}

          {!loading && cases.length === 0 && (
            <p className="text-sm text-slate-500">
              Todavía no hay casos registrados en el sistema.
            </p>
          )}

          {!loading && cases.length > 0 && (
            <div className="space-y-3 text-sm">
              {cases.map((c) => {
                const code =
                  c.case_code ||
                  (c.id ? `CAS-${String(c.id).slice(-8).toUpperCase()}` : "—");
                const fecha = c.created_at
                  ? new Date(c.created_at).toLocaleDateString("de-DE")
                  : "Sin fecha";

                return (
                  <a
                    key={c.id}
                    href={`/dashboard/asesor/caso/${c.id}`}
                    className="block rounded-xl border border-slate-100 bg-white px-4 py-3 transition hover:bg-indigo-50/60"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] text-slate-500">
                          Nº de caso:{" "}
                          <span className="font-mono">{code}</span>
                        </p>
                        <p className="font-semibold text-slate-900">
                          {c.cliente || "Sin nombre asignado"}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {c.tipo || "Tipo no definido"} ·{" "}
                          {c.autoridad || "Autoridad no definida"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-slate-500">
                          Creado el {fecha}
                        </p>
                        <p className="mt-1 text-[11px]">
                          Estado:{" "}
                          <span className="font-semibold">
                            {c.estado || "sin estado"}
                          </span>
                        </p>
                        <p className="mt-1 text-[11px]">
                          Prioridad:{" "}
                          <span className="font-semibold">
                            {c.prioridad || "media"}
                          </span>
                        </p>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
