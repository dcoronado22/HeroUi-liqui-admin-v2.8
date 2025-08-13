"use client";

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { env } from "@/config/env";
import { AuthService } from "@liquicapital/common";
import {
  attachAuthTokenRequestInterceptor,
} from "./Auth/attachAuthTokenRequestInterceptor";
import {
  logRequestInterceptor,
  logResponseInterceptor,
  handleAxiosError,
  setApiErrorHandler,
  setUnauthorizedHandler,
} from "./Auth/logInterceptors";

const apiClient: AxiosInstance = axios.create({
  baseURL: env.API_URL,
});

// Evita duplicar interceptores si el módulo se evalúa más de una vez en dev
let interceptorsAttached = false;

function attachInterceptorsOnce() {
  if (interceptorsAttached) return;
  interceptorsAttached = true;

  // 1) Token MSAL (+ inicialización)
  apiClient.interceptors.request.use(attachAuthTokenRequestInterceptor);

  // 2) Logging request
  apiClient.interceptors.request.use(logRequestInterceptor);

  // 3) Logging response (ok)
  apiClient.interceptors.response.use(logResponseInterceptor);

  // 4) Manejo de errores + reintento una vez si 401/403
  apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: any) => {
      const axiosErr = error as AxiosError;

      // Reintento básico SOLO una vez para 401/403 intentando renovar token silenciosamente
      const status = axiosErr.response?.status;
      const original = axiosErr.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;

      if ((status === 401 || status === 403) && original && !original._retry) {
        original._retry = true;
        try {
          if (typeof (AuthService as any).ensureInitialized === "function") {
            await (AuthService as any).ensureInitialized();
          }
          const newToken = await AuthService.acquireToken();
          if (newToken) {
            original.headers = {
              ...(original.headers || {}),
              Authorization: `Bearer ${newToken}`,
            };
            return apiClient.request(original);
          }
        } catch {
          // continúa a manejar el error abajo
        }
      }

      // Delegar al manejador común (con toasts/alerts configurables)
      return handleAxiosError(error);
    }
  );
}

attachInterceptorsOnce();

export default apiClient;

// Helper simple y tipado para llamadas
export type ApiCallOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

export async function apiCall<T = any>(
  endpoint: string,
  options?: ApiCallOptions
): Promise<T> {
  const method = options?.method ?? "GET";
  const res = await apiClient.request<T>({
    url: endpoint,
    method,
    data: options?.body,
    params: options?.params,
    headers: options?.headers,
    signal: options?.signal,
  });
  return res.data;
}

// Re-exporta setters para configurar toasts/acciones 401 desde la app
export { setApiErrorHandler, setUnauthorizedHandler };