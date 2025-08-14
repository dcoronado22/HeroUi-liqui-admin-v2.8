// lib/api/valideDocsRazonesFinancieras.ts
import axios from "axios";
import { apiCall } from "./client";

export type RazonesDocsFlags = {
  hasRecentDocuments: boolean;
  hasHistoricalDocuments: boolean;
};

type Arg = { id: string; rfc: string } | [string, string];

export async function valideDocsRazonesFinancieras(
  arg: Arg
): Promise<RazonesDocsFlags> {
  const payload = Array.isArray(arg) ? { id: arg[0], rfc: arg[1] } : arg;

  const res = await apiCall("vinculaciones/ValideDocsRazonesFinancieras", {
    method: "POST",
    body: payload,
  });

  return {
    hasRecentDocuments: Boolean(res?.hasRecentDocuments),
    hasHistoricalDocuments: Boolean(res?.hasHistoricalDocuments),
  };
}
