// components/SplineBackground.tsx
"use client";

import Spline from "@splinetool/react-spline/next";

export default function SplineBackground() {
  return (
    <div className="absolute inset-0">
      {/* IMPORTANTE: usa aquí el enlace de Code → Next.js, NO el de Public URL */}
      <Spline scene="https://prod.spline.design/yu0FDTpuhwatWs1P/scene.splinecode" />
    </div>
  );
}
