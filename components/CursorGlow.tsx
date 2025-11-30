"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CursorGlow() {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <motion.div className="pointer-events-none fixed inset-0 z-0">
      <motion.div
        style={{
          position: "absolute",
          left: pos.x - 160,
          top: pos.y - 160,
          width: 320,
          height: 320,
          borderRadius: "9999px",
          background:
            "radial-gradient(circle at center, rgba(129,140,248,0.6), transparent 60%)",
          filter: "blur(6px)",
          mixBlendMode: "soft-light",
          boxShadow: "0 0 80px rgba(129,140,248,0.6)",
        }}
        animate={{ x: pos.x - 160, y: pos.y - 160 }}
        transition={{ type: "spring", stiffness: 120, damping: 24, mass: 0.7 }}
      />
    </motion.div>
  );
}
