"use client";

import React from "react";
import { DynamicTable, renderChip, renderActions } from "@/components/DynamicTable/DynamicTable";
import { useRouter } from "next/navigation";
import LogsViewerModal, { LogsViewerModalHandle } from "@/components/Modals/LogModal";
import { getLog, getLogForModal, mapDocumentsToGroups } from "@/lib/api/getLog";
import { getVinculaciones, VinculacionApi } from "@/lib/api/getVinculaciones";
import { stateToUI } from "@/models/vinculacionEstado";
import { EstadoDots } from "@/components/DynamicTable/dots";
import { formatDate } from "@/lib/helpers/FormatterDate";

type Row = {
  id: string;
  rfc: string;
  razonSocial: string;
  estadoRaw: string | number;   // <- viene del API
  estadoLabel?: string;         // <- opcional para filtro
  email: string;
  fechaCreacion: string;
  fechaClaveCiec: string;
};



function VinculacionesTable() {
  const router = useRouter();
  const modalRef = React.useRef<LogsViewerModalHandle>(null);
  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(true);

  const columns = [
    { key: "rfc", label: "RFC" },
    { key: "razonSocial", label: "Razón Social" },
    { key: "estado", label: "Estado" },
    { key: "email", label: "Email" },
    { key: "fechaCreacion", label: "Fecha Creación" },
    { key: "fechaClaveCiec", label: "Fecha Clave Ciec" },
    { key: "opciones", label: "Opciones" },
  ] as const;

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const apiItems = await getVinculaciones();
        if (!alive) return;
        const mapped: Row[] = apiItems.map((v) => {
          const ui = stateToUI(v.state);
          return {
            id: v.id,
            rfc: v.rfc,
            razonSocial: v.nombreContribuyente?.trim() || "",
            estadoRaw: v.state,
            estadoLabel: ui.label,
            email: v.email,
            fechaCreacion: formatDate(v.fechaCreacion),
            fechaClaveCiec: formatDate(v.fechaClaveCiec),
          };
        });
        setRows(mapped);
      } catch (err) {
        console.error("Error cargando vinculaciones:", err);
        setRows([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const handleVerDetalle = (item: Row) => router.push(`/vinculaciones/${item.rfc}/${item.id}`);

  const cellRenderers: Record<string, (item: any) => React.ReactNode> = {
    estado: (item: Row) => <EstadoDots estado={item.estadoRaw} />,
    opciones: (item: Row) =>
      renderActions([
        { icon: "fluent:open-32-filled", tooltip: "Ver Detalles", onClick: () => handleVerDetalle(item) },
        { icon: "heroicons:magnifying-glass-16-solid", tooltip: "Logs", onClick: () => handleOpenLogs(item) },
      ]),
  };

  const columnsWithRenderers = columns.map((col) => ({
    ...col,
    cellRenderer: cellRenderers[col.key as string] ?? undefined,
    allowsSorting: col.key !== "opciones",
  }));

  // Consumo logs

  const handleOpenLogs = React.useCallback((row: Row) => {
    // En producción, aquí mapea row.id -> Id/correlationId de tu backend
    modalRef.current?.open({ type: "vinculacion", id: String(row.id) });
  }, []);

  const fetchLogs = React.useCallback(
    async ({ query, page, pageSize, context }: { query: string; page: number; pageSize: number; context?: any }) => {
      const id = String(context?.id ?? "");
      const { logs } = await getLogForModal({ id, modulo: 1, query, page, pageSize });
      return logs;
    },
    []
  );

  const fetchDocuments = React.useCallback(
    async ({ context }: { context?: any }) => {
      const id = String(context?.id ?? "");
      const raw = await getLog(id, 1);
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

  return (
    <>
      <DynamicTable
        data={rows}
        columns={columnsWithRenderers}
        allowFiltering={true}
        allowSorting={true}
        allowColumnVisibility={true}
        allowRowSelection={false}
        initialVisibleColumns={["rfc", "razonSocial", "estado", "email", "fechaCreacion", "fechaClaveCiec", "opciones"]}
        excludeFromSorting={["actions"]}
        filterableColumns={["name", "role", "team", "status"]}
        itemsPerPage={10}
        isLoading={loading}
      />

      <LogsViewerModal
        ref={modalRef}
        title="Logs de Vinculación"
        fetchLogs={fetchLogs as any}
        fetchDocuments={fetchDocuments as any}
        fetchFileText={fetchFileText as any}
      />
    </>
  );
}

export default function VinculacionesPage() {

  return (
    <section className="w-full px-5">
      <div className="mt-4 w-full">
        <VinculacionesTable />
      </div>
    </section>
  );
}
