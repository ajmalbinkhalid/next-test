"use client";

import { create } from "zustand";
import type { AuthSession, AuthStatus } from "@/types/auth";
import {
  clearAuthSession,
  readAuthSession,
  writeAuthSession,
} from "@/utils/auth-storage";

const EMPTY_SESSION: AuthSession = {
  tokens: null,
  user: null,
  mobile: null,
};

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
  isReady: boolean;
  session: AuthSession;
  status: AuthStatus;
  setSession: (session: AuthSession, statusOverride?: AuthStatus) => void;
  clearSession: () => void;
  refreshFromStorage: () => void;
};

export const useAuthStore = create<AuthStore>((set) => {
  const initialSession = readAuthSession() ?? EMPTY_SESSION;

  return {
    isReady: true,
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
        session: EMPTY_SESSION,
        status: "unauthenticated",
      });
    },
    refreshFromStorage: () => {
      const session = readAuthSession() ?? EMPTY_SESSION;
      set({
        session,
        status: resolveStatus(session),
      });
    },
  };
});
