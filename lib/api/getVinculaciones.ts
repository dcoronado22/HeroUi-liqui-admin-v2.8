"use client";

import apiClient from "@/lib/api/client";

export type VinculacionApi = {
  id: string;
  rfc: string;
  state: string | number;
  fechaCreacion: string;
  fechaModificacion: string;
  nombreContribuyente: string;
  tipoContribuyente: number;
  email: string;
  fechaClaveCiec: string;
};

type VinculacionesResponse = {
  vinculaciones: VinculacionApi[];
  succeeded: boolean;
};

export async function getVinculaciones(): Promise<VinculacionApi[]> {
  const { data } = await apiClient.post<VinculacionesResponse>(
    "/admin/Vinculacion/GetVinculaciones",
    {}
  );
  return Array.isArray(data?.vinculaciones) ? data.vinculaciones : [];
}