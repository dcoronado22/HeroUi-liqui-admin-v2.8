"use client";

import { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import { AuthService } from "@liquicapital/common";

export async function attachAuthTokenRequestInterceptor(
  config: InternalAxiosRequestConfig
) {
  // Asegura MSAL inicializado (idempotente)
  if (typeof (AuthService as any).ensureInitialized === "function") {
    await (AuthService as any).ensureInitialized();
  }

  // Normaliza headers a AxiosHeaders
  if (!config.headers) {
    config.headers = new AxiosHeaders();
  } else if (!(config.headers instanceof AxiosHeaders)) {
    // Si viene como objeto plano, envuélvelo en AxiosHeaders para tener métodos set/get/has
    config.headers = new AxiosHeaders(config.headers);
  }

  // Solo setea si no existe ya
  const headers = config.headers as AxiosHeaders;
  if (!headers.has("Authorization")) {
    const token = await AuthService.acquireToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  return config;
}