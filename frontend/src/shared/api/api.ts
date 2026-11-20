import axios from "axios";

export interface FastApiValidationErrorItem {
  loc?: (string | number)[];
  msg?: string;
  type?: string;
}

export interface FastApiErrorResponse {
  detail?: string | FastApiValidationErrorItem[];
}

export const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  withCredentials: true,
});

export const axiosInstance = api;

export function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<FastApiErrorResponse>(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string" && detail.trim()) {
      return detail;
    }
    if (Array.isArray(detail) && detail.length > 0) {
      return detail
        .map((item) => item.msg ?? "Error de validación")
        .join(", ");
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

export default api;
