"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import authApi from "@/api/auth-api";
import { AuthContext } from "@/contexts/auth-context";
import type {
  CreateProfilePayload,
  UserProfile,
} from "@/types/auth";
import { useAuthStore } from "@/store/auth-store";
import type { ApiErrorResponse } from "@/types/api";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { clearSession, session, setSession, status } = useAuthStore();

  async function sendOtp({ mobile }: { mobile: string }) {
    const response = await authApi.sendOtp({ mobile });

    setSession(
      {
        ...session,
        mobile,
      },
      "otp-sent",
    );

    toast.success(response.message);
    return { message: response.message };
  }

  async function verifyOtp({ mobile, otp }: { mobile: string; otp: string }) {
    const response = await authApi.verifyOtp({ mobile, otp });

    setSession(
      {
        tokens: null,
        user: null,
        mobile,
      },
      "needs-profile",
    );

    toast.success(response.message);
    return { login: false, message: response.message };
  }

  async function createProfile(payload: Omit<CreateProfilePayload, "mobile">) {
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

    const user: UserProfile = {
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
      user,
      mobile: session.mobile,
    });

    toast.success(response.message);
    return { message: response.message };
  }

  async function logout() {
    try {
      await authApi.logout();
    } catch {
      // Token cleanup still happens locally if the API call fails.
    }

    clearSession();
    toast.success("Logged out successfully");
    router.push("/login");
  }

  return (
    <AuthContext.Provider
      value={{
        status,
        user: session.user,
        mobile: session.mobile,
        tokens: session.tokens,
        sendOtp,
        verifyOtp,
        createProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
