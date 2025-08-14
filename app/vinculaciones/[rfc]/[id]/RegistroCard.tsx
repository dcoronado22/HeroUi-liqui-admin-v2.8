"use client";

import React from "react";
import { Card, CardBody, CardHeader, Chip, Progress, Skeleton, Button, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useVinculacion } from "@/contexts/VinculacionProvider";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="min-w-0">
        <div className="text-sm text-foreground-500">{label}</div>
        <div className="font-medium text-sm break-words">{children ?? "—"}</div>
    </div>
);

// opcional por si quieres mostrar “score” (0..10)
const Segmented10 = ({ value }: { value: number }) => {
    const v = Math.max(0, Math.min(10, value));
    return <Progress aria-label="Progreso" value={v} maxValue={10} size="sm" radius="full" className="w-full" />;
};

const tipoContribLabel = (t?: 0 | 1) => (t === 0 ? "Persona moral" : t === 1 ? "Persona física" : "—");

function estadoChip(
    state?: number | null,
    desc?: string | null
) {
    const label = (desc?.trim()?.length ? desc : undefined) ??
        (state === 10 ? "Vinculado" :
            state === 0 ? "Pendiente" :
                state === -1 ? "Rechazado" : "Estado");

    const color: "success" | "warning" | "danger" | "default" =
        state === 10 ? "success" :
            state === 0 ? "warning" :
                state === -1 ? "danger" : "default";

    return <Chip size="sm" variant="flat" color={color}>{label}</Chip>;
}

export default function RegistroCard({
    expandAll,
    onToggleExpandAll,
}: {
    expandAll: boolean;
    onToggleExpandAll: () => void;
}) {
    const ctx = useVinculacion();
    const detalle = ctx.detalle;

    // Loading inicial mientras el Provider trae el detalle
    if (!detalle) {
        return (
            <Card shadow="sm">
                <CardHeader className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-40 rounded-md" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-md flex-1" />
                    <Skeleton className="h-5 w-12 rounded-md" />
                </CardHeader>
                <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-3 w-28 rounded-md" />
                            <Skeleton className="h-5 w-48 rounded-md" />
                        </div>
                    ))}
                </CardBody>
            </Card>
        );
    }

    const reg = detalle.datosRegistroVinculacion ?? {};
    const rep =
        [reg.nombresRepLegal, reg.apellidoPaternoRepLegal, reg.apellidoMaternoRepLegal]
            .filter(Boolean)
            .join(" ") || "—";

    const rfc = reg.rfc || ctx.key.rfc || "—";
    const score = reg.state ?? detalle.state ?? 0; // por si quieres usar <Segmented10 value={...} />

    return (
        <Card
            shadow="sm"
            className="text-left px-3 m-3 dark:border-default-100 border border-default-50 shadow-xl shadow-black/10 dark:shadow-black/40"
        >
            <CardHeader className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 shrink-0">
                    <Icon icon="solar:document-line-duotone" className="text-xl" />
                    <div className="font-semibold">Detalle de vinculación</div>
                    {estadoChip(detalle.state, (detalle as any)?.stateDescription)}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <Button
                        size="sm"
                        variant="solid"
                        color="primary"
                        onPress={onToggleExpandAll}
                        startContent={<Icon icon={expandAll ? "mingcute:grid-fill" : "flowbite:expand-outline"} />}
                    >
                        {expandAll ? "Ver por secciones" : "Expandir todo"}
                    </Button>
                </div>
            </CardHeader>

            <Divider className="my-2" />

            <CardBody className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                    <Field label="Razón social">{reg.razonSocial ?? "—"}</Field>

                    <Field label="RFC">
                        {rfc}
                        <Chip color="primary" className="ml-2" size="sm" variant="flat">
                            {tipoContribLabel(reg.TipoContribuyente)}
                        </Chip>
                    </Field>

                    <Field label="Representante legal">{rep}</Field>

                    <Field label="Teléfono">{reg.telefono ?? "—"}</Field>
                    <Field label="Whatsapp">{reg.whatsapp ?? "—"}</Field>
                    <Field label="Email">{reg.email ?? "—"}</Field>
                </div>

                {/* Si quisieras mostrar un “score” de 0..10 */}
                {/* <Segmented10 value={Number(score) || 0} /> */}
            </CardBody>
        </Card>
    );
}
