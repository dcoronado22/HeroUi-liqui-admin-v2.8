"use client";

import apiClient from "@/lib/api/client";

export type DashboardPayload = {
  FechaInicio: string;
  FechaFin: string;
};

type VinculacionesMetricas = {
  totalVinculaciones: number;
  vinculacionesCompletadas: number;
  vinculacionesPendientes: number;
  tasaExito: number;
  tiempoPromedioHoras: number;
};

type Vinc_TiempoEstado = {
  diaSemana: string;
  numeroDia: number;
  estadoAnterior: number;
  estadoAnteriorDescripcion: string;
  estadoNuevo: number;
  estadoNuevoDescripcion: string;
  tiempoPromedioHoras: number;
  cantidadTransiciones: number;
};

type Vinc_Tendencia = {
  fecha: string;
  cantidadVinculaciones: number;
  vinculacionesCompletadas: number;
};

type Vinc_Distribucion = {
  estado: number;
  descripcionEstado: string;
  cantidad: number;
  porcentaje: number;
};

type Oper_Metricas = {
  totalOperaciones: number;
  montoTotal: number;
  totalFacturas: number;
  operacionesCompletadas: number;
  tasaExito: number;
  tiempoPromedioHoras: number;
  montoPromedioPorOperacion: number;
};
type Oper_Tendencia = {
  fecha: string;
  cantidadOperaciones: number;
  montoTotal: number;
  totalFacturas: number;
  operacionesCompletadas: number;
};
type Oper_Distribucion = {
  estado: number;
  descripcionEstado: string;
  cantidad: number;
  porcentaje: number;
  montoTotal: number;
};
type Oper_ValorPorDia = {
  fecha: string;
  montoTotal: number;
  montoPromedio: number;
  cantidadOperaciones: number;
  totalFacturas: number;
};
type Oper_PatronesDia = {
  diaSemana: string;
  numeroDia: number;
  cantidadOperaciones: number;
  montoTotal: number;
  montoPromedio: number;
  totalFacturas: number;
};

export type RawDashboardResponse = {
  fechaInicio: string;
  fechaFin: string;
  vinculaciones: {
    metricas: VinculacionesMetricas;
    tiemposPorEstado: Vinc_TiempoEstado[];
    tendencia: Vinc_Tendencia[];
    distribucionEstados: Vinc_Distribucion[];
  };
  operaciones: {
    metricas: Oper_Metricas;
    tiemposPorEstado: unknown[];
    tendencia: Oper_Tendencia[];
    distribucionEstados: Oper_Distribucion[];
    valorPorDia: Oper_ValorPorDia[];
    patronesDiaSemana: Oper_PatronesDia[];
  };
  succeeded: boolean;
};

const PATH = "/admin/ConsultarDashboardAnalitico";

export async function getDashboardAnalitico(payload: DashboardPayload, opts?: { signal?: AbortSignal }) {
  const { data } = await apiClient.post<RawDashboardResponse>(PATH, payload, { signal: opts?.signal });
  return data;
}