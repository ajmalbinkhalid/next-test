import type { ApiErrorResponse } from "@/types/api";

export function isApiError(error: unknown): error is ApiErrorResponse {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error
  );
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (isApiError(error) && typeof error.message === "string" && error.message) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function getApiFieldErrors(error: unknown) {
  if (!isApiError(error) || !error.errors) {
    return [];
  }

  return Object.values(error.errors).flat().filter(Boolean);
}
