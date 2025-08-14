import type { RawDashboardResponse } from "@/lib/api/getDashboardAnalitico";
import type { GraphDualProps, ChangeType } from "@/components/Graphs/DualGraph";
import type { DonutCardItem } from "@/components/Graphs/DonutGraph";
import type { DivergingBarCardItem } from "@/components/Graphs/BarDivergingGraph";
import type { BarCardItem } from "@/components/Graphs/BarGraph";

const formatDayMonth = (iso: string) => {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}`;
};

const calcDeltaPercent = (arr: number[]) => {
  if (!arr.length) return { text: "0%", type: "neutral" as const };
  const last = arr[arr.length - 1] ?? 0;
  const prev = arr[arr.length - 2] ?? 0;
  if (prev === 0) return { text: `${last === 0 ? 0 : 100}%`, type: last > 0 ? "positive" : "neutral" as const };
  const p = ((last - prev) / prev) * 100;
  return { text: `${p > 0 ? "+" : ""}${p.toFixed(1)}%`, type: p > 0 ? "positive" : p < 0 ? "negative" : "neutral" as const };
};

export function buildGraphDualProps(resp: RawDashboardResponse): GraphDualProps {
  const vT = resp.vinculaciones.tendencia ?? [];
  const oT = resp.operaciones.tendencia ?? [];

  const vincSeries = vT.map((x) => ({
    month: formatDayMonth(x.fecha),
    value: x.cantidadVinculaciones,
    lastYearValue: x.vinculacionesCompletadas,
  }));
  const operSeries = oT.map((x) => ({
    month: formatDayMonth(x.fecha),
    value: x.cantidadOperaciones,
    lastYearValue: x.operacionesCompletadas,
  }));

  const vDelta = calcDeltaPercent(vincSeries.map((s) => s.value));
  const oDelta = calcDeltaPercent(operSeries.map((s) => s.value));

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

export function buildDonutOperEstados(resp: RawDashboardResponse): DonutCardItem[] {
  const dist = resp.operaciones.distribucionEstados ?? [];
  return [
    {
      key: "ops-states",
      title: "Operaciones por estado",
      total: dist.reduce((s, x) => s + (x.cantidad ?? 0), 0),
      unit: "Operaciones",
      categories: dist.map((d) => d.descripcionEstado),
      color: "primary",
      chartData: dist.map((d) => ({ name: d.descripcionEstado, value: d.cantidad })),
    },
  ];
}

export function buildDivergingOperTendencia(resp: RawDashboardResponse): DivergingBarCardItem[] {
  const t = resp.operaciones.tendencia ?? [];
  return [
    {
      key: "ops-monto-vs-facturas",
      title: "Operaciones: monto total vs total de facturas",
      value: `${(resp.operaciones.metricas?.montoTotal ?? 0).toLocaleString()}`,
      unit: "",
      categories: ["Monto Total", "Total Facturas"],
      color: "primary",
      chartData: t.map((x) => ({
        month: formatDayMonth(x.fecha),
        "Monto Total": Math.round(x.montoTotal ?? 0),
        "Total Facturas": -(x.totalFacturas ?? 0),
      })),
    },
  ];
}

export function buildBarOperValorPorDia(resp: RawDashboardResponse): BarCardItem[] {
  const rows = resp.operaciones.valorPorDia ?? [];
  return [
    {
      key: "ops-valor-dia",
      title: "Operaciones por día (monto)",
      value: `$${(resp.operaciones.metricas?.montoTotal ?? 0).toLocaleString()}`,
      unit: "MXN",
      categories: ["CantidadOperaciones", "MontoPromedio", "MontoTotal"],
      color: "primary",
      chartData: rows.map((d) => ({
        weekday: formatDayMonth(d.fecha),
        MontoTotal: Math.round(d.montoTotal ?? 0),
        MontoPromedio: Math.round(d.montoPromedio ?? 0),
        CantidadOperaciones: d.cantidadOperaciones ?? 0,
      })),
    },
  ];
}

type HeatMapBind = { data: HeatmapDatum[]; xDomain: string[]; yDomain: string[] };

export function buildHeatmapVinculaciones(resp: RawDashboardResponse): HeatMapBind {
    const rows = resp.vinculaciones.tiemposPorEstado ?? [];
    console.log("Heatmap rows:", rows);
    const xDomain = Array.from(new Set(rows.map(r => r.estadoAnteriorDescripcion)));
    const yDomain = Array.from(new Set(rows.map(r => r.estadoNuevoDescripcion)));
    const data: HeatmapDatum[] = rows.map(r => ({
      x: r.estadoAnteriorDescripcion,
      y: r.estadoNuevoDescripcion,
      value: Number(r.tiempoPromedioHoras ?? 0),
    }));
    return { data, xDomain, yDomain };
  }
  
export type HeatmapDatum = { x: string | number; y: string | number; value: number };
