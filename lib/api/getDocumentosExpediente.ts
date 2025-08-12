// lib/api/getDocumentosExpediente.ts
export type ExpedienteDoc = {
    id: string;
    name: string;
    filesCount: number;
    status: "valid" | "invalid" | "observed" | "pending";
    url?: string | null; // url_pre
  };
  
  export async function getDocumentosExpediente(vinculacionId: string): Promise<ExpedienteDoc[]> {
    const res = await fetch("/mock/GetDocumentosExpedienteMock.json", { cache: "no-store" });
    if (!res.ok) throw new Error("No se pudo cargar el expediente");
    const json = await res.json();
  
    const list: any[] = json?.payload?.document_list ?? [];
    const mapStatus = (s?: string): ExpedienteDoc["status"] => {
      const v = (s || "").toLowerCase();
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