export type DocItem = { id: string; label: string; url: string; ext: string | null };

function guessExtFromUrl(u?: string | null): string | null {
  if (!u) return null;
  try {
    const p = new URL(u).pathname;
    const last = p.split("/").pop() || "";
    const name = last.split("?")[0];
    const parts = name.split(".");
    if (parts.length < 2) return null;
    return parts.pop()!.toLowerCase();
  } catch {
    return null;
  }
}

export async function getDocumentosDetalle(vinculacionId: string): Promise<DocItem[]> {
  // Lee el mock desde /public (cámbialo por axios luego)
  const res = await fetch("/mock/GetDocumentosDetalle.json", { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudieron cargar los documentos");
  const json = await res.json();

  const src: any[] = json?.documentos ?? [];
  return src.map((x, i) => ({
    id: String(x.id ?? i),
    label: String(x.label ?? `Documento ${i + 1}`),
    url: String(x.url ?? ""),
    ext: guessExtFromUrl(x.url),
  }));
  }