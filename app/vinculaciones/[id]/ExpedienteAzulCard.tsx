"use client";

import React from "react";
import {
    Card, CardBody, CardHeader, Chip, Input, Button, Tooltip,
    Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Skeleton,
    Divider
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { getDocumentosExpediente, ExpedienteDoc } from "@/lib/api/getDocumentosExpediente";

const chipEstado = (s: ExpedienteDoc["status"]) => {
    if (s === "valid") return <Chip size="sm" color="success" variant="flat">Válido</Chip>;
    if (s === "observed") return <Chip size="sm" color="warning" variant="flat">Observado</Chip>;
    if (s === "pending") return <Chip size="sm" color="primary" variant="flat">Pendiente</Chip>;
    return <Chip size="sm" color="danger" variant="flat">Inválido</Chip>;
};

export default function ExpedienteAzulCard({ id }: { id: string }) {
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [rows, setRows] = React.useState<ExpedienteDoc[]>([]);
    const [q, setQ] = React.useState("");

    React.useEffect(() => {
        let on = true;
        (async () => {
            try {
                setLoading(true);
                const data = await getDocumentosExpediente(id);
                if (on) setRows(data);
            } catch (e: any) {
                setError(e?.message ?? "Error");
            } finally {
                if (on) setLoading(false);
            }
        })();
        return () => { on = false; };
    }, [id]);

    const filtered = rows.filter(r => r.name.toLowerCase().includes(q.toLowerCase()));
    const uploaded = rows.filter(r => r.filesCount > 0).length;

    const DescargarBtn = ({ r }: { r: ExpedienteDoc }) => (
        <Tooltip content={r.url ? "Descargar" : "Sin URL disponible"}>
            <Button
                size="sm"
                variant="shadow"
                color="primary"
                startContent={<Icon icon="solar:download-minimalistic-linear" className="text-lg" />}
                as={r.url ? "a" : "button"}
                href={r.url ?? undefined}
                target={r.url ? "_blank" : undefined}
                isDisabled={!r.url}
            >
                Descargar
            </Button>
        </Tooltip>
    );

    if (loading) {
        return (
            <Card shadow="sm">
                <CardHeader className="flex items-center justify-between">
                    <Skeleton className="h-6 w-48 rounded-md" />
                    <Skeleton className="h-5 w-28 rounded-md" />
                </CardHeader>
                <CardBody className="space-y-3">
                    <Skeleton className="h-10 w-full rounded-xl" />
                    <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="grid grid-cols-12 items-center gap-3">
                                <Skeleton className="h-5 rounded-md col-span-6" />
                                <Skeleton className="h-6 rounded-md col-span-2" />
                                <Skeleton className="h-6 rounded-md col-span-2" />
                                <Skeleton className="h-9 rounded-md col-span-2" />
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>
        );
    }

    if (error) {
        return <Card shadow="sm"><CardBody className="text-danger">{error}</CardBody></Card>;
    }

    return (
        <Card shadow="sm" className="text-left px-5 py-2  mb-5 dark:border-default-100 border border-default-100 shadow-xl shadow-black/20 dark:shadow-black/40">
            <CardHeader className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 justify-between">
                    <Icon icon="solar:shield-check-linear" className="text-xl" />
                    <div className="font-semibold">Datos Expediente Azul</div>
                    <div className="text-small text-foreground-500">
                        Documentos subidos: <span className="font-semibold">{uploaded}</span> de <span className="font-semibold">{rows.length}</span>
                    </div>
                </div>
            </CardHeader>
            <Divider className="my-2" />
            <CardBody className="space-y-4">
                <Input
                    placeholder="Buscar documento..."
                    startContent={<Icon icon="solar:magnifier-linear" />}
                    value={q}
                    onValueChange={setQ}
                    className="max-w-xl"
                />

                <Table
                    aria-label="Tabla de documentos del expediente"
                    removeWrapper
                    classNames={{
                        th: "text-foreground font-medium",
                        td: "py-4",
                    }}
                >
                    <TableHeader>
                        <TableColumn>Nombre Documento</TableColumn>
                        <TableColumn className="w-40">Subido</TableColumn>
                        <TableColumn className="w-40">Estado</TableColumn>
                        <TableColumn className="w-48 text-right pr-10">Acciones</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent="Sin resultados." items={filtered}>
                        {(r) => (
                            <TableRow key={r.id}>
                                <TableCell>{r.name}</TableCell>
                                <TableCell>
                                    <Chip size="sm" color={r.filesCount > 0 ? "success" : "default"} variant="flat">
                                        {r.filesCount} archivo(s)
                                    </Chip>
                                </TableCell>
                                <TableCell>{chipEstado(r.status)}</TableCell>
                                <TableCell className="text-right">
                                    <DescargarBtn r={r} />
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardBody>
        </Card>
    );
}