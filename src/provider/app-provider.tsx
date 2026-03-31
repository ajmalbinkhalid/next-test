"use client";

import { Toaster } from "sonner";
import { AuthProvider } from "@/provider/auth-provider";
import { QueryProvider } from "@/provider/query-provider";

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        {children}
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </QueryProvider>
  );
}
