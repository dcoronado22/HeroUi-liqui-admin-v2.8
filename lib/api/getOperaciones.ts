"use client";

import apiClient from "@/lib/api/client";

export type OperacionApi = {
  id: string;
  idLote: string;
  rfc: string;
  rfcTo: string;
  state: number | string;
  numeroFacturas: number;
  monto: number;       // MXN
  aforo: number;       // 0..1
  diasPlazo: number;   // días
  fechaCreacion: string;
  stateDescription: string;
  idRug: string | null;
  estadoRug: number;
};

export type GetOperacionesResponse = {
  operaciones: OperacionApi[];
  succeeded: boolean;
};

export async function getOperaciones(): Promise<OperacionApi[]> {
  const { data } = await apiClient.post<GetOperacionesResponse>(
    "/admin/Operacion/GetOperaciones",
    {}
  );
  return Array.isArray(data?.operaciones) ? data.operaciones : [];
}