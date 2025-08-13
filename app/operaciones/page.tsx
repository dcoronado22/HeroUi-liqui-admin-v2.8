"use client";

import React from "react";
import { Chip, Tooltip } from "@heroui/react";
import { DynamicTable, renderActions } from "@/components/DynamicTable/DynamicTable";
import { Icon } from "@iconify/react";
import { Dots, fmtPct } from "@/components/DynamicTable/dots";
import { getOperaciones, OperacionApi } from "@/lib/api/getOperaciones";
import OperacionDots from "@/components/DynamicTable/OperacionDots";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/helpers/CurrencyFormatter";
import LogsViewerModal, { LogsViewerModalHandle } from "@/components/Modals/LogModal";
import { getLog, mapDocumentsToGroups, getLogForModal } from "@/lib/api/getLog";
import { all } from "axios";
import { formatDate } from "@/lib/helpers/FormatterDate";

type Row = {
  id: string;
  fechaCreacion: string;
  idLote: string;
  rfc: string;
  rfcTo: string;
  estadoRaw: number | string;
  numeroFacturas: number;
  monto: number;       // MXN
  aforoPct: number;    // 0..100
  diasPlazo: number;
};

const fmtDate = (d: string | Date) =>
  new Intl.DateTimeFormat("es-MX", { dateStyle: "short", timeStyle: "short" }).format(new Date(d));

function OperacionesTable() {
  const columns = [
    { key: "fechaCreacion", label: "Creación" },
    { key: "idLote", label: "Lote" },
    { key: "rfc", label: "RFC emisor" },
    { key: "rfcTo", label: "RFC receptor" },
    { key: "estadoRaw", label: "Estado" },
    { key: "numeroFacturas", label: "Facturas" },
    { key: "monto", label: "Monto" },
    { key: "aforoPct", label: "Aforo" },
    { key: "diasPlazo", label: "Plazo" },
    { key: "opciones", label: "Opciones" },
  ] as const;

  const router = useRouter();
  const modalRef = React.useRef<LogsViewerModalHandle>(null);
  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const ops = await getOperaciones();
        const mapped: Row[] = ops.map((o: OperacionApi) => ({
          id: o.id,
          fechaCreacion: formatDate(o.fechaCreacion),
          idLote: o.idLote,
          rfc: o.rfc,
          rfcTo: o.rfcTo,
          estadoRaw: o.state,
          numeroFacturas: o.numeroFacturas,
          monto: o.monto,
          aforoPct: Math.round((o.aforo ?? 0) * 100),
          diasPlazo: Math.round(o.diasPlazo ?? 0),
        }));
        console.log("Operaciones cargadas1:", mapped);
        setRows(mapped);

      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const fetchLogs = React.useCallback(
    async ({ query, page, pageSize, context }: { query: string; page: number; pageSize: number; context?: any }) => {
      const id = String(context?.id ?? "");
      const { logs } = await getLogForModal({ id, modulo: 2, query, page, pageSize });
      return logs;
    },
    []
  );

  const fetchDocuments = React.useCallback(
    async ({ context }: { context?: any }) => {
      const id = String(context?.id ?? "");
      const raw = await getLog(id, 2);
      return mapDocumentsToGroups(raw);
    },
    []
  );

  const fetchFileText = React.useCallback(async ({ path }: { path: string }) => {
    const url = path.startsWith("/") ? path : `/mock/${path}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("No se pudo cargar el archivo");
    return await res.text();
  }, []);

  React.useEffect(() => {
    if (rows.length > 0) {
      console.log("Estado actualizado de rows:", rows);
    }
  }, [rows]);

  const handleOpenLogs = React.useCallback((row: Row) => {
    // En producción, aquí mapea row.id -> Id/correlationId de tu backend
    modalRef.current?.open({ type: "operacion", id: String(row.id) });
  }, []);

  const cellRenderers: Record<string, (item: Row) => React.ReactNode> = {
    idLote: (item) => (
      <Tooltip content={item.idLote}>
        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/15 text-primary">
          <Icon icon="lucide:info" />
        </span>
      </Tooltip>
    ),
    estadoRaw: (item) => <OperacionDots estado={item.estadoRaw} />, // ← Cambiado de 'estado' a 'estadoRaw'
    numeroFacturas: (item) => (
      <Chip color="primary" variant="flat">
        {item.numeroFacturas === 1 ? "1 factura" : `${item.numeroFacturas} facturas`}
      </Chip>
    ),
    monto: (item) => (
      <Chip variant="flat">{formatCurrency(item.monto)} MXN</Chip>
    ),
    aforoPct: (item) => <Chip variant="flat">{item.aforoPct} %</Chip>,
    diasPlazo: (item) => <Chip variant="flat">{item.diasPlazo} días</Chip>, // ← Cambiado de 'diasPlazo'
    opciones: (item) =>
      renderActions([
        { icon: "fluent:open-32-filled", tooltip: "Ver detalle", onClick: () => console.log("Abrir detalle", item.id) },
        { icon: "heroicons:magnifying-glass-16-solid", tooltip: "Logs", onClick: () => handleOpenLogs(item) },
      ]),
  };

  const columnsWithRenderers = columns.map((col) => ({
    ...col,
    cellRenderer: cellRenderers[col.key as string] ?? undefined,
    allowsSorting: col.key !== "opciones",
  }));

  return (
    <>
      <DynamicTable
        data={rows}
        columns={columnsWithRenderers}
        isLoading={loading}
        allowFiltering
        allowSorting={true}
        allowColumnVisibility
        allowRowSelection={false}
        excludeFromSorting={["actions"]}
        initialVisibleColumns={columns.map((c) => c.key)}
        itemsPerPage={10}
      />

      <LogsViewerModal
        ref={modalRef}
        title="Logs de Operación"
        fetchLogs={fetchLogs as any}
        fetchDocuments={fetchDocuments as any}
        fetchFileText={fetchFileText as any}
      />
    </>
  );
}

export default function OperacionesPage() {
  return (
    <section className="w-full px-5">
      <div className="mt-4 w-full">
        <OperacionesTable />
      </div>
    </section>
  );
}