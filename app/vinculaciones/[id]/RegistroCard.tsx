"use client";

import React from "react";
import { Card, CardBody, CardHeader, Chip, Progress, Skeleton, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { getDetalleVinculacion } from "@/lib/api/getDetalleVinculacion";

type Resp = Awaited<ReturnType<typeof getDetalleVinculacion>>;

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="min-w-0">
        <div className="text-sm text-foreground-500">{label}</div>
        <div className="font-medium text-sm break-words">{children ?? "—"}</div>
    </div>
);

const Segmented10 = ({ value }: { value: number }) => {
    const v = Math.max(0, Math.min(10, value));
    return (
        <Progress
            aria-label="Progreso"
            value={v}
            maxValue={10}
            size="sm"
            radius="full"
            className="w-full"
        />
    );
};

const tipoContribLabel = (t?: 0 | 1) => (t === 0 ? "Persona moral" : t === 1 ? "Persona física" : "—");

export default function RegistroCard({ id, expandAll, onToggleExpandAll }: { id: string; expandAll: boolean; onToggleExpandAll: () => void }) {
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [data, setData] = React.useState<Resp | null>(null);

    React.useEffect(() => {
        let on = true;
        (async () => {
            try {
                setLoading(true);
                const json = await getDetalleVinculacion(id);
                if (on) setData(json);
            } catch (e: any) {
                setError(e?.message ?? "Error");
            } finally {
                if (on) setLoading(false);
            }
        })();
        return () => { on = false; };
    }, [id]);

    if (loading) {
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

    if (error || !data) {
        return <Card shadow="sm"><CardBody className="text-danger">Error: {error ?? "Sin datos"}</CardBody></Card>;
    }

    const det = data.detalleVinculacion;
    const reg = det.datosRegistroVinculacion;
    const score = reg.state ?? det.state ?? 0;
    const rep = [reg.nombresRepLegal, reg.apellidoPaternoRepLegal, reg.apellidoMaternoRepLegal]
        .filter(Boolean).join(" ") || "—";

    return (
        <Card shadow="sm" className="text-left px-3 m-3 dark:border-default-100 border border-default-50 shadow-xl shadow-black/10 dark:shadow-black/40">
            <CardHeader className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 shrink-0">
                    <Icon icon="solar:document-line-duotone" className="text-xl" />
                    <div className="font-semibold">Detalle Vinculacion</div>
                    <Chip size="sm" variant="flat" color="success">Vinculado</Chip>
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

            <CardBody className="space-y-6 ">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                    <Field label="Razón social">{reg.razonSocial}</Field>
                    <Field label="RFC">{reg.rfc}
                        <Chip color="primary" className="ml-2" size="sm" variant="flat">
                            {tipoContribLabel(reg.TipoContribuyente)}
                        </Chip>
                    </Field>
                    <Field label="Representante legal">{rep}</Field>
                    <Field label="Teléfono">{reg.telefono}</Field>
                    <Field label="Whatsapp">{reg.whatsapp}</Field>
                    <Field label="Email">{reg.email}</Field>
                </div>
            </CardBody>
        </Card>
    );
}