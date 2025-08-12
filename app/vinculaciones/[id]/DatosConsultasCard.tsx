"use client";

import React from "react";
import {
    Card, CardBody, CardHeader, Skeleton, Input, Button, Chip,
    Modal, ModalContent, ModalHeader, ModalBody,
    Divider
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { getDocumentosDetalle, DocItem } from "@/lib/api/getDocumentosDetalle";

const isPreviewable = (ext?: string | null) =>
    !!ext && ["pdf", "png", "jpg", "jpeg", "webp", "gif"].includes(ext);

const iconFor = (ext?: string | null) => {
    if (!ext) return "solar:document-linear";
    if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext)) return "solar:image-linear";
    if (ext === "pdf") return "solar:file-pdf-linear";
    return "solar:document-linear";
};

export default function DatosConsultasCard({ id }: { id: string }) {
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [docs, setDocs] = React.useState<DocItem[]>([]);
    const [q, setQ] = React.useState("");
    const [preview, setPreview] = React.useState<DocItem | null>(null);

    React.useEffect(() => {
        let on = true;
        (async () => {
            try {
                setLoading(true);
                const r = await getDocumentosDetalle(id);
                if (on) setDocs(r);
            } catch (e: any) {
                setError(e?.message ?? "Error");
            } finally {
                if (on) setLoading(false);
            }
        })();
        return () => { on = false; };
    }, [id]);

    const filtered = docs.filter(d => d.label.toLowerCase().includes(q.toLowerCase()));

    const download = (d: DocItem) => {
        const a = document.createElement("a");
        a.href = d.url;
        a.download = d.label;
        a.target = "_blank";
        a.click();
    };

    return (
        <>
            {/* Header */}
            <Card shadow="sm" className="text-left px-5 py-2 mb-5 dark:border-default-100 border border-default-100 shadow-xl shadow-black/20 dark:shadow-black/40">
                <CardHeader className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Icon icon="solar:shield-check-linear" className="text-xl" />
                        <div className="font-semibold">Datos Consultas</div>
                        {!!docs.length && (
                            <Chip size="sm" variant="flat">{docs.length}</Chip>
                        )}
                    </div>
                    <Input
                        size="sm"
                        className="w-full md:w-72"
                        placeholder="Buscar documento…"
                        startContent={<Icon icon="solar:magnifier-linear" />}
                        value={q}
                        onValueChange={setQ}
                    />
                </CardHeader>
                <Divider className="my-2" />
                <CardBody>
                    <div className="flex items-center gap-2">
                        {/* Grid */}
                        {loading ? (
                            <Card shadow="sm" className="mt-3">
                                <CardHeader><Skeleton className="h-5 w-40 rounded-md" /></CardHeader>
                                <CardBody className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <Skeleton key={i} className="h-32 rounded-xl" />
                                    ))}
                                </CardBody>
                            </Card>
                        ) : error ? (
                            <Card shadow="sm" className="mt-3"><CardBody className="text-danger">{error}</CardBody></Card>
                        ) : (
                            <div className="space-y-8 w-full">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                                    {filtered.map((d) => (
                                        <Card
                                            key={d.id}
                                            shadow="lg"
                                            className="text-left hover:shadow-xl transition-shadow"
                                        >
                                            <CardBody className="flex flex-col gap-3">
                                                <div className="flex items-start justify-between">
                                                    <Icon icon={iconFor(d.ext)} className="text-2xl" />
                                                    <Chip size="sm" variant="shadow" color="primary">{(d.ext ?? "DOC").toUpperCase()}</Chip>
                                                </div>
                                                <div className="font-medium leading-snug line-clamp-2 min-h-[2.5rem]">
                                                    {d.label}
                                                </div>

                                                <div className="mt-1 flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="flat"
                                                        color="primary"
                                                        startContent={<Icon icon="solar:eye-linear" />}
                                                        isDisabled={!isPreviewable(d.ext)}
                                                        onPress={() => setPreview(d)}
                                                    >
                                                        Ver
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="flat"
                                                        color="primary"
                                                        startContent={<Icon icon="solar:download-linear" />}
                                                        onPress={() => download(d)}
                                                    >
                                                        Descargar
                                                    </Button>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    ))}
                                    {!filtered.length && (
                                        <Card shadow="sm"><CardBody className="text-foreground-500">Sin resultados.</CardBody></Card>
                                    )}
                                </div>
                                {/* Preview modal (solo PDF/imagen) */}
                                <Modal isOpen={!!preview} onOpenChange={() => setPreview(null)} size="3xl" scrollBehavior="inside">
                                    <ModalContent>
                                        <ModalHeader className="flex items-center gap-2">
                                            <Icon icon={iconFor(preview?.ext)} className="text-xl" />
                                            {preview?.label}
                                        </ModalHeader>
                                        <ModalBody className="p-0">
                                            {preview?.ext === "pdf" ? (
                                                <iframe src={preview.url} className="w-full h-[70vh]" />
                                            ) : ["png", "jpg", "jpeg", "webp", "gif"].includes(preview?.ext || "") ? (
                                                // Puedes cambiar por <Image /> de HeroUI si prefieres
                                                <img src={preview!.url} alt={preview!.label} className="w-full h-auto" />
                                            ) : (
                                                <div className="p-6 text-sm text-foreground-500">
                                                    No se puede previsualizar este tipo de archivo. Usa “Descargar”.
                                                </div>
                                            )}
                                        </ModalBody>
                                    </ModalContent>
                                </Modal>
                            </div>
                        )}
                    </div>
                </CardBody>
            </Card>
        </>
    );
}