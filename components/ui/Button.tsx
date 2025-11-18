import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  if (variant === "ghost") {
    return (
      <button
        className={`px-4 py-2 rounded-2xl border border-cardBorder bg-white/60 text-foreground text-sm font-medium hover:bg-white transition ${className}`}
        {...props}
      />
    );
  }

  return (
    <button
      className={`px-4 py-2 rounded-2xl bg-accent text-white text-sm font-semibold shadow-soft hover:opacity-90 transition ${className}`}
      {...props}
    />
  );
}
