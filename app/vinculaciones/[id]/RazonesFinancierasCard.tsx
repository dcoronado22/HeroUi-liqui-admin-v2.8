"use client";

import React from "react";
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Chip,
    Skeleton,
    Input,
    Tooltip,
    Divider,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import {
    getDetalleVinculacion,
    type DetalleVinculacionResponse,
} from "@/lib/api/getDetalleVinculacion";
import {
    getRazonesDocsFlags,
    type RazonesDocsFlags,
} from "@/lib/api/valideDocsRazonesFinancieras";

// --------------------
// Helpers
// --------------------
type EF = {
    estado?: string | number | null;
    pasivoTotal?: number | null;
    pasivoCapital?: number | null;
    liquidezNecesaria?: number | null;
    activoCortoPlazo?: number | null;
    capitalContable?: number | null;
    pasivoCortoPlazo?: number | null;
    razonCirculante?: number | null;
};

const labelEstado = (v?: string | number | null) => {
    if (typeof v === "number") return v === 1 ? "Aprobado" : v === 0 ? "Pendiente" : "Observado";
    const s = String(v ?? "").toLowerCase();
    if (!s) return "—";
    if (s.includes("aprob")) return "Aprobado";
    if (s.includes("pend")) return "Pendiente";
    if (s.includes("observ")) return "Observado";
    return s[0].toUpperCase() + s.slice(1);
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="min-w-0">
        <div className="text-sm text-foreground-500">{label}</div>
        <div className="font-medium break-words">{children ?? "—"}</div>
    </div>
);

const fmtNum = (n?: number | null) =>
    typeof n === "number"
        ? new Intl.NumberFormat("es-MX", { style: "decimal", maximumFractionDigits: 0 }).format(n)
        : "—";

const unformatNumber = (s: string) => {
    const n = Number(String(s).replace(/[^\d.-]/g, ""));
    return Number.isFinite(n) ? n : 0;
};

// --------------------
// Componente
// --------------------
export default function RazonesFinancierasCard({ id }: { id: string }) {
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const [detalle, setDetalle] = React.useState<DetalleVinculacionResponse | null>(null);
    const [flags, setFlags] = React.useState<RazonesDocsFlags | null>(null);

    const [ef, setEf] = React.useState<EF | null>(null);
    const [form, setForm] = React.useState<EF | null>(null);
    const [editing, setEditing] = React.useState(false);

    const dirty = React.useMemo(
        () => JSON.stringify(ef) !== JSON.stringify(form),
        [ef, form]
    );

    React.useEffect(() => {
        let on = true;
        (async () => {
            try {
                setLoading(true);

                const [det, docs] = await Promise.all([
                    getDetalleVinculacion(id),
                    getRazonesDocsFlags(id),
                ]);

                if (!on) return;

                setDetalle(det);
                setFlags(docs);

                // —— mapeo del mock:
                //   • algunos campos vienen en det.estadoFinanciero (raíz)
                //   • pasivoCapital y razón circulante pueden venir en det.estadoFinanciero.razon
                //   • liquidezNecesaria viene en det.detalleVinculacion.liquidezNecesaria
                const raw = (det as any)?.estadoFinanciero
                    ?? (det as any)?.detalleVinculacion?.estadoFinanciero
                    ?? {};
                const razon = raw?.razon ?? {};

                const mapped: EF = {
                    estado: raw.estado ?? raw.Estado,
                    pasivoTotal: toNum(raw.pasivoTotal ?? raw.PasivoTotal),
                    activoCortoPlazo: toNum(raw.activoCortoPlazo ?? raw.ActivoCortoPlazo),
                    pasivoCortoPlazo: toNum(raw.pasivoCortoPlazo ?? raw.PasivoCortoPlazo),
                    capitalContable: toNum(raw.capitalContable ?? raw.CapitalContable),
                    pasivoCapital: toNum(raw.pasivoCapital ?? razon.pasivoCapital),
                    razonCirculante: toNum(raw.razonCirculante ?? razon.circulante),
                    liquidezNecesaria: toNum(
                        (det as any)?.detalleVinculacion?.liquidezNecesaria
                    ),
                };

                setEf(mapped);
                setForm(mapped);
            } catch (e: any) {
                setError(e?.message ?? "Error");
            } finally {
                on && setLoading(false);
            }
        })();
        return () => {
            on = false;
        };
    }, [id]);

    // helpers internos
    function toNum(v: any): number | undefined {
        if (v === null || v === undefined || v === "") return undefined;
        const n = Number(v);
        return Number.isFinite(n) ? n : undefined;
    }

    const setNum = (key: keyof EF) => (v: string) =>
        setForm((prev) => ({ ...(prev ?? {}), [key]: unformatNumber(v) }));

    const onCancel = () => {
        setForm(ef);
        setEditing(false);
    };

    const onSave = async () => {
        // TODO: PATCH real con `form`
        setEf(form);
        setEditing(false);
    };

    const onDownload = (which: "recent" | "historical") => {
        // TODO: integrar endpoint real
        console.log("Descargar", which);
    };
    const onDelete = (which: "recent" | "historical") => {
        // TODO: delete real + refrescar flags
        console.log("Eliminar", which);
    };

    // --------------------
    // Render
    // --------------------
    if (loading) {
        return (
            <Card shadow="sm">
                <CardHeader className="flex items-center justify-between">
                    <Skeleton className="h-6 w-48 rounded-md" />
                    <Skeleton className="h-6 w-20 rounded-md" />
                </CardHeader>
                <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-3 w-28 rounded-md" />
                            <Skeleton className="h-5 w-48 rounded-md" />
                        </div>
                    ))}
                </CardBody>
            </Card>
        );
    }

    if (error || !ef || !form || !flags) {
        return (
            <Card shadow="sm">
                <CardBody className="text-danger">{error ?? "Sin datos"}</CardBody>
            </Card>
        );
    }

    return (
        <>
            <Card shadow="sm" className="text-left px-5 py-2 dark:border-default-100 border border-default-200 shadow-xl shadow-black/20 dark:shadow-black/40">
                <CardHeader className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 justify-between">
                        <Icon icon="solar:shield-check-linear" className="text-xl" />
                        <div className="font-semibold">Datos Expediente Azul</div>
                    </div>
                    {!editing ? (
                        <Button
                            size="sm"
                            variant="light"
                            startContent={<Icon icon="solar:pen-linear" />}
                            onPress={() => setEditing(true)}
                        >
                            Editar
                        </Button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button variant="bordered" size="sm" onPress={onCancel}>
                                Cancelar
                            </Button>
                            <Button color="primary" size="sm" isDisabled={!dirty} onPress={onSave}>
                                Guardar
                            </Button>
                        </div>
                    )}
                </CardHeader>
                <Divider className="my-2" />
                <CardBody className="space-y-6">
                    {/* Datos */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Col 1 */}
                        <Field label="Estado">
                            <Chip size="sm" variant="flat">{labelEstado(form.estado)}</Chip>
                        </Field>

                        <Field label="Activo Corto Plazo">
                            {!editing ? (
                                fmtNum(form.activoCortoPlazo)
                            ) : (
                                <Input
                                    size="sm"
                                    defaultValue={String(form.activoCortoPlazo ?? "")}
                                    onValueChange={setNum("activoCortoPlazo")}
                                />
                            )}
                        </Field>

                        <Field label="Pasivo Corto Plazo">
                            {!editing ? (
                                fmtNum(form.pasivoCortoPlazo)
                            ) : (
                                <Input
                                    size="sm"
                                    defaultValue={String(form.pasivoCortoPlazo ?? "")}
                                    onValueChange={setNum("pasivoCortoPlazo")}
                                />
                            )}
                        </Field>

                        {/* Col 2 */}
                        <Field label="Pasivo Total">
                            {!editing ? (
                                fmtNum(form.pasivoTotal)
                            ) : (
                                <Input
                                    size="sm"
                                    defaultValue={String(form.pasivoTotal ?? "")}
                                    onValueChange={setNum("pasivoTotal")}
                                />
                            )}
                        </Field>

                        <Field label="Capital Contable">
                            {!editing ? (
                                fmtNum(form.capitalContable)
                            ) : (
                                <Input
                                    size="sm"
                                    defaultValue={String(form.capitalContable ?? "")}
                                    onValueChange={setNum("capitalContable")}
                                />
                            )}
                        </Field>

                        <Field label="Razón Circulante">
                            {!editing ? (
                                fmtNum(form.razonCirculante)
                            ) : (
                                <Input
                                    size="sm"
                                    defaultValue={String(form.razonCirculante ?? "")}
                                    onValueChange={setNum("razonCirculante")}
                                />
                            )}
                        </Field>

                        {/* Col 3 */}
                        <Field label="Pasivo Capital">
                            {!editing ? (
                                fmtNum(form.pasivoCapital)
                            ) : (
                                <Input
                                    size="sm"
                                    defaultValue={String(form.pasivoCapital ?? "")}
                                    onValueChange={setNum("pasivoCapital")}
                                />
                            )}
                        </Field>

                        {/* Liquidez necesaria (solo lectura SIEMPRE) */}
                        <div className="md:col-span-2">
                            <div className="text-sm text-foreground-500 mb-1">Liquidez necesaria</div>
                            <Chip size="sm" color="success" variant="flat">
                                {fmtNum(form.liquidezNecesaria)}
                            </Chip>
                        </div>
                    </div>

                    {/* Estados financieros */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Últimos 3 meses */}
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-foreground-500">
                                Estados financieros últimos 3 meses:
                            </span>
                            {flags.hasRecentDocuments ? (
                                <div className="flex items-center gap-2">
                                    <Tooltip content="Descargar">
                                        <Button
                                            size="sm"
                                            variant="flat"
                                            onPress={() => onDownload("recent")}
                                            startContent={
                                                <Icon
                                                    icon="solar:download-minimalistic-linear"
                                                    className="text-lg"
                                                />
                                            }
                                        >
                                        </Button>
                                    </Tooltip>
                                    <Tooltip content="Eliminar">
                                        <Button
                                            size="sm"
                                            color="danger"
                                            variant="flat"
                                            onPress={() => onDelete("recent")}
                                            startContent={
                                                <Icon
                                                    icon="solar:trash-bin-minimalistic-linear"
                                                    className="text-lg"
                                                />
                                            }
                                        />
                                    </Tooltip>
                                </div>
                            ) : (
                                <span className="text-foreground-500">Sin documento</span>
                            )}
                        </div>

                        {/* Últimos 2 años */}
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-foreground-500">
                                Estados financieros últimos 2 años:
                            </span>
                            {flags.hasHistoricalDocuments ? (
                                <div className="flex items-center gap-2">
                                    <Tooltip content="Descargar">
                                        <Button
                                            size="sm"
                                            variant="flat"
                                            onPress={() => onDownload("historical")}
                                            startContent={
                                                <Icon
                                                    icon="solar:download-minimalistic-linear"
                                                    className="text-lg"
                                                />
                                            }
                                        >
                                        </Button>
                                    </Tooltip>
                                    <Tooltip content="Eliminar">
                                        <Button
                                            size="sm"
                                            color="danger"
                                            variant="flat"
                                            onPress={() => onDelete("historical")}
                                            startContent={
                                                <Icon
                                                    icon="solar:trash-bin-minimalistic-linear"
                                                    className="text-lg"
                                                />
                                            }
                                        />
                                    </Tooltip>
                                </div>
                            ) : (
                                <span className="text-foreground-500">Sin documento</span>
                            )}
                        </div>
                    </div>
                </CardBody>
            </Card >
        </>
    );
}