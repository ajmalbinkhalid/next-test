"use client";

import axiosClient from "@/api/config/axios-client";
import type {
  CreateProfilePayload,
  CreateProfileResponse,
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

async function postForm<T>(url: string, payload: Record<string, string | Blob | undefined>) {
  const response = await axiosClient.post<T>(url, toFormData(payload));
  return response.data;
}

export const authApi = {
  sendOtp: async (payload: SendOtpPayload): Promise<{ success: boolean; message: string }> => {
    return postForm(
      "/auth/send-otp",
      {
        ...payload,
        mobile: normalizeIndianMobile(payload.mobile),
      },
    );
  },

  verifyOtp: async (payload: VerifyOtpPayload): Promise<VerifyOtpResponse> => {
    return postForm(
      "/auth/verify-otp",
      {
        ...payload,
        mobile: normalizeIndianMobile(payload.mobile),
      },
    );
  },

  createProfile: async (payload: CreateProfilePayload): Promise<CreateProfileResponse> => {
    return postForm(
      "/auth/create-profile",
      {
        mobile: normalizeIndianMobile(payload.mobile),
        name: payload.name,
        email: payload.email,
        qualification: payload.qualification,
        profile_image: payload.profileImage,
      },
    );
  },

  logout: async (): Promise<{ success: boolean; message: string }> => {
    const response = await axiosClient.post("/auth/logout");
    return response.data;
  },
};

export default authApi;
