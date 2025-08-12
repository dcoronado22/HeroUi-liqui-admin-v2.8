"use client";

import React from "react";
import { DynamicTable, renderChip, renderActions } from "@/components/DynamicTable/DynamicTable";
import { title } from "@/components/primitives";

type Row = {
  id: number;
  rfc: string;
  razonSocial: string;
  estado: "Activo" | "Pendiente" | "Bloqueado";
  email: string;
  fechaCreacion: string;
  fechaClaveCiec: string;
};

function VinculacionesTable() {
  const columns = [
    { key: "rfc", label: "RFC" },
    { key: "razonSocial", label: "Razón Social" },
    { key: "estado", label: "Estado" },
    { key: "email", label: "Email" },
    { key: "fechaCreacion", label: "Fecha Creación" },
    { key: "fechaClaveCiec", label: "Fecha Clave Ciec" },
    { key: "opciones", label: "Opciones" },
  ] as const;

  const data: (Row & { opciones?: null })[] = [
    {
      id: 1,
      rfc: "ABC010203XYZ",
      razonSocial: "LiquiCapital S.A. de C.V.",
      estado: "Activo",
      email: "contacto@liquicapital.com",
      fechaCreacion: "2024-11-10",
      fechaClaveCiec: "2024-12-01",
    },
    {
      id: 2,
      rfc: "DEF040506JKL",
      razonSocial: "Comercializadora Norte SA",
      estado: "Pendiente",
      email: "ventas@comernorte.mx",
      fechaCreacion: "2025-01-15",
      fechaClaveCiec: "2025-02-10",
    },
    {
      id: 3,
      rfc: "GHI070809MNO",
      razonSocial: "Servicios del Centro",
      estado: "Bloqueado",
      email: "admin@servicent.mx",
      fechaCreacion: "2024-07-20",
      fechaClaveCiec: "2024-08-02",
    },
    {
      id: 4,
      rfc: "GHI070809MNO",
      razonSocial: "Servicios del Centro",
      estado: "Bloqueado",
      email: "admin@servicent.mx",
      fechaCreacion: "2024-07-20",
      fechaClaveCiec: "2024-08-02",
    },
    {
      id: 5,
      rfc: "GHI070809MNO",
      razonSocial: "Servicios del Centro",
      estado: "Bloqueado",
      email: "admin@servicent.mx",
      fechaCreacion: "2024-07-20",
      fechaClaveCiec: "2024-08-02",
    },
    {
      id: 6,
      rfc: "GHI070809MNO",
      razonSocial: "Servicios del Centro",
      estado: "Bloqueado",
      email: "admin@servicent.mx",
      fechaCreacion: "2024-07-20",
      fechaClaveCiec: "2024-08-02",
    },
    {
      id: 7,
      rfc: "GHI070809MNO",
      razonSocial: "Servicios del Centro",
      estado: "Bloqueado",
      email: "admin@servicent.mx",
      fechaCreacion: "2024-07-20",
      fechaClaveCiec: "2024-08-02",
    },
    {
      id: 8,
      rfc: "GHI070809MNO",
      razonSocial: "Servicios del Centro",
      estado: "Bloqueado",
      email: "admin@servicent.mx",
      fechaCreacion: "2024-07-20",
      fechaClaveCiec: "2024-08-02",
    },
    {
      id: 9,
      rfc: "GHI070809MNO",
      razonSocial: "Servicios del Centro",
      estado: "Bloqueado",
      email: "admin@servicent.mx",
      fechaCreacion: "2024-07-20",
      fechaClaveCiec: "2024-08-02",
    },
    {
      id: 10,
      rfc: "GHI070809MNO",
      razonSocial: "Servicios del Centro",
      estado: "Bloqueado",
      email: "admin@servicent.mx",
      fechaCreacion: "2024-07-20",
      fechaClaveCiec: "2024-08-02",
    },
    {
      id: 11,
      rfc: "GHI070809MNO",
      razonSocial: "Servicios del Centro",
      estado: "Bloqueado",
      email: "admin@servicent.mx",
      fechaCreacion: "2024-07-20",
      fechaClaveCiec: "2024-08-02",
    },
  ];

  const cellRenderers: Record<string, (item: any) => React.ReactNode> = {
    estado: (item) =>
      renderChip(
        item.estado,
        item.estado === "Activo" ? "success" : item.estado === "Pendiente" ? "warning" : "danger",
      ),
    opciones: () =>
      renderActions([
        { icon: "lucide:eye", tooltip: "Ver", onClick: () => console.log("Ver") },
        { icon: "lucide:edit", tooltip: "Editar", onClick: () => console.log("Editar") },
        { icon: "lucide:trash", tooltip: "Eliminar", onClick: () => console.log("Eliminar") },
      ]),
  };

  const columnsWithRenderers = columns.map((col) => ({
    ...col,
    cellRenderer: cellRenderers[col.key as string] ?? undefined,
    allowsSorting: col.key !== "opciones",
  }));

  return (
    <DynamicTable
      data={data}
      columns={columnsWithRenderers}
      allowFiltering={true}
      allowSorting={true}
      allowColumnVisibility={true}
      allowRowSelection={false}
      initialVisibleColumns={["rfc", "razonSocial", "estado", "email", "fechaCreacion", "fechaClaveCiec", "opciones"]}
      excludeFromSorting={["actions"]}
      filterableColumns={["name", "role", "team", "status"]}
      itemsPerPage={10}
    />
  );
}

export default function VinculacionesPage() {
  return (
    <section className="w-full">
      <div className="mt-4 w-full">
        <VinculacionesTable />
      </div>
    </section>
  );
}
