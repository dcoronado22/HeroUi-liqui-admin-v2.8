import axios from "axios";
import { apiCall } from "./client";
import { getFileExt } from "../helpers/file";

export type DocItem = {
  id: string;
  label: string;
  url: string;
  ext: string | null;
};

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

export async function getDocumentosDetalle(arg: {
  id: string;
  rfc: string;
}): Promise<DocItem[]> {
  const payload = Array.isArray(arg) ? { id: arg[0], rfc: arg[1] } : arg;

  const id = arg.id.trim();
  const rfc = arg.rfc.trim().toUpperCase();

  const qs = new URLSearchParams({ id, rfc }).toString();
  const url = `/admin/Vinculacion/GetDocumentosDetalle?${qs}`;

  const res = await apiCall(url, {
    method: "POST",
    body: { id, rfc },
  });

  const src: any[] = res?.documentos ?? [];
  return src.map((x: any, i: number) => {
    const label = String(x.label ?? `Documento ${i + 1}`);
    const url = String(x.url ?? "");
    // prioridad: ext por URL firmada; si no, por label
    const ext = getFileExt(url) ?? getFileExt(label);
    return {
      id: String(x.id ?? i),
      label,
      url,
      ext,
    };
  });
}
