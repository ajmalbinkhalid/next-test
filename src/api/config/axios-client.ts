"use client";

import axios, { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/api";
import { useAuthStore } from "@/store/auth-store";
import { getAccessToken } from "@/utils/auth-storage";
import { API_BASE_URL } from "@/utils/base-url";

type ErrorPayload = ApiErrorResponse & {
  detail?:
    | string
    | (Partial<ApiErrorResponse> & {
        detail?: string;
      });
};

function readApiErrorMessage(payload?: ErrorPayload) {
  if (!payload) {
    return undefined;
  }

  if (typeof payload.detail === "string") {
    return payload.detail;
  }

  if (payload.detail && typeof payload.detail === "object") {
    return payload.detail.message ?? payload.detail.detail;
  }

  return payload.message;
}

function readApiErrorErrors(payload?: ErrorPayload) {
  if (!payload) {
    return undefined;
  }

  if (payload.detail && typeof payload.detail === "object") {
    return payload.detail.errors ?? payload.errors;
  }

  return payload.errors;
}

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Accept-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
  timeout: 15_000,
});

axiosClient.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  if (typeof window !== "undefined") {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const responsePayload = error.response?.data as ErrorPayload | undefined;

    if (error.response?.status === 401) {
      useAuthStore.getState().clearSession();
    }

    const apiError: ApiErrorResponse = {
      success: false,
      message:
        readApiErrorMessage(responsePayload) ??
        error.message ??
        "Something went wrong. Please try again.",
      errors: readApiErrorErrors(responsePayload),
      statusCode: error.response?.status,
    };

    return Promise.reject(apiError);
  },
);

export default axiosClient;
