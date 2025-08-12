"use client";
import BarDivergingGraph, { DivergingBarCardItem } from "@/components/Graphs/BarDivergingGraph";
import BarGraph, { BarCardItem } from "@/components/Graphs/BarGraph";
import BarsLateralGraph, { LateralBarCardItem } from "@/components/Graphs/BarsLateralGraph";
import DonutGraph, { DonutCardItem } from "@/components/Graphs/DonutGraph";
import GraphDual, { GraphDualProps } from "@/components/Graphs/DualGraph";
import HeatmapHero, { HeatmapDatum } from "@/components/Graphs/HeatMap";
import KPIStatBarCard, { KPIStatItem } from "@/components/KPIs/KPIStatBarCard";
import KPIStatCard from "@/components/KPIs/KPIStatCard";
import { Card, Tab, tabs, Tabs } from "@heroui/react";
// import { Card } from "@heroui/react";
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

const itemsBarLateral: LateralBarCardItem[] = [
  {
    key: "energy",
    title: "Avg. Energy Activity",
    value: "580/280",
    unit: "kcal",
    categories: ["Low", "Medium", "High"],
    color: "default",
    chartData: [
      { weekday: "Mon", Low: 120, Medium: 280, High: 180 },
      { weekday: "Tue", Low: 150, Medium: 320, High: 220 },
      // ...
    ],
  },
];

const itemsBarDiverging: DivergingBarCardItem[] = [
  {
    key: "expenses",
    title: "Monthly Expenses",
    value: "$5,420",
    unit: "avg",
    categories: ["Expenses", "Savings"],
    color: "default",
    chartData: [
      { month: "Jan", Expenses: 1340, Savings: -1340 },
      { month: "Feb", Expenses: 450, Savings: -750 },
      // ...
    ],
  },
];

const sampleData: HeatmapDatum[] = [
  { x: "L", y: "1", value: 3 },
  { x: "M", y: "1", value: 8 },
  { x: "M", y: "2", value: 2 },
  { x: "J", y: "3", value: 6 },
  { x: "V", y: "5", value: 1 },
  { x: "S", y: "7", value: 0 },
  { x: "D", y: "8", value: 4 },
  // agrega más para ver la grilla completa
];

const itemsBar: BarCardItem[] = [
  {
    key: "energy",
    title: "Avg. Energy Activity",
    value: "580/280",
    unit: "kcal",
    categories: ["Low", "Medium", "High"],
    color: "primary",
    chartData: [
      { weekday: "Mon", Low: 120, Medium: 280, High: 180 },
      { weekday: "Tue", Low: 150, Medium: 320, High: 220 },
      // ...
    ],
  },
];

const xDom = ["L", "M", "M", "J", "V", "S", "D"] as const; // ejemplo (puedes inferir)
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

const items: DonutCardItem[] = [
  {
    key: "traffic",
    title: "Traffic Sources",
    total: 224000,
    unit: "Visitors",
    categories: ["Search", "Direct", "Social", "Referral"],
    color: "primary",
    chartData: [
      { name: "Search", value: 400 },
      { name: "Direct", value: 300 },
      { name: "Social", value: 300 },
      { name: "Referral", value: 200 },
    ],
  },
];

export default function HomePage() {
  return (
    <>
      {/* KPIs en 3 columnas */}
      <div className="grid w-full  grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
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
        <div className="md:col-span-2 md:row-span-2 h-full">
          <div className="h-full">
            <GraphDual
              items={[
                {
                  key: "unique-visitors",
                  title: "Unique Visitors",
                  suffix: "visitors",
                  value: 147000,
                  type: "number",
                  change: "12.8%",
                  changeType: "positive",
                  chartData: [
                    { month: "Jan", value: 98000, lastYearValue: 43500 },
                    { month: "Feb", value: 125000, lastYearValue: 38500 },
                    { month: "Mar", value: 89000, lastYearValue: 58300 },
                    { month: "Apr", value: 156000, lastYearValue: 35300 },
                    { month: "May", value: 112000, lastYearValue: 89600 },
                    { month: "Jun", value: 167000, lastYearValue: 56400 },
                    { month: "Jul", value: 138000, lastYearValue: 45200 },
                    { month: "Aug", value: 178000, lastYearValue: 84600 },
                    { month: "Sep", value: 129000, lastYearValue: 73500 },
                    { month: "Oct", value: 159000, lastYearValue: 65900 },
                    { month: "Nov", value: 147000, lastYearValue: 82300 },
                    { month: "Dec", value: 127000, lastYearValue: 95000 },
                  ],
                },
                {
                  key: "unique-visitors-2",
                  title: "Unique Visitors",
                  suffix: "visitors",
                  value: 147000,
                  type: "number",
                  change: "12.8%",
                  changeType: "positive",
                  chartData: [
                    { month: "Jan", value: 98000, lastYearValue: 43500 },
                    { month: "Feb", value: 125000, lastYearValue: 38500 },
                    { month: "Mar", value: 89000, lastYearValue: 58300 },
                    { month: "Apr", value: 156000, lastYearValue: 35300 },
                    { month: "May", value: 112000, lastYearValue: 89600 },
                    { month: "Jun", value: 167000, lastYearValue: 56400 },
                    { month: "Jul", value: 138000, lastYearValue: 45200 },
                    { month: "Aug", value: 178000, lastYearValue: 84600 },
                    { month: "Sep", value: 129000, lastYearValue: 73500 },
                    { month: "Oct", value: 159000, lastYearValue: 65900 },
                    { month: "Nov", value: 147000, lastYearValue: 82300 },
                    { month: "Dec", value: 127000, lastYearValue: 95000 },
                  ],
                },
              ]}
              colors={{ positive: "success", negative: "danger", neutral: "default", comparison: "default-400" }}
              showComparison
            />
          </div>
        </div>
        <div className="md:col-span-1 md:row-span-2 grid grid-rows-2 gap-5 h-full">
          <div className="h-full">
            <DonutGraph items={items} singleMode={true} gridClassName="grid w-full grid-cols-1" />
          </div>
          <div className="h-full">
            <HeatmapHero
              data={sampleData}
              xDomain={xDom as any}
              yDomain={yDom as any}
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
            {/* <DonutGraph items={items} singleMode={true} gridClassName="grid w-full grid-cols-1" /> */}
          </div>
        </div>
        <div className="md:col-span-1 md:row-span-2 grid grid-rows-2 gap-5 h-full">
          <div className="h-full">
            {/* <DonutGraph items={items} singleMode={true} gridClassName="grid w-full grid-cols-1" donutHeight="100%" /> */}
            <BarDivergingGraph singleMode={true} items={itemsBarDiverging} />
          </div>
          <div className="h-full">
            <BarsLateralGraph singleMode={true} items={itemsBarLateral} />
            {/* <BarGraph items={itemsBar} singleMode={true} gridClassName="grid w-full grid-cols-1" /> */}
            {/* <HeatmapHero
              data={sampleData}
              xDomain={xDom as any}
              yDomain={yDom as any}
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
            // width y height omitidos -> usa ResizeObserver para ocupar el contenedor (100% x 380px)
            /> */}
          </div>
        </div>
        <div className="md:col-span-2 md:row-span-2 h-full">
          <div className="h-full">
            <BarGraph items={itemsBar} singleMode={true} gridClassName="grid w-full grid-cols-1" />
          </div>
        </div>
      </div>
    </>
  );
}
