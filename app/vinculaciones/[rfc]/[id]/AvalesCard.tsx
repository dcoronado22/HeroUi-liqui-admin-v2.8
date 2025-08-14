"use client";

import React from "react";
import {
    Card, CardBody, CardHeader, Chip, Skeleton, Button, Input,
    Modal, ModalContent, ModalBody, ModalHeader, ModalFooter, Divider, Tooltip
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useVinculacion } from "@/contexts/VinculacionProvider";

// ===== Tipos (solo locales para pintar la UI) =====
type Aval = {
    id: string | number;
    nombreCompleto?: string;
    rfc?: string;
    numeroExterior?: string | number | null;
    numeroInterior?: string | number | null;
    municipio?: string | null;
    ciudad?: string | null;
    codigoPostal?: string | number | null;
    estado?: string | null;
    colonia?: string | null;
    calle?: string | null;
    envioFirmaAutorizacion?: string | null; // email
    fechaFirma?: string | null;
    patrimonioLiquido?: number | null;
    detalleBuro?: string | null;
    ejecutadoBuro?: boolean | null;
    estadoBuro?: number | null;     // 1 aceptado / -1 rechazado / 0|null pendiente
    firmaDocumento?: number | null; // 1 firmado
};

// ===== Helpers UI =====
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="min-w-0">
        <div className="text-sm text-foreground-500">{label}</div>
        <div className="font-medium break-words">{children ?? "—"}</div>
    </div>
);

const fmtDate = (v?: string | null) => {
    if (!v) return "—";
    const d = new Date(v);
    return isNaN(d.getTime()) ? v : d.toLocaleDateString();
};

const fmtMoney = (n?: number | null) =>
    typeof n === "number"
        ? new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 }).format(n)
        : "—";

const unformatMoney = (s: string) => Number(s.replace(/[^\d.-]/g, "")) || 0;

const chipBuro = (v?: number | null) =>
    v === 1 ? <Chip size="sm" color="success" variant="flat">Aceptado</Chip>
        : v === -1 ? <Chip size="sm" color="danger" variant="flat">Rechazado</Chip>
            : <Chip size="sm" color="warning" variant="flat">Pendiente</Chip>;

const chipFirmado = (v?: number | null) =>
    v === 1 ? <Chip size="sm" color="success" variant="flat">Firmado</Chip>
        : <Chip size="sm" color="warning" variant="flat">No firmado</Chip>;

const chipEjecucion = (ok?: boolean | null) =>
    ok ? <Chip size="sm" color="success" variant="flat">Completado</Chip>
        : <Chip size="sm" color="warning" variant="flat">Pendiente</Chip>;

// ===== Mapper desde el detalle del provider -> Aval[] =====
function mapAvalistas(source: any[] = []): Aval[] {
    return source.map((a: any, i: number) => ({
        id: a.id ?? a.avalId ?? i,
        nombreCompleto:
            a.nombreCompleto ??
            [a.nombres, a.apellidoPaterno, a.apellidoMaterno].filter(Boolean).join(" "),
        rfc: a.rfc,
        numeroExterior: a.numeroExterior,
        numeroInterior: a.numeroInterior,
        municipio: a.municipio,
        ciudad: a.ciudad,
        codigoPostal: a.codigoPostal,
        estado: a.estado,
        colonia: a.colonia,
        calle: a.calle,
        envioFirmaAutorizacion: a.email ?? a.envioFirmaAutorizacion,
        fechaFirma: a.fechaFirma,
        patrimonioLiquido: a.patrimonioLiquido ?? a.patrimonio_liquido,
        detalleBuro: a.detalleBuro,
        ejecutadoBuro: a.executedBuro ?? a.ejecutadoBuro,
        estadoBuro: a.buroState ?? a.estadoBuro,
        firmaDocumento: a.firmaDocumento ?? a.autorizacionBuro?.state,
    }));
}

// ===== Componente principal =====
export default function AvalesCard() {
    const ctx = useVinculacion();

    // ⬇️ Ajusta estos nombres si tu provider expone otros
    const detalle = ctx.detalle;
    const loading = (ctx as any).loadingDetalle ?? ctx.loading ?? false;
    const error = (ctx as any).errorDetalle ?? ctx.error ?? null;

    const [avales, setAvales] = React.useState<Aval[]>([]);

    // Modal state
    const [open, setOpen] = React.useState(false);
    const [editing, setEditing] = React.useState<Aval | null>(null);
    const [moneyStr, setMoneyStr] = React.useState("");

    // Derivar avales desde el provider cuando llegue/actualice el detalle
    React.useEffect(() => {
        const src = (detalle as any)?.detalleVinculacion?.datosAvalistas ?? (detalle as any)?.datosAvalistas ?? [];
        setAvales(mapAvalistas(src));
    }, [detalle]);

    const openEdit = (aval: Aval) => {
        setEditing(aval);
        setMoneyStr(aval.patrimonioLiquido != null ? fmtMoney(aval.patrimonioLiquido) : "");
        setOpen(true);
    };

    const saveEdit = () => {
        if (!editing) return;
        const val = unformatMoney(moneyStr);
        // 1) Optimista en UI
        setAvales(prev => prev.map(a => a.id === editing.id ? { ...a, patrimonioLiquido: val } : a));
        setOpen(false);

        // 2) TODO: persistir en backend y luego refrescar:
        // await api.updatePatrimonio({ id: editing.id, valor: val })
        // await ctx.reloadDetalle()  // si tu provider expone este helper
    };

    // ===== Estados de carga/errores =====
    if (loading) {
        return (
            <Card shadow="sm">
                <CardHeader>
                    <Skeleton className="h-5 w-40 rounded-md" />
                </CardHeader>
                <CardBody className="space-y-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {Array.from({ length: 9 }).map((__, j) => (
                                <div key={j} className="space-y-2">
                                    <Skeleton className="h-3 w-28 rounded-md" />
                                    <Skeleton className="h-5 w-48 rounded-md" />
                                </div>
                            ))}
                        </div>
                    ))}
                </CardBody>
            </Card>
        );
    }

    if (error) {
        return <Card shadow="sm"><CardBody className="text-danger">Error: {String(error)}</CardBody></Card>;
    }

    if (!avales.length) {
        return <Card shadow="sm"><CardBody className="text-foreground-500">No hay avales.</CardBody></Card>;
    }

    return (
        <>
            <div className="space-y-6">
                {avales.map((a) => (
                    <Card key={a.id} shadow="sm" className="text-left mb-5 px-5 py-2 dark:border-default-100 border border-default-100 shadow-xl shadow-black/20 dark:shadow-black/40">
                        <CardHeader className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <Icon icon="solar:user-id-linear" className="text-xl" />
                                <div className="font-semibold">Aval: {a.nombreCompleto ?? "—"}</div>
                            </div>
                        </CardHeader>
                        <Divider className="my-2" />
                        <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Col 1 */}
                            <Field label="RFC">{a.rfc ?? "—"}</Field>
                            <Field label="Número exterior">{a.numeroExterior ?? "—"}</Field>
                            <Field label="Municipio">{a.municipio ?? "—"}</Field>
                            <Field label="Código postal">{a.codigoPostal ?? "—"}</Field>
                            <Field label="Estado firma documento">{chipFirmado(a.firmaDocumento)}</Field>
                            <Field label="Estado Buró">{chipBuro(a.estadoBuro)}</Field>

                            {/* Col 2 */}
                            <Field label="Número interior">{a.numeroInterior ?? "—"}</Field>
                            <Field label="Ciudad">{a.ciudad ?? "—"}</Field>
                            <Field label="Fecha en que se firma">{fmtDate(a.fechaFirma)}</Field>
                            <div className="flex items-center gap-2">
                                <Field label="Patrimonio líquido">{fmtMoney(a.patrimonioLiquido)}</Field>
                                <Tooltip content="Editar patrimonio">
                                    <Button isIconOnly size="sm" variant="light" onPress={() => openEdit(a)}>
                                        <Icon icon="solar:pen-linear" className="text-base" />
                                    </Button>
                                </Tooltip>
                            </div>
                            <Field label="Detalle Buró">
                                <span className="truncate inline-block max-w-[18rem]">{a.detalleBuro?.trim() || "—"}</span>
                            </Field>

                            {/* Col 3 */}
                            <Field label="Calle">{a.calle ?? "—"}</Field>
                            <Field label="Colonia">{a.colonia ?? "—"}</Field>
                            <Field label="Estado">{a.estado ?? "—"}</Field>
                            <Field label="Envío firma autorización">{a.envioFirmaAutorizacion ?? "—"}</Field>
                            <Field label="Ejecución Buró">{chipEjecucion(a.ejecutadoBuro)}</Field>
                            <div />{/* para cuadrar grilla */}
                        </CardBody>
                    </Card>
                ))}
            </div>

            {/* ===== Modal con Card adentro (card-modal) ===== */}
            <Modal isOpen={open} onOpenChange={setOpen} placement="center" size="md" backdrop="blur">
                <ModalContent>
                    <Card className="w-full max-w-[560px] m-auto" shadow="none" radius="sm">
                        <CardHeader className="px-6 pt-6 pb-2">
                            <div className="flex flex-col items-start">
                                <h4 className="text-large">Editar patrimonio líquido</h4>
                                <p className="text-small text-default-500">{editing?.nombreCompleto ?? "—"}</p>
                            </div>
                        </CardHeader>
                        <Divider />
                        <CardBody className="px-6">
                            <ModalHeader className="px-0 pb-2" />
                            <ModalBody className="px-0 -mt-4">
                                <Input
                                    label="Patrimonio líquido (MXN)"
                                    value={moneyStr}
                                    inputMode="numeric"
                                    startContent={<span className="text-default-500">$</span>}
                                    onValueChange={setMoneyStr}
                                    onBlur={() => {
                                        const n = unformatMoney(moneyStr);
                                        setMoneyStr(n ? fmtMoney(n) : "");
                                    }}
                                    description="Usa números y separadores. Se guardará en MXN."
                                />
                            </ModalBody>
                            <Divider className="my-1" />
                            <ModalFooter className="px-0">
                                <div className="flex w-full flex-wrap-reverse items-center justify-between gap-2">
                                    <p className="text-small text-default-400">
                                        {moneyStr ? `Valor: ${fmtMoney(unformatMoney(moneyStr))}` : "Sin valor"}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button variant="bordered" color="danger" onPress={() => setOpen(false)}>Cancelar</Button>
                                        <Button color="primary" onPress={saveEdit}>Guardar</Button>
                                    </div>
                                </div>
                            </ModalFooter>
                        </CardBody>
                    </Card>
                </ModalContent>
            </Modal>
        </>
    );
}
