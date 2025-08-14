import axios from "axios";
import { apiCall } from "./client";

// ===== Tipos =====
export interface DatosRegistroVinculacion {
  state?: number;                 // 0..10
  rfc?: string;
  razonSocial?: string;
  telefono?: string;
  whatsapp?: string;
  email?: string;
  confirmaEmail?: string;
  personaConActividadesEmpresariales?: boolean;
  nombresRepLegal?: string;
  apellidoPaternoRepLegal?: string;
  apellidoMaternoRepLegal?: string;
  TipoContribuyente?: 0 | 1;      // 0: PM, 1: PF
}

export interface EstadoFinanciero {
  estado?: string | number | null;
  activoCortoPlazo?: number | null;
  pasivoCortoPlazo?: number | null;
  pasivoTotal?: number | null;
  capitalContable?: number | null;

  // Algunos backends exponen estos planos…
  pasivoCapital?: number | null;
  razonCirculante?: number | null;

  // …y/o dentro de un subobjeto 'razon'
  razon?: {
    circulante?: number | null;
    pasivoCapital?: number | null;
  } | null;
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

  // variantes que hemos visto
  executedBuro?: boolean | null;  // a veces viene así
  ejecutadoBuro?: boolean | null; // o así
  buroState?: number | null;           // 1 aceptado / 0 pendiente / -1 rechazado
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
  fechaFirma?: string | null;          // "2025/08/14" (además de signedAt)
  TipoContribuyente?: 0 | 1 | null;
  buroState?: number | null;           // 1 aceptado / 0 pendiente / -1 rechazado
  executedBuro?: boolean | null;
  detalleBuro?: string | null;
  foundSat?: boolean | null;
  foundEntidadesBloqueadas?: boolean | null;
  folio?: string | null;
  autorizacionBuro?: {
    id?: string;
    state?: number | null;             // 1 firmado
    fileSigned?: string | null;
    signedAt?: string | null;
  } | null;
}

export interface DatosExpedienteAzul {
  folder_id?: number | null;      // p.ej. 334062
  encrypted_id?: string | null;   // p.ej. "N2xQVGR2..."
}

export interface Cupos {
  cupoGlobal?: number | null;
}

export interface DetalleVinculacion {
  id?: string;
  state?: number;                      // 0..10 (score/estado)
  stateDescription?: string;
  status?: number;
  statusDescription?: string;
  fechaCreacion?: string;
  autorizacionSatws?: boolean | null;
  liquidezNecesaria?: number | null;

  datosRegistroVinculacion: DatosRegistroVinculacion;

  // Puede venir duplicado arriba; aquí lo dejamos como opcional
  datosAutorizacionBuro?: DatosAutorizacionBuro;

  datosExpedienteAzul?: DatosExpedienteAzul;

  datosAvalistas?: Avalista[] | null;

  // Puede venir plano aquí o arriba en el response
  estadoFinanciero?: EstadoFinanciero | null;
}

export interface DetalleVinculacionResponse {
  detalleVinculacion: DetalleVinculacion;

  // Duplicados que el backend a veces expone en la raíz:
  datosAutorizacionBuro?: DatosAutorizacionBuro;
  estadoFinanciero?: EstadoFinanciero | null;

  cupos?: Cupos;

  // Campos meta
  id?: null;
  token?: null;
  succeeded?: boolean;
  reasonCode?: { value: number; description: string };
  messages?: any[];
}

export async function getDetalleVinculacion(
  arg: { id: string; rfc: string }
): Promise<DetalleVinculacionResponse> {
  // Llamada con tu helper
  const id = arg.id.trim();
  const rfc = arg.rfc.trim().toUpperCase();

  const qs = new URLSearchParams({ id, rfc }).toString();
  const url = `/admin/Vinculacion/GetDetalleVinculacion?${qs}`;

  const res = await apiCall(url, {
    method: "POST",
    body: { id, rfc },
  });

  // En algunos proyectos apiCall devuelve { data: ... }.
  // En otros devuelve el JSON directamente. Hacemos un “unwrap” seguro.
  const json = (res as any)?.detalleVinculacion ? (res as DetalleVinculacionResponse)
            : (res as any)?.data ? ((res as any).data as DetalleVinculacionResponse)
            : (res as DetalleVinculacionResponse);

  if (!json?.detalleVinculacion) {
    throw new Error("Respuesta inválida: falta detalleVinculacion");
  }

  // Normalización suave (rellenar duplicados de la raíz hacia adentro)
  const dv = json.detalleVinculacion;
  const merged: DetalleVinculacion = {
    ...dv,
    datosRegistroVinculacion: dv.datosRegistroVinculacion ?? ({} as DatosRegistroVinculacion),
    datosAutorizacionBuro: dv.datosAutorizacionBuro ?? json.datosAutorizacionBuro,
    estadoFinanciero: dv.estadoFinanciero ?? json.estadoFinanciero,
  };

  return { ...json, detalleVinculacion: merged };
}