"use client";

import React from "react";
import { Button, Breadcrumbs, BreadcrumbItem, Input, Popover, PopoverTrigger, PopoverContent, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, User, Avatar } from "@heroui/react";
import { Icon } from "@iconify/react";
import { usePathname } from "next/navigation";
import NotificationMenu from "@/components/NotificationMenu/notificationMenu";
import { ThemeSwitch } from "@/components/theme-switch";
import { SearchIcon } from "../icons";
import { useMsal } from "@azure/msal-react";

type Props = {
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    onOpenMobile: () => void;
    isSearchOpen: boolean;
    onToggleSearch: () => void;
};

export default function HeaderBar({
    isCollapsed,
    onToggleCollapse,
    onOpenMobile,
    isSearchOpen,
    onToggleSearch,
}: Props) {
    const pathname = usePathname();
    const { instance, accounts, inProgress } = useMsal();
    const account = instance.getActiveAccount() || accounts[0];
    // opcional: breadcrumbs dinámicos simples
    const segments = pathname.split("/").filter(Boolean);
    const crumbs = [{ label: "Home", href: "/" }, ...segments.map((seg, i) => {
        const href = "/" + segments.slice(0, i + 1).join("/");
        return { label: seg.charAt(0).toUpperCase() + seg.slice(1), href };
    })];

    return (
        <header
            className={`sticky top-0 z-40 bg-background/80 backdrop-blur
        supports-[backdrop-filter]:bg-background/60 rounded-medium
        border border-divider shadow-lg shadow-black/10
        flex h-16 items-center justify-between gap-2 px-4`}
        >
            <div className="flex items-center gap-2">
                {/* Mobile: abre drawer */}
                <Button isIconOnly className="flex sm:hidden" size="sm" variant="light" onPress={onOpenMobile}>
                    <Icon className="text-default-500" height={24} icon="solar:hamburger-menu-outline" width={24} />
                </Button>

                {/* Desktop: colapsa/expande */}
                <Button isIconOnly className="hidden sm:flex" size="sm" variant="light" onPress={onToggleCollapse}>
                    <Icon
                        className="text-default-500"
                        height={24}
                        icon={isCollapsed ? "solar:hamburger-menu-outline" : "solar:align-left-outline"}
                        width={24}
                    />
                </Button>

                <Breadcrumbs className="hidden sm:flex">
                    {crumbs.map((c, i) => (
                        <BreadcrumbItem key={i} href={i < crumbs.length - 1 ? c.href : undefined}>
                            {c.label}
                        </BreadcrumbItem>
                    ))}
                </Breadcrumbs>
            </div>

            <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center">
                    <Input
                        classNames={{
                            base: "max-w-full sm:max-w-[10rem] h-9",
                            mainWrapper: "h-full",
                            input: "text-small",
                            inputWrapper:
                                "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
                        }}
                        placeholder="Buscar..."
                        size="sm"
                        startContent={<SearchIcon size={18} />}
                        type="search"
                    />
                </div>

                <ThemeSwitch />

                <Popover placement="bottom-end">
                    <PopoverTrigger>
                        <Button isIconOnly variant="light">
                            <Icon className="text-default-500" icon="solar:bell-outline" width={24} />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                        <NotificationMenu />
                    </PopoverContent>
                </Popover>

                <div className="flex items-center gap-3">
                    <Dropdown placement="bottom-start" backdrop="opaque">
                        <DropdownTrigger>
                            <Avatar size="sm" showFallback src="https://images.unsplash.com/broken" />
                        </DropdownTrigger>
                        <DropdownMenu aria-label="User Actions" variant="flat">
                            <DropdownItem key="profile" className="h-14 gap-2">
                                <p className="font-bold">Signed in as</p>
                                <p className="font-light">{account.name}</p>
                            </DropdownItem>
                            <DropdownItem key="logout" color="danger" endContent={<Icon icon="line-md:log-in" fontSize={18} />}>
                                Log Out
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </div>
        </header>
    );
}
