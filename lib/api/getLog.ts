// lib/api/getLog.ts
"use client";

import apiClient from "@/lib/api/client"; // <-- tu instancia axios con interceptores
// Si prefieres, cambia la ruta del import según dónde tengas el client

// ===============
// Raw API types (tal como vienen del backend)
// ===============
export type RawLogItem = {
  id: string;
  serviceName: string;
  startedOn: string;     // ISO
  finishedOn: string;    // ISO
  operationId: string;
  correlationId: string;
  succeeded: boolean;
  reasonCode: number;
  reason: string;
  messages: string;
  text: string;
};

export type RawDocumentItem = {
  name: string;
  path: string;
  lastModified: string; // ISO
};

export type RawDocumentGroup = {
  integradorName: string; // p. ej. "miFiel"
  documents: RawDocumentItem[];
};

export type RawGetLogResponse = {
  logs: RawLogItem[];
  documents: RawDocumentGroup[];
  id: string | null;
  token: string | null;
  succeeded: boolean;
  reasonCode: { value: number; description: string };
  messages: unknown[];
};

// ===============
// DTOs para la UI (LogsViewerModal)
// ===============
export type LogRowDTO = {
  service: string;
  startAt: string | Date;
  endAt: string | Date;
  status: string; // "Exitoso" | "Fallido" | ...
  reason?: string;
};

export type DocumentFileDTO = {
  name: string;
  updatedAt: string | Date;
  path: string;
};

export type DocumentGroupDTO = {
  provider: string; // integradorName
  files: DocumentFileDTO[];
  defaultOpen?: boolean;
};

export type GetLogPayload = { Id: string; Modulo: number }; // Modulo: 1 = vinculacion

// ===============
// Endpoint
// ===============
// Ajusta el path si tu backend usa otra ruta (p.ej. "/admin/Vinculacion/GetLog").
const GET_LOG_PATH = "/admin/Operacion/GetLog";

// Para facilitar pruebas locales:
// NEXT_PUBLIC_USE_LOGS_MOCK=1 -> fuerza a usar el JSON de /mock
const USE_MOCK =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_USE_LOGS_MOCK === "1";

// ===============
// Fetchers
// ===============
export async function getLog(
  id: string,
  modulo: number = 1,
  opts?: { signal?: AbortSignal }
): Promise<RawGetLogResponse> {
  if (USE_MOCK) {
    const res = await fetch("/mock/GetLogMock.json", {
      cache: "no-store",
      signal: opts?.signal,
    });
    if (!res.ok) throw new Error("No se pudo cargar logs (mock)");
    const data = (await res.json()) as RawGetLogResponse;
    return normalizeRawGetLogResponse(data);
  }

  // Llamada real (POST) con payload { Id, Modulo }
  const payload: GetLogPayload = { Id: id, Modulo: modulo };
  const { data } = await apiClient.post<RawGetLogResponse>(GET_LOG_PATH, payload, {
    signal: opts?.signal,
  });

  return normalizeRawGetLogResponse(data);
}

// Asegura la estructura por si el backend o el mock varían
function normalizeRawGetLogResponse(data: Partial<RawGetLogResponse>): RawGetLogResponse {
  return {
    logs: Array.isArray(data?.logs) ? data!.logs : [],
    documents: Array.isArray(data?.documents) ? data!.documents : [],
    id: data?.id ?? null,
    token: data?.token ?? null,
    succeeded: Boolean(data?.succeeded),
    reasonCode: data?.reasonCode ?? { value: 0, description: "" },
    messages: Array.isArray(data?.messages) ? (data!.messages as unknown[]) : [],
  };
}

// ===============
// Adapters a DTOs de la UI
// ===============
export function mapLogsToRows(resp: RawGetLogResponse): LogRowDTO[] {
  return (resp.logs ?? []).map((l) => ({
    service: l.serviceName,
    startAt: l.startedOn,
    endAt: l.finishedOn,
    status: l.succeeded ? "Exitoso" : "Fallido",
    reason: l.reason || l.text || undefined,
  }));
}

export function mapDocumentsToGroups(resp: RawGetLogResponse): DocumentGroupDTO[] {
  return (resp.documents ?? []).map((g) => ({
    provider: g.integradorName,
    files: (g.documents ?? []).map((d) => ({
      name: d.name,
      updatedAt: d.lastModified,
      path: d.path,
    })),
  }));
}

// ===============
// Helpers (búsqueda / paginado en cliente)
// ===============
export function filterLogs(rows: LogRowDTO[], query: string): LogRowDTO[] {
  const q = query.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter((r) =>
    `${r.service} ${r.status} ${r.reason ?? ""}`.toLowerCase().includes(q)
  );
}

export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const p = Math.max(1, page | 0);
  const ps = Math.max(1, pageSize | 0);
  const start = (p - 1) * ps;
  return items.slice(start, start + ps);
}

// ===============
// Azúcar para el modal
// ===============
export async function getLogForModal(options: {
  id: string;
  modulo?: number;
  query?: string;
  page?: number;
  pageSize?: number;
  signal?: AbortSignal;
}): Promise<{ logs: LogRowDTO[]; documents: DocumentGroupDTO[] }> {
  const { id, modulo = 1, query = "", page = 1, pageSize = 50, signal } = options;
  const raw = await getLog(id, modulo, { signal });

  let rows = mapLogsToRows(raw);
  rows = filterLogs(rows, query);
  rows = paginate(rows, page, pageSize);

  const groups = mapDocumentsToGroups(raw);
  return { logs: rows, documents: groups };
}