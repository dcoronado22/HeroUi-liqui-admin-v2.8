"use client";

import React from "react";
import { DynamicTable, renderActions } from "@/components/DynamicTable/DynamicTable";
import { useRouter } from "next/navigation";
import { getRoles, RoleRecordApi } from "@/lib/api/getRoles";
import PermissionsCell from "./PermissionsCell";

type Row = {
  id: string;
  roleKey: string;     // Clave
  roleName: string;    // Nombre
  permisos: string[];  // chips
  permisosText: string; // para búsquedas
};

function RolesTable() {
  const columns = [
    { key: "roleKey", label: "Clave" },
    { key: "roleName", label: "Nombre" },
    { key: "permisos", label: "Permisos" },
    { key: "opciones", label: "Opciones" },
  ] as const;

  const router = useRouter();
  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const apiRoles = await getRoles();

        const mapped: Row[] = apiRoles.map((r: RoleRecordApi) => {
          // split por ';', trim, sin vacíos, y dedupe
          const parts = (r.permisos || "")
            .split(";")
            .map(s => s.trim())
            .filter(Boolean);
          const uniq = Array.from(new Set(parts));
          return {
            id: r.id,
            roleKey: r.roleKey,
            roleName: r.roleName,
            permisos: uniq,
            permisosText: uniq.join(" "),
          };
        });

        setRows(mapped);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleView = (row: Row) => {
    // si tendrás detalle, navega a /roles/[id]
    console.log("Ver rol:", row.id);
  };

  const handleEdit = (row: Row) => {
    // abre modal de edición o navega
    console.log("Editar rol:", row.id);
  };

  const handleDelete = (row: Row) => {
    // confirm + delete
    console.log("Eliminar rol:", row.id);
  };

  const cellRenderers: Record<string, (item: Row) => React.ReactNode> = {
    permisos: (item) => <PermissionsCell permisos={item.permisos} maxVisible={6} />,
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
    allowsSorting: col.key !== "opciones",
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
      filterableColumns={["roleKey", "roleName", "permisosText"]}
      initialVisibleColumns={columns.map((c) => c.key)}
      itemsPerPage={10}
      excludeFromSorting={["opciones"]}
      actionButton={{
        label: "Agregar Rol",
        icon: "mingcute:add-fill",
        color: "primary",
        variant: "solid",
        onClick: () => console.log("test"),
      }}
    />
  );
}

export default function RolesPage() {
  return (
    <section className="w-full px-5">
      <div className="mt-4 w-full">
        <RolesTable />
      </div>
    </section>
  );
}
