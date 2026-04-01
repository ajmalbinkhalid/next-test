"use client";

import { create } from "zustand";
import { EMPTY_AUTH_SESSION, type AuthSession, type AuthStatus } from "@/types/auth";
import {
  clearAuthSession,
  readAuthSession,
  writeAuthSession,
} from "@/utils/auth-storage";

function resolveStatus(session: AuthSession): AuthStatus {
  if (session.tokens?.accessToken) {
    return "authenticated";
  }

  if (session.mobile) {
    return "needs-profile";
  }

  return "unauthenticated";
}

type AuthStore = {
  session: AuthSession;
  status: AuthStatus;
  setSession: (session: AuthSession, statusOverride?: AuthStatus) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthStore>((set) => {
  const initialSession = readAuthSession();

  return {
    session: initialSession,
    status: resolveStatus(initialSession),
    setSession: (session, statusOverride) => {
      writeAuthSession(session);
      set({
        session,
        status: statusOverride ?? resolveStatus(session),
      });
    },
    clearSession: () => {
      clearAuthSession();
      set({
        session: EMPTY_AUTH_SESSION,
        status: "unauthenticated",
      });
    },
  };
});
