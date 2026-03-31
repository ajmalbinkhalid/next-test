import type { InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-2xl border border-(--slate-200) bg-white px-4 text-sm text-(--slate-950) outline-none transition placeholder:text-(--slate-400) focus:border-(--brand-400) focus:ring-4 focus:ring-[rgba(74,141,230,0.15)]",
        className,
      )}
      {...props}
    />
  );
}
