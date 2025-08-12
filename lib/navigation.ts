import { IconifyIcon } from "@iconify/react";

export type NavItem = {
    name: string;
    href: string;
    icon: string; // icon name for @iconify/react
};

export type NavSection = {
    title: string;
    items: NavItem[];
};

export const navSections: NavSection[] = [
    {
        title: "PRINCIPAL",
        items: [
            { name: "Home", href: "/", icon: "solar:home-2-line-duotone" },
            { name: "Dashboard", href: "/dashboard", icon: "solar:chart-2-line-duotone" },
        ],
    },
    {
        title: "OPERATIVO",
        items: [
            { name: "Vinculaciones", href: "/vinculaciones", icon: "solar:table-add-line-duotone" },
            { name: "Operaciones", href: "/operaciones", icon: "solar:table-line-duotone" },
        ],
    },
    {
        title: "ADMINISTRACIÓN",
        items: [
            { name: "Usuarios", href: "/admin/usuarios", icon: "solar:user-linear" },
            { name: "Roles", href: "/admin/roles", icon: "solar:shield-check-linear" },
            { name: "Empresas", href: "/admin/empresas", icon: "solar:document-linear" },
            { name: "Alianzas", href: "/admin/alianzas", icon: "solar:users-group-two-rounded-linear" },
        ],
    },
    {
        title: "CONSULTAS",
        items: [
            { name: "Listas Bloqueantes", href: "/consultas/listas-bloqueantes", icon: "solar:no-entry-triangle-linear" },
        ],
    },
];
