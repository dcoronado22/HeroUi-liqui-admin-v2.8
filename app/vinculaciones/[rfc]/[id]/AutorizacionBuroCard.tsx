"use client";

import React from "react";
import { Card, CardBody, CardHeader, Chip, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useVinculacion } from "@/contexts/VinculacionProvider";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="min-w-0">
        <div className="text-sm text-foreground-500">{label}</div>
        <div className="font-medium break-words">{children ?? "--"}</div>
    </div>
);

const tipoContribLabel = (t?: 0 | 1 | null) => (t === 0 ? "Persona moral" : t === 1 ? "Persona física" : "--");

function estadoChip(ok: boolean | null | undefined, { okText, failText }: { okText: string; failText: string }) {
    if (ok) return <Chip size="sm" color="success" variant="flat">{okText}</Chip>;
    return <Chip size="sm" color="warning" variant="flat">{failText}</Chip>;
}
function buroStateChip(v?: number | null) {
    if (v === 1) return <Chip size="sm" color="success" variant="flat">Aceptado</Chip>;
    if (v === 0 || v == null) return <Chip size="sm" color="warning" variant="flat">Pendiente</Chip>;
    return <Chip size="sm" color="danger" variant="flat">Rechazado</Chip>;
}
function firmadoChip(v?: number | null) {
    if (v === 1) return <Chip size="sm" color="success" variant="flat">Firmado</Chip>;
    if (v === 0 || v == null) return <Chip size="sm" color="warning" variant="flat">No firmado</Chip>;
    return <Chip size="sm" color="danger" variant="flat">Error</Chip>;
}
function fmtDate(iso?: string | null) {
    if (!iso) return "--";
    try { return new Date(iso).toLocaleString(); } catch { return "--"; }
}

export default function AutorizacionBuroCard() {
    const { detalle } = useVinculacion();
    const buro = detalle?.datosAutorizacionBuro ?? {};
    const doc = buro.autorizacionBuro ?? {};

    return (
        <Card shadow="sm" className="text-left px-5 py-4 dark:border-default-100 border border-default-100 shadow-xl shadow-black/20 dark:shadow-black/40">
            <CardHeader className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Icon icon="solar:shield-check-linear" className="text-xl" />
                    <div className="font-semibold">Autorización Buró</div>
                </div>
                <div className="flex items-center gap-2">
                    {estadoChip(buro.executedBuro, { okText: "Ejecución completada", failText: "Sin ejecutar" })}
                    {buroStateChip(buro.buroState)}
                    {firmadoChip(doc.state)}
                </div>
            </CardHeader>
            <Divider className="my-2" />
            <CardBody className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                    <Field label="Tipo contribuyente">{tipoContribLabel(buro?.TipoContribuyente)}</Field>
                    <Field label="Calle">{[buro.calle, buro.numeroExterior].filter(Boolean).join(" - ") || "--"}</Field>
                    <Field label="Número exterior">{buro.numeroExterior ?? "--"}</Field>

                    <Field label="Número interior">{buro.numeroInterior ?? "--"}</Field>
                    <Field label="Colonia">{buro.colonia ?? "--"}</Field>
                    <Field label="Municipio">{buro.municipio ?? "--"}</Field>

                    <Field label="Ciudad">{buro.ciudad ?? "--"}</Field>
                    <Field label="Estado">{buro.estado ?? "--"}</Field>
                    <Field label="Código postal">{buro.codigoPostal ?? "--"}</Field>

                    <Field label="Fecha en que se firma">{fmtDate(doc?.signedAt)}</Field>
                    <Field label="Envío firma autorización">—</Field>
                    <Field label="Estado firma documento">{firmadoChip(doc?.state)}</Field>

                    <Field label="Ejecución Buró">{estadoChip(buro.executedBuro, { okText: "Completado", failText: "Pendiente" })}</Field>
                    <Field label="Estado Buró">{buroStateChip(buro.buroState)}</Field>
                    <Field label="Detalle Buró">{buro.detalleBuro?.trim() || "No hay detalle."}</Field>
                </div>
            </CardBody>
        </Card>
    );
}
