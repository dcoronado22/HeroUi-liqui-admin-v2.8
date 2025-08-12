// lib/api/getDetalleVinculacion.ts

// ===== Tipos =====
export interface DatosRegistroVinculacion {
  state?: number;                 // 0..10
  rfc?: string;
  razonSocial?: string;
  telefono?: string;
  whatsapp?: string;
  email?: string;
  nombresRepLegal?: string;
  apellidoPaternoRepLegal?: string;
  apellidoMaternoRepLegal?: string;
  TipoContribuyente?: 0 | 1;      // 0: PM, 1: PF
}

export interface EstadoFinanciero {
  estado?: string | number | null;
  pasivoTotal?: number | null;
  pasivoCapital?: number | null;
  liquidezNecesaria?: number | null;
  activoCortoPlazo?: number | null;
  capitalContable?: number | null;
  pasivoCortoPlazo?: number | null;
  razonCirculante?: number | null;
}

export interface Avalista {
  id?: string | number;
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  nombreCompleto?: string;
  rfc?: string;
  numeroExterior?: string | number | null;
  numeroInterior?: string | number | null;
  municipio?: string | null;
  ciudad?: string | null;
  codigoPostal?: string | number | null;
  estado?: string | null;
  colonia?: string | null;
  calle?: string | null;
  email?: string | null;               // envío firma autorización
  fechaFirma?: string | null;
  patrimonioLiquido?: number | null;
  detalleBuro?: string | null;
  executedBuro?: boolean | null;
  buroState?: number | null;           // 1 aceptado / -1 rechazado / 0 pendiente
  firmaDocumento?: number | null;      // 1 firmado
  autorizacionBuro?: { state?: number | null } | null;
}

export interface DatosAutorizacionBuro {
  telefono?: string | null;
  email?: string | null;
  calle?: string | null;
  numeroExterior?: string | null;
  numeroInterior?: string | null;
  colonia?: string | null;
  municipio?: string | null;
  ciudad?: string | null;
  estado?: string | null;
  codigoPostal?: string | null;
  actividadPrincipal?: string | null;
  TipoContribuyente?: 0 | 1 | null;
  buroState?: number | null;           // 1 aceptado / 0 pendiente / -1 rechazado
  executedBuro?: boolean | null;
  detalleBuro?: string | null;
  folio?: string | null;
  autorizacionBuro?: {
    id?: string;
    state?: number | null;             // 1 firmado
    fileSigned?: string | null;
    signedAt?: string | null;
  } | null;
}

export interface DetalleVinculacion {
  state?: number;                      // 0..10 (score general)
  datosRegistroVinculacion: DatosRegistroVinculacion;
  datosAvalistas?: Avalista[];         // “detalleVinculacion.datosAvalistas”
  estadoFinanciero?: EstadoFinanciero; // “detalleVinculacion.estadoFinanciero”
}

export interface DetalleVinculacionResponse {
  detalleVinculacion: DetalleVinculacion;
  datosAutorizacionBuro?: DatosAutorizacionBuro; // según tu mock puede venir aquí
  // ...otros campos del mock si existen
}

// ===== Fetcher (mock) =====
export async function getDetalleVinculacion(
  vinculacionId: string
): Promise<DetalleVinculacionResponse> {
  // MOCK desde /public; reemplaza por axios cuando tengas el endpoint real
  const res = await fetch("/mock/GetDetalleVinculacionMock.json", { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudo cargar DetalleVinculacion");
  const json = await res.json();
  return json as DetalleVinculacionResponse;
}

/* Ejemplo de uso:
import { getDetalleVinculacion } from "@/lib/api/getDetalleVinculacion";

const data = await getDetalleVinculacion(id);
const ef = data.detalleVinculacion.estadoFinanciero;
const avales = data.detalleVinculacion.datosAvalistas;
const registro = data.detalleVinculacion.datosRegistroVinculacion;
const buro = data.datosAutorizacionBuro;
*/