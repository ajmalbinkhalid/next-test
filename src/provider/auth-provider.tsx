"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import authApi from "@/api/auth-api";
import { AuthContext } from "@/contexts/auth-context";
import type {
  CreateProfilePayload,
  UserProfile,
} from "@/types/auth";
import type { ApiErrorResponse } from "@/types/api";
import { useAuthStore } from "@/store/auth-store";

function toTokens(payload: {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
}) {
  if (!payload.access_token || !payload.refresh_token) {
    return null;
  }

  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    tokenType: payload.token_type ?? "Bearer",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { clearSession, isReady, refreshFromStorage, session, setSession, status } = useAuthStore();

  const sendOtp = useCallback(
    async ({ mobile }: { mobile: string }) => {
      const response = await authApi.sendOtp({ mobile });
      const nextSession = {
        ...session,
        mobile,
      };

      setSession(nextSession, "otp-sent");
      toast.success(response.message);

      return { message: response.message };
    },
    [session, setSession],
  );

  const verifyOtp = useCallback(
    async ({ mobile, otp }: { mobile: string; otp: string }) => {
      const response = await authApi.verifyOtp({ mobile, otp });

      if (response.login) {
        setSession({
          tokens: toTokens(response),
          user: session.user,
          mobile,
        });
        toast.success(response.message);
        return { login: true, message: response.message };
      }

      setSession({
        tokens: null,
        user: null,
        mobile,
      }, "needs-profile");
      toast.success(response.message);

      return { login: false, message: response.message };
    },
    [session.user, setSession],
  );

  const createProfile = useCallback(
    async (payload: Omit<CreateProfilePayload, "mobile">) => {
      if (!session.mobile) {
        const error: ApiErrorResponse = {
          success: false,
          message: "Mobile number is missing. Please verify OTP again.",
        };

        throw error;
      }

      const response = await authApi.createProfile({
        ...payload,
        mobile: session.mobile,
      });

      const nextUser: UserProfile = {
        ...response.user,
        mobile: response.user.mobile ?? session.mobile,
        profileImage: response.user.profileImage ?? null,
      };

      setSession({
        tokens: {
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
          tokenType: "Bearer",
        },
        user: nextUser,
        mobile: session.mobile,
      });

      toast.success(response.message);
      return { message: response.message };
    },
    [session.mobile, setSession],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Token cleanup still happens locally if the API call fails.
    }

    clearSession();
    toast.success("Logged out successfully");
    router.push("/login");
  }, [clearSession, router]);

  const value = useMemo(
    () => ({
      status,
      isReady,
      user: session.user,
      mobile: session.mobile,
      tokens: session.tokens,
      sendOtp,
      verifyOtp,
      createProfile,
      logout,
      refreshFromStorage,
    }),
    [
      createProfile,
      isReady,
      logout,
      refreshFromStorage,
      sendOtp,
      session.mobile,
      session.tokens,
      session.user,
      status,
      verifyOtp,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
