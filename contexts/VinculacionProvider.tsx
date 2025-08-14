"use client";

import * as React from "react";
import { getDetalleVinculacion } from "@/lib/api/getDetalleVinculacion";
import { getDocumentosExpediente } from "@/lib/api/getDocumentosExpediente";
import { getDocumentosDetalle } from "@/lib/api/getDocumentosDetalle";
import { valideDocsRazonesFinancieras } from "@/lib/api/valideDocsRazonesFinancieras";

// Tipos (puedes refinar con los de tus fetchers)
type DetalleResp = Awaited<ReturnType<typeof getDetalleVinculacion>>;
type DocsExpResp = Awaited<ReturnType<typeof getDocumentosExpediente>>;
type DocsDetResp = Awaited<ReturnType<typeof getDocumentosDetalle>>;
type RazonesValResp = Awaited<ReturnType<typeof valideDocsRazonesFinancieras>>;

export type VinculacionKey = { id: string; rfc: string };

type Ctx = {
    key: VinculacionKey;
    loading: boolean;
    error: string | null;

    // Datos base (GetDetalleVinculacion)
    raw?: DetalleResp;
    detalle?: DetalleResp["detalleVinculacion"];

    // Lazy dependientes (se resuelven bajo demanda)
    documentosExpediente?: DocsExpResp | null;
    documentosDetalle?: DocsDetResp | null;
    razonesValidadas?: RazonesValResp | null;

    reload(): Promise<void>;
    loadDocumentosExpediente(): Promise<DocsExpResp | null>;
    loadDocumentosDetalle(): Promise<DocsDetResp | null>;
    loadRazonesValidadas(): Promise<RazonesValResp | null>;
};

const VinculacionContext = React.createContext<Ctx | null>(null);

export function useVinculacion() {
    const ctx = React.useContext(VinculacionContext);
    if (!ctx) throw new Error("useVinculacion must be used inside <VinculacionProvider>");
    return ctx;
}

export function VinculacionProvider({
    children,
    id,
    rfc,
    prefetch = false, // si quieres disparar algunos dependientes al montar
}: {
    children: React.ReactNode;
    id: string;
    rfc: string;
    prefetch?: boolean;
}) {
    const key = React.useMemo(() => ({ id: id.trim(), rfc: rfc.trim().toUpperCase() }), [id, rfc]);

    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [raw, setRaw] = React.useState<DetalleResp | undefined>();
    const detalle = raw?.detalleVinculacion;

    const [documentosExpediente, setDocumentosExpediente] = React.useState<DocsExpResp | null>(null);
    const [documentosDetalle, setDocumentosDetalle] = React.useState<DocsDetResp | null>(null);
    const [razonesValidadas, setRazonesValidadas] = React.useState<RazonesValResp | null>(null);

    const reload = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const resp = await getDetalleVinculacion({ id: key.id, rfc: key.rfc });
            setRaw(resp);
        } catch (e: any) {
            setError(e?.message ?? "No se pudo cargar el detalle");
        } finally {
            setLoading(false);
        }
    }, [key.id, key.rfc]);

    // Lazy loaders
    const loadDocumentosExpediente = React.useCallback(async () => {
        try {
            const folderId = raw?.detalleVinculacion?.datosExpedienteAzul?.folder_id;
            if (!folderId) return null;
            if (documentosExpediente) return documentosExpediente; // cache
            const resp = await getDocumentosExpediente({ FolderId: String(folderId) });
            setDocumentosExpediente(resp);
            return resp;
        } catch {
            return null;
        }
    }, [raw, documentosExpediente]);

    const loadDocumentosDetalle = React.useCallback(async () => {
        try {
            if (documentosDetalle) return documentosDetalle; // cache
            const resp = await getDocumentosDetalle({ id: key.id, rfc: key.rfc });
            setDocumentosDetalle(resp);
            return resp;
        } catch {
            return null;
        }
    }, [key.id, key.rfc, documentosDetalle]);

    const loadRazonesValidadas = React.useCallback(async () => {
        try {
            if (razonesValidadas) return razonesValidadas; // cache
            const resp = await valideDocsRazonesFinancieras({ id: key.id, rfc: key.rfc });
            setRazonesValidadas(resp);
            return resp;
        } catch {
            return null;
        }
    }, [key.id, key.rfc, razonesValidadas]);

    // Primer fetch (único) del detalle
    React.useEffect(() => {
        if (!key.id || !key.rfc) {
            setError("Falta id o rfc para abrir el detalle");
            setLoading(false);
            return;
        }
        (async () => {
            await reload();
            if (prefetch) {
                // Opcional: dispara algunos dependientes
                void loadDocumentosExpediente();
                void loadDocumentosDetalle();
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key.id, key.rfc]);

    const value: Ctx = {
        key,
        loading,
        error,
        raw,
        detalle,
        documentosExpediente,
        documentosDetalle,
        razonesValidadas,
        reload,
        loadDocumentosExpediente,
        loadDocumentosDetalle,
        loadRazonesValidadas,
    };

    return <VinculacionContext.Provider value={value}>{children}</VinculacionContext.Provider>;
}
