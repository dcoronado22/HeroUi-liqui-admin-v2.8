// lib/api/valideDocsRazonesFinancieras.ts
export type RazonesDocsFlags = {
    hasRecentDocuments: boolean;
    hasHistoricalDocuments: boolean;
  };
  
  export async function getRazonesDocsFlags(vinculacionId: string): Promise<RazonesDocsFlags> {
    const res = await fetch("/mock/ValideDocsRazonesFinancierasMock.json", { cache: "no-store" });
    if (!res.ok) throw new Error("No se pudo validar documentos de razones");
    const json = await res.json();
    return {
      hasRecentDocuments: Boolean(json?.hasRecentDocuments),
      hasHistoricalDocuments: Boolean(json?.hasHistoricalDocuments),
    };
  }