"use client";

import React from "react";
import Image from "next/image";
import { Avatar, Button, ScrollShadow, Spacer, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";

import Sidebar from "@/components/layout/Sidebar/sidebar";
import { AcmeIcon } from "@/components/layout/Sidebar/acme";
import { sectionItemsWithTeams } from "@/components/layout/Sidebar/sidebarItems";
import { usePathname } from "next/navigation";
import Logo from "@/media/Logo.png";

type Props = {
    isCollapsed: boolean;
};

export default function SidebarPanel({ isCollapsed }: Props) {
    const pathname = usePathname();

    // Derivar la key seleccionada buscando por href que matchee el pathname
    const flatItems = React.useMemo(() => {
        const out: { key: string; href?: string }[] = [];
        const walk = (arr: any[]) => {
            for (const it of arr) {
                out.push({ key: it.key, href: it.href });
                if (it.items && it.items.length) walk(it.items);
            }
        };
        walk(sectionItemsWithTeams);
        return out;
    }, []);

    const selectedKey = React.useMemo(() => {
        if (!pathname) return undefined;
        // match exact o prefijo
        const exact = flatItems.find((i) => i.href && i.href.toLowerCase() === pathname.toLowerCase());
        if (exact) return exact.key;
        const pref = flatItems.find((i) => i.href && pathname.toLowerCase().startsWith(i.href.toLowerCase()) && i.href !== "/");
        return pref?.key;
    }, [pathname, flatItems]);
    return (
        <div className={`relative flex h-full flex-1 flex-col pr-8 pl-4 py-7 transition-all duration-300 ${isCollapsed ? "w-50" : "w-60"}`}>
            {/* Brand */}
            <div className="flex items-center gap-2 px-2">
                <div className="bg-foreground-50 flex h-12 w-12 items-center justify-center rounded-full">
                    <Image src={Logo} alt="LiquiCapital" width={50} height={50} className="rounded-sm" />
                </div>
                {!isCollapsed && <span className="text-large text-foreground font-bold ">LiquiCapital</span>}
            </div>

            <Spacer y={7} />

            {/* Menu */}
            <ScrollShadow className={`${isCollapsed ? "-mr-7" : "-mr-4"} h-full max-h-full`}>
                <Sidebar
                    defaultSelectedKey="home"
                    items={sectionItemsWithTeams}
                    isCompact={isCollapsed}
                    selectedKey={selectedKey}
                />
            </ScrollShadow>

            <Spacer y={8} />

            {/* Footer actions */}
            <div className={`mt-auto flex flex-col ${isCollapsed ? "items-center pl-3" : ""}`}>
                <Tooltip isDisabled={!isCollapsed} content="Help & Information" placement="right">
                    <Button
                        fullWidth
                        className="text-default-500 data-[hover=true]:text-foreground justify-start truncate"
                        isIconOnly={isCollapsed}
                        startContent={
                            isCollapsed ? null : (
                                <Icon className="text-default-500" icon="solar:info-circle-line-duotone" width={24} />
                            )
                        }
                        variant="light"
                    >
                        {isCollapsed ? (
                            <Icon className="text-default-500" icon="solar:info-circle-line-duotone" width={30} />
                        ) : (
                            "Help & Information"
                        )}
                    </Button>
                </Tooltip>

                <Tooltip isDisabled={!isCollapsed} content="Cerrar sesión" placement="right">
                    <Button
                        className="text-default-500 data-[hover=true]:text-foreground justify-start"
                        color="danger"
                        isIconOnly={isCollapsed}
                        startContent={
                            isCollapsed ? null : (
                                <Icon
                                    className="text-default-500 flex-none rotate-180"
                                    icon="solar:minus-circle-line-duotone"
                                    width={24}
                                />
                            )
                        }
                        variant="light"
                    >
                        {isCollapsed ? (
                            <Icon
                                className="text-default-500 rotate-180"
                                icon="solar:minus-circle-line-duotone"
                                width={24}
                            />
                        ) : (
                            "Cerrar sesión"
                        )}
                    </Button>
                </Tooltip>
            </div>
        </div>
    );
}
