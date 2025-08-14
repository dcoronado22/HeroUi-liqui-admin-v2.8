import { apiCall } from "@/lib/api/client";

// ===== RAW desde backend =====
export type EmpresaApi = {
  id: number;
  tipoContribuyente: number;
  rfc: string;
  razonSocial: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  personaConActividadesEmpresarialges: boolean;
  datosExpedienteAzul?: { idExpediente: string; idCarpeta: string };
  representanteLegal?: {
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    correo: string;
  };
  direccion?: {
    telefono: string;
    calle: string;
    numeroExterior: string;
    numeroInterior: string;
    colonia: string;
    municipio: string;
    ciudad: string;
    estado: string;
    codigoPostal: string;
  };
  avalistas?: unknown[];
  actividadEconomica?: string;
  nacionalidad?: string;
  fechaCreacion: string; // ISO
};

export async function getEmpresas(): Promise<EmpresaApi[]> {
  const res = await apiCall("/admin/Empresas/GetEmpresas", {
    method: "POST",
    body: {}, // payload vacío
  });
  return Array.isArray(res?.empresas) ? (res.empresas as EmpresaApi[]) : [];
}
