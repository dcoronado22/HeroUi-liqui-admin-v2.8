"use client";
import React from "react";
import { Chip, Popover, PopoverTrigger, PopoverContent } from "@heroui/react";

export default function PermissionsCell({
    permisos,
    maxVisible = 6,
}: {
    permisos: string[];
    maxVisible?: number;
}) {
    const visible = permisos.slice(0, maxVisible);
    const hidden = permisos.slice(maxVisible);

    const [open, setOpen] = React.useState(false);

    const Backdrop = open ? (
        <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setOpen(false)} />
    ) : null;

    return (
        <>
            {Backdrop}
            <div className="flex flex-wrap items-center gap-2">
                {visible.map((p, i) => (
                    <Chip key={`${p}-${i}`} size="sm" variant="flat" color="primary">
                        {p}
                    </Chip>
                ))}
                {hidden.length > 0 && (
                    <Popover isOpen={open} onOpenChange={setOpen} placement="bottom-start" showArrow>
                        <PopoverTrigger>
                            <Chip
                                as="button"
                                size="sm"
                                variant="flat"
                                color="default"
                                className="cursor-pointer"
                                title={`Ver ${hidden.length} permiso(s) más`}
                            >
                                +{hidden.length}
                            </Chip>
                        </PopoverTrigger>
                        <PopoverContent className="z-50 max-w-[480px]">
                            <div className="p-3 max-h-[300px] overflow-auto flex flex-wrap gap-2">
                                {permisos.map((p, i) => (
                                    <Chip key={`all-${p}-${i}`} size="sm" variant="flat" color="primary">
                                        {p}
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
