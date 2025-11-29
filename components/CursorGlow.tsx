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
    <motion.div className="pointer-events-none fixed inset-0 -z-10">
      <motion.div
        className="h-80 w-80 rounded-full"
        style={{
          position: "absolute",
          left: pos.x - 160,
          top: pos.y - 160,
          background: "radial-gradient(circle at center, rgba(255,0,0,0.7), transparent 60%)",
          mixBlendMode: "soft-light",
          filter: "blur(6px)",
        }}
        animate={{ x: pos.x - 160, y: pos.y - 160, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 30 }}
      />
    </motion.div>
  );
}
