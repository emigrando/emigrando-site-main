"use client";

import type { ReactNode } from "react";
import clsx from "clsx";

type Accent = "indigo" | "emerald" | "amber" | "rose";

const accentMap: Record<Accent, string> = {
  indigo: "from-indigo-400 via-violet-400 to-fuchsia-400",
  emerald: "from-emerald-400 via-teal-400 to-cyan-400",
  amber: "from-amber-400 via-orange-400 to-rose-400",
  rose: "from-rose-400 via-pink-400 to-purple-400",
};

interface FrostedGlassIconProps {
  label: string;
  accent?: Accent;
  icon: ReactNode;
}

export default function FrostedGlassIcon({
  label,
  accent = "indigo",
  icon,
}: FrostedGlassIconProps) {
  return (
    <div className="inline-flex flex-col items-center gap-3">
      {/* “Plataforma” negra de fondo */}
      <div className="relative">
        {/* Base de color */}
        <div
          className={clsx(
            "h-16 w-16 rounded-2xl bg-gradient-to-br",
            accentMap[accent]
          )}
        />

        {/* Capa “vidrio esmerilado” */}
        <div className="absolute inset-0 translate-x-1 -translate-y-1 rounded-2xl bg-white/12 shadow-[0_18px_45px_rgba(15,23,42,0.55)] backdrop-blur-xl border border-white/30 flex items-center justify-center">
          {/* Icono en sí */}
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 border border-white/20">
            <div className="text-white text-xl">{icon}</div>
          </div>
        </div>
      </div>

      {/* Etiqueta */}
      <span className="text-xs font-medium text-slate-200 drop-shadow-sm">
        {label}
      </span>
    </div>
  );
}
