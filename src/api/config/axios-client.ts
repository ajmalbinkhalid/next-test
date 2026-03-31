"use client";

import axios, { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/api";
import { useAuthStore } from "@/store/auth-store";
import { getAccessToken, getRefreshToken } from "@/utils/auth-storage";

type RetriableRequestConfig = {
  _retry?: boolean;
  headers?: Record<string, string>;
};

export const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Accept-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
  timeout: 15_000,
});

const refreshClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Accept-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
  timeout: 15_000,
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      const attempts = [
        () =>
          refreshClient.post("/auth/refresh-token", {
            refresh_token: refreshToken,
          }),
        () =>
          refreshClient.post("/auth/refresh", {
            refresh_token: refreshToken,
          }),
      ];

      for (const attempt of attempts) {
        try {
          const response = await attempt();
          const data = response.data as {
            access_token?: string;
            refresh_token?: string;
            token_type?: string;
          };

          if (!data.access_token || !data.refresh_token) {
            continue;
          }

          const currentSession = useAuthStore.getState().session;

          useAuthStore.getState().setSession({
            ...currentSession,
            tokens: {
              accessToken: data.access_token,
              refreshToken: data.refresh_token,
              tokenType: data.token_type ?? "Bearer",
            },
          });

          return data.access_token;
        } catch {
          // Try the next refresh endpoint shape.
        }
      }

      useAuthStore.getState().clearSession();
      return null;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

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
    const originalRequest = error.config as typeof error.config & RetriableRequestConfig;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/logout")
    ) {
      originalRequest._retry = true;

      return refreshAccessToken().then((nextAccessToken) => {
        if (!nextAccessToken) {
          const apiError: ApiErrorResponse = {
            success: false,
            message: "Your session expired. Please log in again.",
            statusCode: 401,
          };

          return Promise.reject(apiError);
        }

        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${nextAccessToken}`,
        };

        return axiosClient(originalRequest);
      });
    }

    const apiError: ApiErrorResponse = {
      success: false,
      message:
        error.response?.data?.message ??
        error.message ??
        "Something went wrong. Please try again.",
      errors: error.response?.data?.errors,
      statusCode: error.response?.status,
    };

    return Promise.reject(apiError);
  },
);

export default axiosClient;
