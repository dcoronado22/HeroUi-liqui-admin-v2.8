import { apiCall } from "@/lib/api/client";

export type VinculacionMini = {
  id: string;
  rfc: string;
  nombreContribuyente: string;
};

export type AlianzaApi = {
  id: number;
  aliado: string;
  codigoAlianza: string;
  urlAlianza: string;
  multiplicadorCupo: number; // p. ej. 2.0
  idExpedienteAzul: string;
  aplicaAval: boolean;
  vinculaciones: VinculacionMini[];
  documentosOperacion: number;
};

export async function getAlianzas(): Promise<AlianzaApi[]> {
  const res = await apiCall("/admin/Alianzas/GetAlianzas", {
    method: "POST",
    body: {}, // payload vacío
  });
  return Array.isArray(res?.alianzas) ? (res.alianzas as AlianzaApi[]) : [];
}
