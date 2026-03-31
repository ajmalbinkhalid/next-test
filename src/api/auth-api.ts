"use client";

import axiosClient from "@/api/config/axios-client";
import type {
  CreateProfilePayload,
  CreateProfileResponse,
  RefreshTokenPayload,
  RefreshTokenResponse,
  SendOtpPayload,
  VerifyOtpPayload,
  VerifyOtpResponse,
} from "@/types/auth";
import { normalizeIndianMobile } from "@/utils/format";

function toFormData<T extends object>(payload: T) {
  const formData = new FormData();

  Object.entries(payload as Record<string, string | Blob | undefined>).forEach(
    ([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value);
      }
    },
  );

  return formData;
}

export const authApi = {
  sendOtp: async (payload: SendOtpPayload): Promise<{ success: boolean; message: string }> => {
    const response = await axiosClient.post(
      "/auth/send-otp",
      toFormData({
        ...payload,
        mobile: normalizeIndianMobile(payload.mobile),
      }),
    );

    return response.data;
  },

  verifyOtp: async (payload: VerifyOtpPayload): Promise<VerifyOtpResponse> => {
    const response = await axiosClient.post(
      "/auth/verify-otp",
      toFormData({
        ...payload,
        mobile: normalizeIndianMobile(payload.mobile),
      }),
    );

    return response.data;
  },

  createProfile: async (payload: CreateProfilePayload): Promise<CreateProfileResponse> => {
    const response = await axiosClient.post(
      "/auth/create-profile",
      toFormData({
        mobile: normalizeIndianMobile(payload.mobile),
        name: payload.name,
        email: payload.email,
        qualification: payload.qualification,
        profile_image: payload.profileImage,
      }),
    );

    return response.data;
  },

  logout: async (): Promise<{ success: boolean; message: string }> => {
    const response = await axiosClient.post("/auth/logout");
    return response.data;
  },

  refreshToken: async (
    payload: RefreshTokenPayload,
  ): Promise<RefreshTokenResponse> => {
    const attempts = [
      () =>
        axiosClient.post("/auth/refresh-token", {
          refresh_token: payload.refreshToken,
        }),
      () =>
        axiosClient.post("/auth/refresh", {
          refresh_token: payload.refreshToken,
        }),
      () =>
        axiosClient.post(
          "/auth/refresh-token",
          toFormData({ refresh_token: payload.refreshToken }),
        ),
      () =>
        axiosClient.post(
          "/auth/refresh",
          toFormData({ refresh_token: payload.refreshToken }),
        ),
    ];

    let lastError: unknown;

    for (const attempt of attempts) {
      try {
        const response = await attempt();
        return response.data;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError;
  },
};

export default authApi;
