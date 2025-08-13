"use client";

import React from "react";
import apiClient from "@/lib/api/client";

import GraphDual, { ChangeType, GraphDualProps } from "@/components/Graphs/DualGraph";
import DonutGraph, { DonutCardItem } from "@/components/Graphs/DonutGraph";
import HeatmapHero, { HeatmapDatum } from "@/components/Graphs/HeatMap";
import BarDivergingGraph, { DivergingBarCardItem } from "@/components/Graphs/BarDivergingGraph";
import BarGraph, { BarCardItem } from "@/components/Graphs/BarGraph";
import KPIStatCard from "@/components/KPIs/KPIStatCard";
import KPIStatBarCard, { KPIStatItem } from "@/components/KPIs/KPIStatBarCard";

import { Card, Skeleton } from "@heroui/react";

// =====================================================================================
// TIPOS RAW DEL BACKEND
// =====================================================================================
export type DashboardPayload = {
  FechaInicio: string; // "2024-08-12T00:00:00-05:00"
  FechaFin: string;    // "2025-08-12T23:59:59-05:00"
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

// =====================================================================================
// FETCH
// =====================================================================================
const PATH = "/admin/ConsultarDashboardAnalitico";

export async function getDashboardAnalitico(payload: DashboardPayload, opts?: { signal?: AbortSignal }) {
  const { data } = await apiClient.post<RawDashboardResponse>(PATH, payload, { signal: opts?.signal });
  return data;
}

// =====================================================================================
// HELPERS
// =====================================================================================
const fmtDM = (iso: string) => {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}`;
};
const calcDeltaPct = (arr: number[]) => {
  if (!arr.length) return { text: "0%", type: "neutral" as const };
  const last = arr[arr.length - 1] ?? 0;
  const prev = arr[arr.length - 2] ?? 0;
  if (prev === 0) return { text: `${last === 0 ? 0 : 100}%`, type: last > 0 ? "positive" : "neutral" as const };
  const p = ((last - prev) / prev) * 100;
  return { text: `${p > 0 ? "+" : ""}${p.toFixed(1)}%`, type: p > 0 ? "positive" : p < 0 ? "negative" : "neutral" as const };
};

// =====================================================================================
// ADAPTERS A TUS COMPONENTES (según lo que pediste)
// =====================================================================================

// 1) GraphDual: título y tabs + series:
//   - Tab 1: totalVinculaciones vs vinculacionesCompletadas (vinculaciones.tendencia)
//   - Tab 2: totalOperaciones vs operacionesCompletadas (operaciones.tendencia)
export function buildGraphDualProps(resp: RawDashboardResponse): GraphDualProps {
  const vT = resp.vinculaciones.tendencia ?? [];
  const oT = resp.operaciones.tendencia ?? [];

  const vincSeries = vT.map((x) => ({
    month: fmtDM(x.fecha),
    value: x.cantidadVinculaciones,
    lastYearValue: x.vinculacionesCompletadas,
  }));
  const operSeries = oT.map((x) => ({
    month: fmtDM(x.fecha),
    value: x.cantidadOperaciones,
    lastYearValue: x.operacionesCompletadas,
  }));

  const vDelta = calcDeltaPct(vincSeries.map((s) => s.value));
  const oDelta = calcDeltaPct(operSeries.map((s) => s.value));

  return {
    title: "Tendencia Vinculaciones y operaciones",
    items: [
      {
        key: "vinc",
        title: "Vinculaciones",
        value: vincSeries.at(-1)?.value ?? 0,
        suffix: "",
        type: "number",
        change: vDelta.text,
        changeType: vDelta.type as ChangeType,
        chartData: vincSeries,
      },
      {
        key: "oper",
        title: "Operaciones",
        value: operSeries.at(-1)?.value ?? 0,
        suffix: "",
        type: "number",
        change: oDelta.text,
        changeType: oDelta.type as ChangeType,
        chartData: operSeries,
      },
    ],
    initialActiveKey: "vinc",
    showComparison: true,
    isTabsVisible: false,
  };
}

// 2) Donut (primer DonutCard): vinculaciones.distribucionEstados
export function buildDonutVincEstados(resp: RawDashboardResponse): DonutCardItem[] {
  const dist = resp.vinculaciones.distribucionEstados ?? [];
  return [
    {
      key: "vinc-states",
      title: "Vinculaciones por estado",
      total: dist.reduce((s, x) => s + (x.cantidad ?? 0), 0),
      unit: "Vinculaciones",
      categories: dist.map((d) => d.descripcionEstado),
      color: "primary",
      chartData: dist.map((d) => ({ name: d.descripcionEstado, value: d.cantidad })),
    },
  ];
}

// 3) Donut (reemplaza BarsLateralGraph): operaciones.distribucionEstados
export function buildDonutOperEstados(resp: RawDashboardResponse): DonutCardItem[] {
  const dist = resp.operaciones.distribucionEstados ?? [];
  return [
    {
      key: "ops-states",
      title: "Operaciones por estado",
      total: dist.reduce((s, x) => s + (x.cantidad ?? 0), 0),
      unit: "Operaciones",
      categories: dist.map((d) => d.descripcionEstado),
      color: "default",
      chartData: dist.map((d) => ({ name: d.descripcionEstado, value: d.cantidad })),
    },
  ];
}

// 4) BarDivergingGraph: operaciones.tendencia de montoTotal vs totalFacturas
export function buildDivergingOperTendencia(resp: RawDashboardResponse): DivergingBarCardItem[] {
  const t = resp.operaciones.tendencia ?? [];
  return [
    {
      key: "ops-monto-vs-facturas",
      title: "Operaciones: monto total vs total de facturas",
      value: `${(resp.operaciones.metricas?.montoTotal ?? 0).toLocaleString()}`,
      unit: "",
      categories: ["Monto Total", "Total Facturas"],
      color: "default",
      chartData: t.map((x) => ({
        month: fmtDM(x.fecha),
        "Monto Total": Math.round(x.montoTotal ?? 0),
        "Total Facturas": -(x.totalFacturas ?? 0), // negativo para divergir
      })),
    },
  ];
}

// 5) BarGraph: operaciones.valorPorDia
export function buildBarOperValorPorDia(resp: RawDashboardResponse): BarCardItem[] {
  const rows = resp.operaciones.valorPorDia ?? [];
  return [
    {
      key: "ops-valor-dia",
      title: "Operaciones por día (monto)",
      value: `$${(resp.operaciones.metricas?.montoTotal ?? 0).toLocaleString()}`,
      unit: "Monto",
      categories: ["Monto"],
      color: "primary",
      chartData: rows.map((d) => ({
        weekday: fmtDM(d.fecha), // este comp usa 'weekday' en los ejemplos
        Monto: Math.round(d.montoTotal ?? 0),
      })),
    },
  ];
}

// =====================================================================================
// MOCKS de KPIs y Heatmap (tú ya los tenías). Los dejo igual.
// =====================================================================================
const cardsKPI = [
  {
    title: "ABNB",
    subtitle: "Airbnb, Inc.",
    value: "$137,34",
    data: [
      { month: "January", value: 120 },
      { month: "February", value: 126 },
      { month: "March", value: 123 },
      { month: "April", value: 130 },
      { month: "May", value: 133 },
      { month: "June", value: 128 },
      { month: "July", value: 125 },
      { month: "August", value: 132 },
      { month: "September", value: 135 },
      { month: "October", value: 134 },
      { month: "November", value: 136 },
    ],
    change: "0.3%",
    color: "warning" as const,
  },
  {
    title: "S&P 500",
    subtitle: "Standard & Poor's 500",
    value: "$5,969.51",
    data: [
      { month: "January", value: 4850 },
      { month: "February", value: 4790 },
      { month: "March", value: 4920 },
      { month: "April", value: 4880 },
      { month: "May", value: 4950 },
      { month: "June", value: 4890 },
      { month: "July", value: 4970 },
      { month: "August", value: 200 },
      { month: "September", value: 5010 },
      { month: "October", value: 4980 },
      { month: "November", value: 1000 },
    ],
    change: -1.2,
    color: "danger" as const,
    xKey: "month" as const,
    yKey: "value" as const,
  },
];

const itemsCard: KPIStatItem[] = [
  {
    key: "revenue",
    title: "Total Revenue",
    value: "$228k",
    change: "3%",
    changeType: "positive",
    trendChipPosition: "bottom",
    chartData: [
      { weekday: "Mo", value: 13200 },
      { weekday: "Tu", value: 8800 },
      { weekday: "We", value: 9441 },
      { weekday: "Th", value: 12300 },
      { weekday: "Fr", value: 16400 },
      { weekday: "Sa", value: 14000 },
      { weekday: "Su", value: 11300 },
    ],
  },
];

export const heatmapSample: HeatmapDatum[] = [
  { x: "L", y: "1", value: 3 },
  { x: "M", y: "1", value: 8 },
  { x: "M", y: "2", value: 2 },
  { x: "J", y: "3", value: 6 },
  { x: "V", y: "5", value: 1 },
  { x: "S", y: "7", value: 0 },
  { x: "D", y: "8", value: 4 },
];
const xDom = ["L", "M", "M", "J", "V", "S", "D"] as const;
const yDom = ["1", "2", "3", "4", "5", "6", "7", "8"] as const;