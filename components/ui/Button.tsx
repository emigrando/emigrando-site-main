import { ButtonHTMLAttributes } from "react";

type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
  size?: ButtonSize;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const sizeClasses =
    size === "lg"
      ? "px-6 py-2.5 text-sm"
      : size === "sm"
      ? "px-3 py-1.5 text-xs"
      : "px-4 py-2 text-sm";

  if (variant === "ghost") {
    return (
      <button
        className={`${sizeClasses} rounded-2xl border border-cardBorder bg-white/60 text-foreground font-medium hover:bg-white transition ${className}`}
        {...props}
      />
    );
  }

  return (
    <button
      className={`${sizeClasses} rounded-2xl bg-accent text-white font-semibold shadow-soft hover:opacity-90 transition ${className}`}
      {...props}
    />
  );
}
