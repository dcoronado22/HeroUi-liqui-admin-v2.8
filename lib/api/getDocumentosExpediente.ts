import axios from "axios";
import { apiCall } from "./client";

// lib/api/getDocumentosExpediente.ts
export type ExpedienteDoc = {
  id: string;
  name: string;
  filesCount: number;
  status: "valid" | "invalid" | "observed" | "pending";
  url?: string | null; // url_pre
};

type Arg = { FolderId: string | number } | string | number;

export async function getDocumentosExpediente(
  arg: Arg
): Promise<ExpedienteDoc[]> {
  const payload =
    typeof arg === "object"
      ? { FolderId: String(arg.FolderId) }
      : { FolderId: String(arg) };

  const res = await apiCall("/vinculaciones/GetDocumentosExpediente", {
    method: "POST",
    body: payload,
  });
  const list: any[] = res?.payload?.document_list ?? [];

  const mapStatus = (s?: string): ExpedienteDoc["status"] => {
    const v = String(s || "").toLowerCase();
    if (v === "valid") return "valid";
    if (v.includes("obs")) return "observed";
    if (v.includes("pend")) return "pending";
    return "invalid";
  };

  return list.map((d, i) => ({
    id: String(d.document_id ?? i),
    name: String(d.name ?? `Documento ${i + 1}`),
    filesCount: Array.isArray(d.files) ? d.files.length : 0,
    status: mapStatus(d.status),
    url: d.url_pre ?? null,
  }));
}
