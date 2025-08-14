import apiClient from "@/lib/api/client";

export type RoleApi = {
  roleId: string;
  roleKey: string;
  roleName: string;
};

export type UsuarioApi = {
  id: string;
  userName: string;
  name: string;
  email: string;
  principalId: string;
  roles: RoleApi[];
};

export type GetUsuariosResponse = {
  usuarios: UsuarioApi[];
  id: string | null;
  token: string | null;
  succeeded: boolean;
  reasonCode: { value: number; description: string };
  messages: unknown[];
};


export async function getUsuarios(): Promise<UsuarioApi[]> {
  const { data } = await apiClient.post<GetUsuariosResponse>(
    "admin/Usuarios/GetUsuarios",
    {} 
  );

  return Array.isArray(data?.usuarios) ? data.usuarios : [];
}