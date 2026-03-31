"use client";

import {
  ACCESS_TOKEN_COOKIE,
  AUTH_STORAGE_KEY,
} from "@/lib/constants";
import type { AuthSession } from "@/types/auth";
import { isBrowser, readStorage, removeStorage, writeStorage } from "@/utils/browser-storage";

const EMPTY_SESSION: AuthSession = {
  tokens: null,
  user: null,
  mobile: null,
};

export function readAuthSession() {
  return readStorage<AuthSession>(AUTH_STORAGE_KEY) ?? EMPTY_SESSION;
}

export function writeAuthSession(session: AuthSession) {
  writeStorage(AUTH_STORAGE_KEY, session);
  syncAccessTokenCookie(session.tokens?.accessToken ?? null);
}

export function clearAuthSession() {
  removeStorage(AUTH_STORAGE_KEY);
  syncAccessTokenCookie(null);
}

export function getAccessToken() {
  return readAuthSession().tokens?.accessToken ?? null;
}

export function getRefreshToken() {
  return readAuthSession().tokens?.refreshToken ?? null;
}

function syncAccessTokenCookie(token: string | null) {
  if (!isBrowser()) {
    return;
  }

  if (!token) {
    document.cookie = `${ACCESS_TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
    return;
  }

  document.cookie = `${ACCESS_TOKEN_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax`;
}
