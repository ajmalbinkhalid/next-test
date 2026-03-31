"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function UserMenu() {
  const { logout } = useAuth();

  return (
    <div className="flex items-center justify-end">
      <Button
        className="h-[34px] rounded-[4px] bg-[#1d8cbc] px-4 text-[12px] font-medium text-white shadow-none hover:bg-[#1678a2] sm:px-5 sm:text-[13px]"
        onClick={() => void logout()}
      >
        Logout
      </Button>
    </div>
  );
}
