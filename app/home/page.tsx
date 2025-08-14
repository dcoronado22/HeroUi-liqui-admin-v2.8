"use client";
import BarDivergingGraph, { DivergingBarCardItem } from "@/components/Graphs/BarDivergingGraph";
import BarGraph, { BarCardItem } from "@/components/Graphs/BarGraph";
import DonutGraph, { DonutCardItem } from "@/components/Graphs/DonutGraph";
import GraphDual, { GraphDualProps } from "@/components/Graphs/DualGraph";
import HeatmapHero from "@/components/Graphs/HeatMap";
import KPIStatBarCard, { KPIStatItem } from "@/components/KPIs/KPIStatBarCard";
import KPIStatCard from "@/components/KPIs/KPIStatCard";
import { getDashboardAnalitico, type DashboardPayload, type RawDashboardResponse } from "@/lib/api/getDashboardAnalitico";
import { buildBarOperValorPorDia, buildDivergingOperTendencia, buildDonutOperEstados, buildDonutVincEstados, buildGraphDualProps, buildHeatmapVinculaciones } from "@/lib/transformers/dashboardBindings";
import { Card, Skeleton } from "@heroui/react";
import React from "react";

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

const xDom = ["L", "M", "M", "J", "V", "S", "D"] as const;
const yDom = ["1", "2", "3", "4", "5", "6", "7", "8"] as const;


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
  }
];

export default function HomePage() {
  const [data, setData] = React.useState<RawDashboardResponse | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const ac = new AbortController();

    // Rango por defecto: últimos 12 meses en -05:00
    const now = new Date();
    const end = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate()
    ).padStart(2, "0")}T23:59:59-05:00`;
    const startDate = new Date(now);
    startDate.setFullYear(now.getFullYear() - 1);
    const start = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}-${String(
      startDate.getDate()
    ).padStart(2, "0")}T00:00:00-05:00`;

    const payload: DashboardPayload = { FechaInicio: start, FechaFin: end };

    (async () => {
      try {
        setLoading(true);
        const resp = await getDashboardAnalitico(payload, { signal: ac.signal });
        setData(resp);
      } catch (e: any) {
        setError(e?.message ?? "Error cargando dashboard");
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, []);

  // Props para componentes (solo cuando haya data)
  const graphDualProps: GraphDualProps | null = data ? buildGraphDualProps(data) : null;
  const donutVinc: DonutCardItem[] = data ? buildDonutVincEstados(data) : [];
  const donutOper: DonutCardItem[] = data ? buildDonutOperEstados(data) : [];
  const diverging: DivergingBarCardItem[] = data ? buildDivergingOperTendencia(data) : [];
  const barOper: BarCardItem[] = data ? buildBarOperValorPorDia(data) : [];
  const heat = data ? buildHeatmapVinculaciones(data) : null;


  return (
    <>
      {/* KPIs en 3 columnas (sin tocar) */}
      <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
        {cardsKPI.map((c, i) => (
          <KPIStatCard
            key={i}
            title={c.title}
            subtitle={c.subtitle}
            value={c.value}
            change={c.change}
            color={c.color}
            data={c.data}
            xKey={c.xKey}
            yKey={c.yKey}
            cta={{
              label: "Ver detalle",
              onClick: () => console.log("Detalle"),
              icon: "solar:document-linear",
              variant: "flat",
              size: "sm",
            }}
            actions={[
              { key: "view", label: "Ver detalles", icon: "solar:document-linear" },
              { key: "export", label: "Exportar", icon: "solar:download-linear" },
            ]}
          />
        ))}
        <KPIStatBarCard singleMode items={itemsCard} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3 md:auto-rows-[minmax(0,1fr)] md:min-h-[720px]">
        {/* IZQ: GraphDual grande */}
        <div className="md:col-span-2 md:row-span-2 h-full">
          <div className="h-full">
            {graphDualProps ? (
              <GraphDual {...graphDualProps} loading={loading} />
            ) : (
              <Card className="h-full p-6">
                <Skeleton className="h-8 w-64 rounded mb-4" />
                <Skeleton className="h-8 w-full rounded mb-2" />
                <Skeleton className="h-[300px] w-full rounded" />
              </Card>
            )}
          </div>
        </div>

        {/* DER: superior -> Donut de VINC (distribuciónEstados) */}
        <div className="md:col-span-1 md:row-span-2 grid grid-rows-2 gap-5 h-full">
          <div className="h-full">
            {donutVinc.length ? (
              <DonutGraph items={donutVinc} singleMode gridClassName="grid w-full grid-cols-1" />
            ) : (
              <Card className="h-full p-6"><Skeleton className="h-full w-full rounded" /></Card>
            )}
          </div>

          {/* DER: inferior -> Heatmap (lo dejas como lo tenías) */}
          <div className="h-full">
            <HeatmapHero
              data={heat?.data ?? []}
              xDomain={heat?.xDomain as any}
              yDomain={heat?.yDomain as any}
              a11yTitle="Tiempos por Transición (Horas)"
              tooltip={(d) => (
                <div className="text-tiny">
                  <b>{String(d.x)}</b> / <b>{String(d.y)}</b>
                  <div className="text-default-500">Valor: {d.value}</div>
                </div>
              )}
              valueFormatter={(v) => `${v} h`}
              legend={{ show: true, position: "bottom" }}
              onCellClick={(d) => console.log("cell:", d)}
            />
          </div>
        </div>

        {/* COL 3: arriba -> BarDiverging (operaciones.tendencia: montoTotal vs totalFacturas) */}
        <div className="md:col-span-1 md:row-span-2 grid grid-rows-2 gap-5 h-full">
          <div className="h-full">
            {diverging.length ? (
              <BarDivergingGraph singleMode items={diverging} />
            ) : (
              <Card className="h-full p-6"><Skeleton className="h-full w-full rounded" /></Card>
            )}
          </div>

          {/* COL 3: abajo -> REEMPLAZA BarsLateralGraph por Donut de operaciones.distribucionEstados */}
          <div className="h-full">
            {donutOper.length ? (
              <DonutGraph items={donutOper} singleMode gridClassName="grid w-full grid-cols-1" />
            ) : (
              <Card className="h-full p-6"><Skeleton className="h-full w-full rounded" /></Card>
            )}
          </div>
        </div>

        {/* ABAJO ANCHO: BarGraph => operaciones.valorPorDia */}
        <div className="md:col-span-2 md:row-span-2 h-full">
          <div className="h-full">
            {barOper.length ? (
              <BarGraph items={barOper} singleMode gridClassName="grid w-full grid-cols-1" />
            ) : (
              <Card className="h-full p-6"><Skeleton className="h-[320px] w-full rounded" /></Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}