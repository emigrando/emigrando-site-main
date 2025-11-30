"use client";

import type { ReactNode } from "react";

type FrostedIconProps = {
  icon: ReactNode;
  gradientClass: string; // clases tailwind para el glow de color detrás
};

export default function FrostedIcon({ icon, gradientClass }: FrostedIconProps) {
  return (
    <div className="inline-flex items-center justify-center">
      <div className="relative">
        {/* Glow de color detrás */}
        <div
          className={`absolute inset-0 translate-y-2 rounded-2xl bg-gradient-to-br ${gradientClass} opacity-80 blur-[3px]`}
        />

        {/* Placa de vidrio */}
        <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-white/70 bg-white/80 shadow-[0_18px_40px_rgba(15,23,42,0.32)] backdrop-blur-xl">
          <div className="text-slate-900">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}
