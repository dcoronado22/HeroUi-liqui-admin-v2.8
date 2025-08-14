"use client";

import React from "react";
import { DynamicTable, renderActions } from "@/components/DynamicTable/DynamicTable";
import { useRouter } from "next/navigation";
import { getEmpresas, EmpresaApi } from "@/lib/api/getEmpresas";
import { Tooltip } from "@heroui/react";

// Helper de fecha (puedes usar tu formatDate si lo prefieres)
const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("es-MX", { dateStyle: "short", timeStyle: "short" }).format(new Date(iso));

// ===== Row que consume la DynamicTable =====
type Row = {
  id: number | string;
  rfc: string;
  razonSocial: string;
  repLegalNombre: string;
  repLegalCorreo: string;
  fechaCreacion: string; // ya formateada
  // para buscador
  _searchBlob: string;
};

function EmpresasTable() {
  const columns = [
    { key: "rfc", label: "RFC" },
    { key: "razonSocial", label: "Razón Social" },
    { key: "repLegal", label: "Representante Legal" },
    { key: "fechaCreacion", label: "Fecha Creación" },
    { key: "opciones", label: "Opciones" },
  ] as const;

  const router = useRouter();
  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const api = await getEmpresas();

        const mapped: Row[] = api.map((e: EmpresaApi) => {
          const rep = e.representanteLegal ?? {
            nombres: "",
            apellidoPaterno: "",
            apellidoMaterno: "",
            correo: "",
          };
          const repNombre = [rep.nombres, rep.apellidoPaterno, rep.apellidoMaterno]
            .filter(Boolean)
            .join(" ")
            .trim();

          return {
            id: e.id,
            rfc: e.rfc,
            razonSocial: e.razonSocial,
            repLegalNombre: repNombre || "-",
            repLegalCorreo: rep.correo || "-",
            fechaCreacion: fmtDate(e.fechaCreacion),
            _searchBlob: `${e.rfc} ${e.razonSocial} ${repNombre} ${rep.correo}`.toLowerCase(),
          };
        });

        setRows(mapped);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleView = (row: Row) => {
    // Detalle de empresa (ajusta si tienes ruta real)
    router.push(`/empresas/${row.id}`);
  };

  const handleEdit = (row: Row) => {
    console.log("Editar empresa:", row.id);
  };

  const handleDelete = (row: Row) => {
    console.log("Eliminar empresa:", row.id);
  };

  const cellRenderers: Record<string, (item: Row) => React.ReactNode> = {
    repLegal: (item) => (
      <div className="flex flex-col">
        <span className="font-medium">{item.repLegalNombre}</span>
        <span className="text-foreground-500 text-sm">{item.repLegalCorreo}</span>
      </div>
    ),
    fechaCreacion: (item) => (
      <Tooltip content={item.fechaCreacion}>
        <span>{item.fechaCreacion}</span>
      </Tooltip>
    ),
    opciones: (item) =>
      renderActions([
        { icon: "fluent:open-32-filled", tooltip: "Ver", onClick: () => handleView(item) },
        { icon: "lucide:edit", tooltip: "Editar", onClick: () => handleEdit(item) },
        { icon: "lucide:trash", tooltip: "Eliminar", onClick: () => handleDelete(item) },
      ]),
  };

  const columnsWithRenderers = columns.map((col) => ({
    ...col,
    cellRenderer: cellRenderers[col.key as string] ?? undefined,
    allowsSorting: col.key !== "opciones" && col.key !== "repLegal",
  }));

  return (
    <DynamicTable
      data={rows}
      columns={columnsWithRenderers}
      isLoading={loading}
      allowFiltering
      allowSorting
      allowColumnVisibility
      allowRowSelection={false}
      // buscador: RFC, Razón Social, Representante y correo
      filterableColumns={["_searchBlob"]}
      initialVisibleColumns={columns.map((c) => c.key)}
      itemsPerPage={10}
      excludeFromSorting={["opciones", "repLegal"]}
    />
  );
}

export default function EmpresasPage() {
  return (
    <section className="w-full px-5">
      <div className="mt-4 w-full">
        <EmpresasTable />
      </div>
    </section>
  );
}
