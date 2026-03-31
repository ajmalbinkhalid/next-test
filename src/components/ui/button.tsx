import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--brand-600)] text-white shadow-[0_18px_50px_rgba(12,79,165,0.28)] hover:bg-[var(--brand-700)]",
  secondary:
    "bg-white text-[var(--slate-900)] ring-1 ring-[var(--slate-200)] hover:bg-[var(--slate-50)]",
  ghost:
    "bg-transparent text-[var(--brand-700)] hover:bg-[var(--brand-50)]",
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-12 items-center justify-center rounded-2xl px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
