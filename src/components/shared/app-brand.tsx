import Image from "next/image";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/utils/cn";

export function AppBrand({ className }: { className?: string }) {
  return (
    <Link href="/instruction" className={cn("inline-flex items-center justify-center gap-2.5", className)}>
      <Image
        src="/icons/capblue.svg"
        alt={APP_NAME}
        width={48}
        height={46}
        className="h-auto w-10 sm:h-auto sm:w-12"
      />
      <span className="flex flex-col justify-center leading-none">
        <span className="block font-[var(--font-poppins)] text-[15px] font-semibold tracking-[-0.03em] text-[#1180b3] sm:text-[17px]">
          {APP_NAME}
        </span>
        <span className="mt-1 block text-[6px] font-medium text-[#4a90af] sm:text-[7px]">
          futuristic learning
        </span>
      </span>
    </Link>
  );
}
