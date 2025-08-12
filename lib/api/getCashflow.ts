// lib/api/getCashflow.ts
export type CashflowRow = {
    year: number;
    month: number; // 1..12
    in: number;    // ingresos
    out: number;   // egresos
    amount?: number;
  };
  
  export async function getCashflow(vinculacionId: string): Promise<CashflowRow[]> {
    const res = await fetch("/mock/cashflow.json", { cache: "no-store" });
    if (!res.ok) throw new Error("No se pudo cargar cashflow");
    const data = (await res.json()) as CashflowRow[];
    return Array.isArray(data) ? data : [];
  }