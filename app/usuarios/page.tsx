"use client";

import React from "react";
import { Chip, Tooltip } from "@heroui/react";
import { DynamicTable, renderActions } from "@/components/DynamicTable/DynamicTable";
import { Icon } from "@iconify/react";
import { getUsuarios, UsuarioApi, RoleApi } from "@/lib/api/getUsuarios";
import { useRouter } from "next/navigation";
import { RolesCell } from "./RolesCell";

// ===== Row que consume la DynamicTable =====
type Row = {
  id: string;
  userName: string;
  name: string;
  email: string;
  roles: RoleApi[]; // se mostrarán como chips
};

function UsuariosTable() {
  const columns = [
    { key: "userName", label: "Usuario" },
    { key: "name", label: "Nombre" },
    { key: "email", label: "Email" },
    { key: "roles", label: "Roles" },
    { key: "opciones", label: "Opciones" },
  ] as const;

  const router = useRouter();
  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const usuarios = await getUsuarios();

        // El backend a veces repite roles; deduplicamos por roleId+roleKey
        const dedup = (roles: RoleApi[]) => {
          const seen = new Set<string>();
          return roles.filter(r => {
            const k = `${r.roleId}-${r.roleKey}`;
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
          });
        };

        const mapped: Row[] = usuarios.map((u) => ({
          id: u.id,
          userName: u.userName,
          name: u.name,
          email: u.email,
          roles: dedup(u.roles || []),
        }));

        setRows(mapped);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleEditRoles = React.useCallback((row: Row) => {
    // Aquí luego abres tu modal "Editar Roles"
    console.log("Editar roles de:", row.id, row.userName);
  }, []);

  const handleVerDetalle = React.useCallback((row: Row) => {
    // Si tendrás detalle: /usuarios/[id]
    router.push(`/usuarios/${row.id}`);
  }, [router]);

  const cellRenderers: Record<string, (item: Row) => React.ReactNode> = {
    roles: (item) => <RolesCell roles={item.roles} maxVisible={1} />,
    opciones: (item) =>
      renderActions([
        { icon: "fluent:open-32-filled", tooltip: "Ver detalle", onClick: () => handleVerDetalle(item) },
        { icon: "lucide:shield-check", tooltip: "Editar Roles", onClick: () => handleEditRoles(item) },
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
      // Filtra por estos campos cuando se use el buscador de la tabla
      filterableColumns={["userName", "name", "email"]}
      initialVisibleColumns={columns.map((c) => c.key)}
      itemsPerPage={10}
      excludeFromSorting={["opciones"]}
      actionButton={{
        label: "Invitar usuario",
        icon: "mingcute:user-add-2-fill",
        color: "primary",
        variant: "solid",
        onClick: () => console.log("test"),
      }}
    />
  );
}

export default function UsuariosPage() {
  return (
    <section className="w-full px-5">
      <div className="mt-4 w-full">
        <UsuariosTable />
      </div>
    </section>
  );
}
