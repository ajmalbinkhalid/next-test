"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function UserMenu() {
  const { logout } = useAuth();

  return (
    <div className="flex items-center justify-end">
      <Button
        className="h-[45px] w-[101px] rounded-[4px] bg-[var(--action-info)] px-4 text-[12px] font-medium text-white shadow-none hover:bg-[var(--action-info-hover)] sm:text-[13px]"
        onClick={() => void logout()}
      >
        Logout
      </Button>
    </div>
  );
}
