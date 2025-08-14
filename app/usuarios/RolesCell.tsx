import { Chip, Popover, PopoverTrigger, PopoverContent } from "@heroui/react";
import React from "react";
import type { RoleApi } from "@/lib/api/getUsuarios";

export function RolesCell({
    roles,
    maxVisible = 3,
}: {
    roles: RoleApi[];
    maxVisible?: number;
}) {
    // Si hay muchos, mostramos algunos y metemos el resto en un popover
    const visible = roles.slice(0, maxVisible);
    const hidden = roles.slice(maxVisible);

    const [open, setOpen] = React.useState(false);

    // Backdrop “manual” mientras el popover esté abierto
    const Backdrop = open ? (
        <div
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() => setOpen(false)}
        />
    ) : null;

    return (
        <>
            {Backdrop}
            <div className="flex flex-wrap items-center gap-2">
                {visible.map((r) => (
                    <Chip key={`${r.roleId}-${r.roleKey}`} size="sm" variant="flat" color="primary">
                        {r.roleName}
                    </Chip>
                ))}

                {hidden.length > 0 && (
                    <Popover
                        isOpen={open}
                        onOpenChange={setOpen}
                        placement="bottom-start"
                        showArrow
                    >
                        <PopoverTrigger>
                            <Chip
                                as="button"
                                size="sm"
                                variant="flat"
                                className="cursor-pointer"
                                title={`Ver ${hidden.length} rol(es) más`}
                            >
                                +{hidden.length}
                            </Chip>
                        </PopoverTrigger>
                        <PopoverContent className="z-50 max-w-[360px]">
                            <div className="p-3 max-h-[260px] overflow-auto flex flex-wrap gap-2">
                                {/* Puedes mostrar solo los ocultos o todos. Aquí muestro TODOS para contexto */}
                                {roles.map((r) => (
                                    <Chip key={`all-${r.roleId}-${r.roleKey}`} size="sm" variant="flat" color="primary">
                                        {r.roleName}
                                    </Chip>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                )}
            </div>
        </>
    );
}
