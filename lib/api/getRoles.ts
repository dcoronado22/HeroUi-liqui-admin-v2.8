import { apiCall } from "@/lib/api/client"; 

export type RoleRecordApi = {
  id: string;
  roleKey: string;
  roleName: string;
  permisos: string; 
};

export async function getRoles(): Promise<RoleRecordApi[]> {
  const res = await apiCall("/admin/Roles/GetRoles", {
    method: "POST",
    body: {}, 
  });
  const list = Array.isArray(res?.roles) ? res.roles : [];
  return list as RoleRecordApi[];
}
