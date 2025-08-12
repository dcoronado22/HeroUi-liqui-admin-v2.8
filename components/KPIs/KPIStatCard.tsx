"use client";

import React, { useId, useMemo } from "react";
import {
    Card,
    Button,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Chip,
    Tooltip,
    cn,
} from "@heroui/react";
import { ResponsiveContainer, AreaChart, Area, YAxis, XAxis } from "recharts";
import { Icon } from "@iconify/react";

type HeroUIColor = "primary" | "secondary" | "success" | "warning" | "danger" | "default";

type KPIAction = {
    key: string;
    label: string;
    onClick?: () => void;
    icon?: string;
};

type CTAButton = {
    label?: string;
    onClick: () => void;
    icon?: string;          // iconify name opcional
    isIconOnly?: boolean;   // si envías true, solo renderizo el icono
    variant?: "light" | "flat" | "solid" | "bordered" | "ghost";
    size?: "sm" | "md" | "lg";
    ariaLabel?: string;     // útil si es icon-only
    color?: HeroUIColor;
    className?: string;
};

export type KPIStatCardProps<T extends Record<string, any>> = {
    title: string;
    subtitle?: string;
    value: React.ReactNode;
    change?: string | number;
    color?: HeroUIColor;
    data: T[];
    xKey?: keyof T & string;
    yKey?: keyof T & string;
    yDomain?: [number | "auto" | "dataMin", number | "auto" | "dataMax"];
    actions?: KPIAction[];              // dropdown (si no hay cta/ctaNode)
    cta?: CTAButton;                    // botón en reemplazo del dropdown
    ctaNode?: React.ReactNode;          // render prop para botón completamente custom
    actionPlacement?: "top-right" | "top-left";
    tooltip?: string | React.ReactNode; // HeroUI Tooltip
    className?: string;
};

function colorVar(c: HeroUIColor = "default") {
    switch (c) {
        case "primary": return "hsl(var(--heroui-primary))";
        case "secondary": return "hsl(var(--heroui-secondary))";
        case "success": return "hsl(var(--heroui-success))";
        case "warning": return "hsl(var(--heroui-warning))";
        case "danger": return "hsl(var(--heroui-danger))";
        default: return "hsl(var(--heroui-foreground))";
    }
}

function getArrowIcon(change?: string | number) {
    if (change === undefined || change === null) return "solar:arrow-right-linear";
    const n = typeof change === "number"
        ? change
        : parseFloat(String(change).replace("%", "").replace(",", "."));
    if (isNaN(n)) return "solar:arrow-right-linear";
    if (n > 0) return "solar:arrow-right-up-linear";
    if (n < 0) return "solar:arrow-right-down-linear";
    return "solar:arrow-right-linear";
}

function placementClass(pos: "top-right" | "top-left" = "top-right") {
    return cn(
        "absolute top-2 rounded-full",
        pos === "top-right" ? "right-2" : "left-2"
    );
}

export default function KPIStatCard<T extends Record<string, any>>({
    title,
    subtitle,
    value,
    change,
    color = "default",
    data,
    xKey = "month" as keyof T & string,
    yKey = "value" as keyof T & string,
    yDomain,
    actions = [],
    cta,
    ctaNode,
    actionPlacement = "top-right",
    tooltip,
    className,
}: KPIStatCardProps<T>) {
    const gradId = useId();
    const strokeFill = useMemo(() => colorVar(color), [color]);

    const computedYDomain = useMemo<[any, any]>(() => {
        if (yDomain) return yDomain;
        const numbers = data.map((d) => Number(d[yKey])).filter((v) => !isNaN(v));
        const min = numbers.length ? Math.min(...numbers) : 0;
        return [min, "auto"];
    }, [data, yKey, yDomain]);

    const arrowIcon = useMemo(() => getArrowIcon(change), [change]);

    const actionArea = (() => {
        // 1) Prioridad al ctaNode (control total)
        if (ctaNode) {
            return <div className={placementClass(actionPlacement)}>{ctaNode}</div>;
        }
        // 2) CTA simple (reemplaza al dropdown)
        if (cta) {
            const {
                label,
                onClick,
                icon,
                isIconOnly,
                variant = "light",
                size = "sm",
                ariaLabel,
                color: ctaColor,
                className: ctaClass,
            } = cta;

            return (
                <Button
                    onPress={onClick}
                    isIconOnly={isIconOnly}
                    aria-label={ariaLabel || label}
                    variant={variant}
                    size={size}
                    color={ctaColor}
                    className={cn(placementClass(actionPlacement), ctaClass)}
                >
                    {icon ? <Icon icon={icon} width={16} height={16} /> : label}
                </Button>
            );
        }
        // 3) Si no hay CTA ni ctaNode, cae al dropdown (si hay actions)
        if (actions.length > 0) {
            return (
                <Dropdown classNames={{ content: "min-w-[140px]" }} placement="bottom-end">
                    <DropdownTrigger>
                        <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            className={placementClass(actionPlacement)}
                            aria-label="open card menu"
                        >
                            <Icon icon="solar:menu-dots-bold" width={16} height={16} />
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label={`${title} actions`} itemClasses={{ title: "text-tiny" }} variant="flat">
                        {actions.map((a) => (
                            <DropdownItem
                                key={a.key}
                                onPress={() => a.onClick?.()}
                                startContent={a.icon ? <Icon icon={a.icon} width={16} height={16} /> : null}
                            >
                                {a.label}
                            </DropdownItem>
                        ))}
                    </DropdownMenu>
                </Dropdown>
            );
        }
        return null;
    })();

    const cardContent = (
        <Card className={cn("dark:border-default-100 border border-default-200 shadow-xl shadow-black/10 dark:shadow-black/40", className)}>
            <section className="relative flex flex-col">
                {/* Header */}
                <div className="flex flex-col gap-y-2 px-4 pt-4 items-start text-left">
                    <div className="flex flex-col">
                        <dt className="text-default-600 text-sm font-medium">{title}</dt>
                        {subtitle && <dt className="text-tiny text-default-400 font-normal">{subtitle}</dt>}
                    </div>

                    <div className="flex items-baseline gap-x-2">
                        <dd className="text-default-700 text-xl font-semibold">{value}</dd>
                        {change !== undefined && (
                            <Chip
                                radius="sm"
                                size="sm"
                                variant="flat"
                                classNames={{ content: "font-medium" }}
                                color={color}
                                startContent={<Icon icon={arrowIcon} width={16} height={16} />}
                            >
                                <span>{typeof change === "number" ? `${change}%` : change}</span>
                            </Chip>
                        )}
                    </div>
                </div>

                {/* Chart */}
                <div className="min-h-24 w-full">
                    <ResponsiveContainer className="[&_.recharts-surface]:outline-hidden">
                        <AreaChart accessibilityLayer data={data} className="translate-y-1 scale-105">
                            <defs>
                                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="10%" stopColor={strokeFill} stopOpacity={0.3} />
                                    <stop offset="100%" stopColor={strokeFill} stopOpacity={0.1} />
                                </linearGradient>
                            </defs>

                            <YAxis domain={computedYDomain} hide />
                            <XAxis dataKey={xKey} hide />
                            <Area type="monotone" dataKey={yKey} name={title} fill={`url(#${gradId})`} stroke={strokeFill} isAnimationActive />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Action area (CTA o Dropdown) */}
                {actionArea}
            </section>
        </Card>
    );

    return tooltip ? (
        <Tooltip content={tooltip} placement="top-end" className="max-w-xs break-words">
            {cardContent}
        </Tooltip>
    ) : (
        cardContent
    );
}