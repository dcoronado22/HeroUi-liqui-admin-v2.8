"use client";

import React from "react";
import { Tooltip, Chip } from "@heroui/react";
import { DynamicTable, renderActions } from "@/components/DynamicTable/DynamicTable";
import { getRfcBloqueados, RfcBloqueadoApi } from "@/lib/api/getRfcBloqueados";

// Helpers
const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("es-MX", { dateStyle: "short", timeStyle: "short" }).format(new Date(iso));

const tipoToText = (t: 0 | 1) => (t === 0 ? "Persona Moral" : "Persona Física");

type Row = {
  id: string;              // usamos el RFC como id para la tabla
  rfc: string;
  nombre: string;          // Razón Social o Nombre completo
  tipo: 0 | 1;
  comentarios: string;
  fechaModificacion: string; // formateada
  bloqueado: boolean;      // true=Bloqueado, false=No bloqueado
  _searchBlob: string;
};

function ListasBloqueantesTable() {
  const columns = [
    { key: "rfc", label: "RFC" },
    { key: "nombre", label: "Nombre" },
    { key: "tipo", label: "Tipo" },
    { key: "comentarios", label: "Comentarios" },
    { key: "fechaModificacion", label: "Modificación" },
    { key: "bloqueado", label: "Estado" },
    { key: "opciones", label: "Acción" },
  ] as const;

  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const api = await getRfcBloqueados();

        const mapped: Row[] = api.map((x: RfcBloqueadoApi) => {
          // Nombre preferido:
          // - Si es Moral: razón social
          // - Si es Física: nombrePersona + apellidos, o x.nombre si ya viene armado
          const nombreFisica =
            x.nombre ||
            [x.nombrePersona, x.apellidoPaterno, x.apellidoMaterno].filter(Boolean).join(" ").trim();
          const nombre = x.tipoContribuyente === 0 ? (x.razonSocial || x.nombre || "") : nombreFisica;

          return {
            id: x.rfc,
            rfc: x.rfc,
            nombre,
            tipo: x.tipoContribuyente,
            comentarios: x.comentarios || "",
            fechaModificacion: fmtDate(x.fechaModificacion),
            bloqueado: Boolean(x.estado),
            _searchBlob: `${x.rfc} ${nombre} ${x.comentarios}`.toLowerCase(),
          };
        });

        setRows(mapped);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleRevisar = (row: Row) => {
    // Aquí luego disparas revalidación/ver historial/etc.
    console.log("Revisar/actualizar estatus:", row.rfc);
  };

  const cellRenderers: Record<string, (item: Row) => React.ReactNode> = {
    tipo: (item) => (
      <Chip variant="flat" size="sm">
        {tipoToText(item.tipo)}
      </Chip>
    ),
    comentarios: (item) => (
      <Tooltip
        content={
          <div className="max-w-[420px] whitespace-pre-wrap text-tiny">
            {item.comentarios}
          </div>
        }
        placement="top-start"
      >
        <span className="block max-w-[520px] truncate">{item.comentarios}</span>
      </Tooltip>
    ),
    bloqueado: (item) => (
      <Chip
        size="sm"
        variant="flat"
        color={item.bloqueado ? "danger" : "success"}
      >
        {item.bloqueado ? "Bloqueado" : "No bloqueado"}
      </Chip>
    ),
    opciones: (item) =>
      renderActions([
        { icon: "lucide:refresh-ccw", tooltip: "Revisar / Actualizar", onClick: () => handleRevisar(item) },
      ]),
  };

  const columnsWithRenderers = columns.map((col) => ({
    ...col,
    cellRenderer: cellRenderers[col.key as string] ?? undefined,
    // Evitamos ordenar por texto recortado/acciones
    allowsSorting: !["opciones", "comentarios"].includes(col.key),
  }));

  return (
    <DynamicTable
      data={rows}
      columns={columnsWithRenderers}
      isLoading={loading}
      allowFiltering
      allowSorting
      allowColumnVisibility
      allowRowSelection={true}
      filterableColumns={["_searchBlob"]}
      initialVisibleColumns={columns.map((c) => c.key)}
      itemsPerPage={10}
      excludeFromSorting={["opciones", "comentarios"]}
      actionButton={{
        label: "Agregar a listas",
        icon: "mingcute:add-fill",
        color: "primary",
        variant: "solid",
        onClick: () => console.log("test"),
      }}
    />
  );
}

export default function ListasBloqueantesPage() {
  return (
    <section className="w-full px-5">
      <div className="mt-4 w-full">
        <ListasBloqueantesTable />
      </div>
    </section>
  );
}
