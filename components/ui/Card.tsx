import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  bordered?: boolean;
}

export function Card({
  className = "",
  bordered = true,
  ...props
}: CardProps) {
  const base =
    "rounded-2xl bg-white/90 backdrop-blur-sm shadow-soft";
  const border = bordered ? " border border-slate-100" : "";

  return (
    <div
      className={`${base}${border} ${className}`}
      {...props}
    />
  );
}
