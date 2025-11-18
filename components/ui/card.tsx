// components/ui/Card.tsx
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-card rounded-3xl shadow-card border border-cardBorder ${className}`}
    >
      {children}
    </div>
  );
}
