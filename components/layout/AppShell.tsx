"use client";

import React from "react";
import SidebarDrawer from "@/components/layout/Sidebar/sidebarDrawer";
import SidebarPanel from "@/components/layout/SidebarPanel";
import HeaderBar from "@/components/layout/HeaderBar";
import { useMediaQuery } from "usehooks-ts";

export default function AppShell({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const [isSearchOpen, setIsSearchOpen] = React.useState(false);
    const isMobile = useMediaQuery("(max-width: 768px)");

    return (
        // 👇 contenedor base con fondo del tema y relativo para posicionar los glows
        <div className="relative flex h-dvh w-full bg-background overflow-hidden">
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div
                    className="absolute -top-40 -left-48 w-[60vw] h-[60vw] rounded-full blur-3xl opacity-25"
                    style={{
                        background:
                            "radial-gradient(circle, hsl(var(--heroui-primary)) 0%, transparent 65%)",
                    }}
                />
                <div
                    className="absolute bottom-[-20vh] right-[-20vw] w-[50vw] h-[50vw] rounded-full blur-3xl opacity-20"
                    style={{
                        background:
                            "radial-gradient(circle, hsl(var(--heroui-primary)) 0%, transparent 70%)",
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/20" />
            </div>

            {/* Drawer móvil */}
            <div hidden={!isMobile}>
                <SidebarDrawer
                    className="border-r-small! border-divider shadow-[12px_0_28px_-12px_rgba(0,0,0,0.45)]"
                    isOpen={isOpen}
                    onOpenChange={(open) => setIsOpen(open)}
                >
                    <SidebarPanel isCollapsed={false} />
                </SidebarDrawer>
            </div>

            {/* Sidebar fijo desktop */}
            <aside
                className={[
                    "sticky top-0 hidden h-dvh transition-all duration-300 sm:flex",
                    "shadow-[8px_0_12px_-6px_rgba(0,0,0,0.15)] dark:shadow-[5px_0_14px_-6px_rgba(0,0,0,0.25)]",
                    isCollapsed ? "w-20" : "w-60",
                ].join(" ")}
            >
                <SidebarPanel isCollapsed={isCollapsed} />
            </aside>

            {/* CONTENIDO */}
            <div className="w-full flex-1 flex flex-col min-w-0 p-4 overflow-hidden">
                <div className="w-full flex-shrink-0">
                    <HeaderBar
                        isCollapsed={isCollapsed}
                        onToggleCollapse={() => setIsCollapsed((v) => !v)}
                        onOpenMobile={() => setIsOpen(true)}
                        isSearchOpen={isSearchOpen}
                        onToggleSearch={() => setIsSearchOpen((v) => !v)}
                    />
                </div>
                <main className="mt-4 w-full flex-1 min-h-0 overflow-auto rounded-medium border border-divider bg-background shadow-lg shadow-black/25">
                    {children}
                </main>
            </div>
        </div>
    );
}