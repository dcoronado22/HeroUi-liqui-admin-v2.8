import { apiCall } from "@/lib/api/client";

export type RfcBloqueadoApi = {
  rfc: string;
  tipoContribuyente: 0 | 1; // 0: Moral, 1: Física
  razonSocial: string;
  nombrePersona: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombre: string; // viene armado en algunos casos
  comentarios: string;
  estado: boolean; // true = BLOQUEADO, false = NO bloqueado
  fechaModificacion: string; // ISO
};

export async function getRfcBloqueados(): Promise<RfcBloqueadoApi[]> {
  const res = await apiCall("/admin/Configuracion/GetRfcBloqueados", {
    method: "POST",
    body: {},
  });
  return Array.isArray(res?.rfcBloqueados) ? (res.rfcBloqueados as RfcBloqueadoApi[]) : [];
}
