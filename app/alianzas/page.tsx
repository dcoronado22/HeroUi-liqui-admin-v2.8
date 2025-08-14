"use client";

import React from "react";
import { DynamicTable, renderActions } from "@/components/DynamicTable/DynamicTable";
import { useRouter } from "next/navigation";
import { getAlianzas, AlianzaApi } from "@/lib/api/getAlianzas";
import { Tooltip } from "@heroui/react";

type Row = {
  id: number;
  aliado: string;
  codigoAlianza: string;
  urlAlianza: string;
  multiplicadorCupo: number;
  idExpedienteAzul: string;
  aplicaAval: boolean;
  vinculacionesCount: number;
  documentosCount: number;
  _searchBlob: string;
};

function AlianzasTable() {
  const columns = [
    { key: "aliado", label: "Aliado" },
    { key: "codigoAlianza", label: "Código Alianza" },
    { key: "urlAlianza", label: "URL Alianza" },
    { key: "multiplicadorCupo", label: "Multiplicador ..." },
    { key: "idExpedienteAzul", label: "ID Expediente Azul" },
    { key: "aplicaAval", label: "Ap..." },
    { key: "opciones", label: "Opciones" },
  ] as const;

  const router = useRouter();
  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const alianzas = await getAlianzas();

        const mapped: Row[] = alianzas.map((a: AlianzaApi) => ({
          id: a.id,
          aliado: a.aliado,
          codigoAlianza: a.codigoAlianza,
          urlAlianza: a.urlAlianza,
          multiplicadorCupo: a.multiplicadorCupo,
          idExpedienteAzul: a.idExpedienteAzul,
          aplicaAval: !!a.aplicaAval,
          vinculacionesCount: Array.isArray(a.vinculaciones) ? a.vinculaciones.length : 0,
          documentosCount: a.documentosOperacion ?? 0,
          _searchBlob: `${a.aliado} ${a.codigoAlianza} ${a.urlAlianza} ${a.idExpedienteAzul}`.toLowerCase(),
        }));

        setRows(mapped);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleEdit = (row: Row) => {
    console.log("Editar alianza:", row.id);
    // router.push(`/alianzas/${row.id}/editar`);
  };

  const handleManageVinculaciones = (row: Row) => {
    console.log("Vinculaciones de alianza:", row.id);
    // router.push(`/alianzas/${row.id}/vinculaciones`);
  };

  const handleManageDocs = (row: Row) => {
    console.log("Documentos de alianza:", row.id);
    // router.push(`/alianzas/${row.id}/documentos`);
  };

  const handleDelete = (row: Row) => {
    console.log("Eliminar alianza:", row.id);
  };

  const fmtMult = (n: number) => {
    // si es entero, muéstralo como "2"; si no, 2 decimales
    return Number.isInteger(n) ? String(n) : n.toFixed(2);
  };

  const cellRenderers: Record<string, (item: Row) => React.ReactNode> = {
    urlAlianza: (item) => (
      <Tooltip content={item.urlAlianza}>
        <a
          href={item.urlAlianza}
          target="_blank"
          rel="noopener noreferrer"
          className="max-w-[260px] truncate inline-block text-primary"
          title={item.urlAlianza}
        >
          {item.urlAlianza}
        </a>
      </Tooltip>
    ),
    multiplicadorCupo: (item) => <span>{fmtMult(item.multiplicadorCupo)}</span>,
    aplicaAval: (item) => <span>{item.aplicaAval ? "Sí" : "No"}</span>,
    opciones: (item) =>
      renderActions([
        { icon: "lucide:pencil", tooltip: "Editar", onClick: () => handleEdit(item) },
        {
          icon: "lucide:users",
          tooltip: `Vinculaciones (${item.vinculacionesCount})`,
          onClick: () => handleManageVinculaciones(item),
        },
        {
          icon: "lucide:image-plus",
          tooltip: `Documentos (${item.documentosCount})`,
          onClick: () => handleManageDocs(item),
        },
        { icon: "lucide:trash", tooltip: "Eliminar", onClick: () => handleDelete(item) },
      ]),
  };

  const columnsWithRenderers = columns.map((col) => ({
    ...col,
    cellRenderer: cellRenderers[col.key as string] ?? undefined,
    allowsSorting: !["opciones", "urlAlianza"].includes(col.key),
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
      filterableColumns={["_searchBlob"]}
      initialVisibleColumns={columns.map((c) => c.key)}
      itemsPerPage={10}
      excludeFromSorting={["opciones", "urlAlianza"]}
      actionButton={{
        label: "Agregar alianza",
        icon: "mingcute:add-fill",
        color: "primary",
        variant: "solid",
        onClick: () => console.log("test"),
      }}
    />
  );
}

export default function AlianzasPage() {
  return (
    <section className="w-full px-5">
      <div className="mt-4 w-full">
        <AlianzasTable />
      </div>
    </section>
  );
}
