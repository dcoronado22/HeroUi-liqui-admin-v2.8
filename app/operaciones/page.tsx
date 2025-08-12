"use client";

import React from "react";
import { Tooltip } from "@heroui/react";
import { DynamicTable, renderActions } from "@/components/DynamicTable/DynamicTable";
import { Icon } from "@iconify/react";
import { Dots, fmtPct } from "@/components/DynamicTable/dots";

type Row = {
  id: number;
  creacion: string | Date;
  lote: string;
  loteInfo?: string;
  rfcEmisor: string;
  rfcReceptor: string;
  estadoPct: number;
  facturas: number;
  montoMXN: number;
  aforoPct: number;
  plazoDias: number;
};

const fmtDate = (d: string | Date) =>
  new Intl.DateTimeFormat("es-MX", { dateStyle: "short", timeStyle: "short" }).format(new Date(d));

const fmtMoney = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 }).format(n);

const fmtDias = (n: number) => `${n} días`;

const Pill = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <span
    className={[
      "inline-flex items-center rounded-full bg-default-100/70 dark:bg-default-100/10 px-2 py-1 text-xs text-foreground/80",
      className,
    ].join(" ")}
  >
    {children}
  </span>
);

function OperacionesTable() {
  const columns = [
    { key: "creacion", label: "Creación" },
    { key: "lote", label: "Lote" },
    { key: "rfcEmisor", label: "RFC emisor" },
    { key: "rfcReceptor", label: "RFC receptor" },
    { key: "estadoPct", label: "Estado" },
    { key: "facturas", label: "Facturas" },
    { key: "montoMXN", label: "Monto" },
    { key: "aforoPct", label: "Aforo" },
    { key: "plazoDias", label: "Plazo" },
    { key: "detalle", label: "Detalle" },
  ] as const;

  const data: (Row & { detalle?: null })[] = [
    {
      id: 1, creacion: "2025-08-06T15:42:00", lote: "L-1021", loteInfo: "Lote 1021: carga inicial 08/2025",
      rfcEmisor: "CUP820427I...", rfcReceptor: "AIHA62050...", estadoPct: 60, facturas: 1, montoMXN: 23980, aforoPct: 90, plazoDias: 44,
    },
    {
      id: 2, creacion: "2025-08-05T11:10:00", lote: "L-1019", loteInfo: "Validación en curso",
      rfcEmisor: "BME930112A...", rfcReceptor: "XAXX010101...", estadoPct: 40, facturas: 3, montoMXN: 154320, aforoPct: 85, plazoDias: 30,
    },
    {
      id: 3, creacion: "2025-08-04T09:05:00", lote: "L-1018",
      rfcEmisor: "AAA010101A...", rfcReceptor: "MEL9005129...", estadoPct: 80, facturas: 5, montoMXN: 98750, aforoPct: 75, plazoDias: 60,
    },
    {
      id: 4, creacion: "2025-08-03T17:30:00", lote: "L-1017", loteInfo: "Observaciones del receptor",
      rfcEmisor: "CUP820427I...", rfcReceptor: "GOM850723K...", estadoPct: 20, facturas: 2, montoMXN: 43599, aforoPct: 70, plazoDias: 28,
    },
    {
      id: 5, creacion: "2025-08-02T13:15:00", lote: "L-1016",
      rfcEmisor: "PEP770101S...", rfcReceptor: "AIH0202020...", estadoPct: 100, facturas: 8, montoMXN: 320000, aforoPct: 92, plazoDias: 90,
    },
    {
      id: 6, creacion: "2025-08-01T08:44:00", lote: "L-1015",
      rfcEmisor: "JIM850101K...", rfcReceptor: "MCO700101P...", estadoPct: 10, facturas: 1, montoMXN: 9800, aforoPct: 60, plazoDias: 15,
    },
    {
      id: 7, creacion: "2025-07-30T20:10:00", lote: "L-1014", loteInfo: "Pendiente de timbrado",
      rfcEmisor: "HME800101R...", rfcReceptor: "XEXX010101...", estadoPct: 50, facturas: 4, montoMXN: 120500, aforoPct: 80, plazoDias: 35,
    },
    {
      id: 8, creacion: "2025-07-29T10:22:00", lote: "L-1013",
      rfcEmisor: "AAA010101A...", rfcReceptor: "ROD921231P...", estadoPct: 65, facturas: 6, montoMXN: 210999, aforoPct: 88, plazoDias: 41,
    },
    {
      id: 9, creacion: "2025-07-28T16:05:00", lote: "L-1012",
      rfcEmisor: "MOR750101Q...", rfcReceptor: "AIH0202020...", estadoPct: 33, facturas: 2, montoMXN: 45990, aforoPct: 72, plazoDias: 22,
    },
    {
      id: 10, creacion: "2025-07-27T12:48:00", lote: "L-1011", loteInfo: "Archivo corregido",
      rfcEmisor: "CUP820427I...", rfcReceptor: "AIHA62050...", estadoPct: 76, facturas: 7, montoMXN: 189000, aforoPct: 89, plazoDias: 52,
    },
    {
      id: 11, creacion: "2025-07-26T09:33:00", lote: "L-1010",
      rfcEmisor: "MEL9005129...", rfcReceptor: "GOM850723K...", estadoPct: 57, facturas: 3, montoMXN: 75999, aforoPct: 78, plazoDias: 27,
    },
    {
      id: 12, creacion: "2025-07-25T18:20:00", lote: "L-1009",
      rfcEmisor: "XAXX010101...", rfcReceptor: "AAA010101A...", estadoPct: 90, facturas: 9, montoMXN: 450500, aforoPct: 95, plazoDias: 75,
    },
  ];

  const cellRenderers: Record<string, (row: any) => React.ReactNode> = {
    creacion: (r) => <span className="whitespace-nowrap">{fmtDate(r.creacion)}</span>,
    lote: (r) => (
      <Tooltip content={r?.loteInfo ?? `Lote ${r.lote}`} placement="top" closeDelay={50}>
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/90 text-background">
          <Icon icon="solar:info-circle-line-duotone" color="primary" width={16} height={16} />
        </span>
      </Tooltip>
    ),
    rfcEmisor: (r) => <span className="font-medium">{r.rfcEmisor}</span>,
    rfcReceptor: (r) => <span className="font-medium">{r.rfcReceptor}</span>,
    estadoPct: (r) => <Dots pct={r.estadoPct} />,
    facturas: (r) => <Pill>{r.facturas} factura{r.facturas === 1 ? "" : "s"}</Pill>,
    montoMXN: (r) => <Pill className="tabular-nums">{fmtMoney(r.montoMXN)}</Pill>,
    aforoPct: (r) => <Pill>{fmtPct(r.aforoPct)}</Pill>,
    plazoDias: (r) => <Pill>{fmtDias(r.plazoDias)}</Pill>,
    detalle: () =>
      renderActions([
        { icon: "fluent:open-20-filled", tooltip: "Ver Detalle", onClick: () => console.log("Abrir") },
        { icon: "ph:list-magnifying-glass-light", tooltip: "Ver Log", onClick: () => console.log("Detalle") },
      ]),
  };

  const columnsWithRenderers = columns.map((c) => ({
    ...c,
    cellRenderer: cellRenderers[c.key as string],
    allowsSorting: !["detalle"].includes(c.key as string),
  }));

  return (
    <DynamicTable
      data={data}
      columns={columnsWithRenderers}
      allowFiltering
      allowSorting
      allowColumnVisibility
      allowRowSelection={false}
      initialVisibleColumns={columns.map((c) => c.key)}
      itemsPerPage={10}
    />
  );
}

export default function OperacionesPage() {
  return (
    <section className="w-full">
      <div className="mt-4 w-full">
        <OperacionesTable />
      </div>
    </section>
  );
}