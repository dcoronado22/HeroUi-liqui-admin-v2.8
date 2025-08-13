"use client";

import React from "react";
import {
    Chip,
    Button,
    Card,
    cn,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Tab,
    Tabs,
    Spacer,
    Skeleton, // ← agregado
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";

// =====================
// Tipos
// =====================
export type ChangeType = "positive" | "negative" | "neutral";

export type ChartDataPoint = {
    month: string;
    value: number;
    lastYearValue?: number;
};

export type GraphDualItem = {
    key: string;
    title: string;
    value: number;
    suffix: string;
    type: "number" | "percentage";
    change: string;
    changeType: ChangeType;
    chartData: ChartDataPoint[];
};

export type GraphDualProps = {
    items: GraphDualItem[];
    title?: React.ReactNode;
    tabs?: { key: string; title: string }[];
    initialActiveKey?: string;
    colors?: {
        positive?: string;
        negative?: string;
        neutral?: string;
        comparison?: string;
    };
    showComparison?: boolean;
    tooltipDate?: { day?: number; year?: number };
    className?: string;
    menuItems?: { key: string; label: string; onClick?: () => void }[];
    onActiveChange?: (key: string) => void;
    visibleCards?: boolean;
    customCard?: React.ReactNode;
    loading?: boolean; // ← agregado
    isTabsVisible?: boolean; // ← agregado, para controlar la visibilidad de las tabs
};

// =====================
const defaultTabs: NonNullable<GraphDualProps["tabs"]> = [
    { key: "6-months", title: "6 Months" },
    { key: "3-months", title: "3 Months" },
    { key: "30-days", title: "30 Days" },
    { key: "7-days", title: "7 Days" },
    { key: "24-hours", title: "24 Hours" },
];

const defaultMenu: NonNullable<GraphDualProps["menuItems"]> = [
    { key: "view-details", label: "View Details" },
    { key: "export-data", label: "Export Data" },
    { key: "set-alert", label: "Set Alert" },
];

const DEFAULT_COLORS: Required<NonNullable<GraphDualProps["colors"]>> = {
    positive: "success",
    negative: "danger",
    neutral: "default",
    comparison: "default-400",
};

const formatValue = (value: number, type: GraphDualItem["type"]) => {
    if (type === "number") {
        if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M";
        if (value >= 1_000) return (value / 1_000).toFixed(0) + "k";
        return value.toLocaleString();
    }
    if (type === "percentage") return `${value}%`;
    return String(value);
};

const formatMonth = (month: string) => {
    const monthNumber =
        {
            Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
            Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
        }[month] ?? 0;
    return new Intl.DateTimeFormat("en-US", { month: "long" }).format(new Date(2024, monthNumber, 1));
};

export default function GraphDual({
    items,
    title = "Analytics",
    tabs = defaultTabs,
    initialActiveKey,
    colors = DEFAULT_COLORS,
    showComparison = true,
    tooltipDate = { day: 25, year: 2025 },
    className,
    menuItems = defaultMenu,
    onActiveChange,
    visibleCards = true,
    customCard,
    loading = false, // ← agregado
    isTabsVisible = true, // ← agregado, para controlar la visibilidad de las tabs
}: GraphDualProps) {
    const gradientId = React.useId();

    const [activeKey, setActiveKey] = React.useState(
        () => initialActiveKey ?? items[0]?.key ?? ""
    );

    const active = React.useMemo(() => items.find((d) => d.key === activeKey), [items, activeKey]);

    const trendColor = React.useMemo(() => {
        if (!active) return colors.neutral ?? "";
        const map: Record<ChangeType, string> = {
            positive: colors.positive ?? "",
            negative: colors.negative ?? "",
            neutral: colors.neutral ?? "",
        };
        return map[active.changeType] ?? colors.neutral ?? "";
    }, [active, colors]);

    const handleChangeActive = (key: string) => {
        setActiveKey(key);
        onActiveChange?.(key);
    };

    return (
        <Card
            as="dl"
            className={cn(
                "dark:border-default-100 border border-default-200 shadow-xl shadow-black/10 dark:shadow-black/40 h-full",
                className
            )}
        >
            <section className="flex flex-col flex-nowrap">
                <div className="flex flex-col justify-between gap-y-2 p-6">
                    <div className="flex flex-col gap-y-2">
                        <div className="flex flex-col gap-y-0">
                            {loading ? (
                                <Skeleton className="h-5 w-28 rounded" />
                            ) : (
                                <dt className="text-medium text-foreground font-medium">{title}</dt>
                            )}
                        </div>
                        <div className="mt-2">
                            {isTabsVisible ? (
                                loading ? (
                                    <Skeleton className="h-8 w-full rounded" />
                                ) : (
                                    <Tabs size="sm">
                                        {tabs.map((t) => (
                                            <Tab key={t.key} title={t.title} />
                                        ))}
                                    </Tabs>
                                )
                            ) : null}
                        </div>

                        {typeof visibleCards === "undefined" ? (() => { visibleCards = true; return null; })() : null}

                        {customCard ? (
                            <div className="mt-0 flex w-full items-center">
                                <div className="-my-3 flex w-full items-center gap-x-3 overflow-x-auto py-3 relative z-10">
                                    <button
                                        type="button"
                                        className={cn("rounded-medium flex w-full flex-col gap-2 transition-colors")}
                                    >
                                        <div className="flex items-center justify-center gap-x-3">
                                            {loading ? (
                                                <Skeleton className="h-16 w-full rounded" />
                                            ) : (
                                                customCard
                                            )}
                                        </div>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            visibleCards && (
                                <div className="mt-2 flex w-full items-center">
                                    <div className="-my-3 flex w-full max-w-[800px] items-center gap-x-3 overflow-x-auto py-3 relative z-10">
                                        {items.map(({ key, change, changeType, type, value, title: cardTitle }) =>
                                            loading ? (
                                                <button
                                                    type="button"
                                                    key={key}
                                                    className="rounded-medium flex w-full flex-col gap-2 p-3 transition-colors"
                                                    disabled
                                                >
                                                    <span className="block">
                                                        <Skeleton className="h-4 w-20 rounded" />
                                                    </span>
                                                    <div className="flex items-center justify-center gap-x-3">
                                                        <Skeleton className="h-8 w-24 rounded" />
                                                        <Skeleton className="h-6 w-16 rounded" />
                                                    </div>
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    key={key}
                                                    className={cn("rounded-medium flex w-full flex-col gap-2 p-3 transition-colors", {
                                                        "bg-default-100": activeKey === key,
                                                    })}
                                                    onClick={() => handleChangeActive(key)}
                                                >
                                                    <span
                                                        className={cn("text-small text-default-500 font-medium transition-colors", {
                                                            "text-primary": activeKey === key,
                                                        })}
                                                    >
                                                        {cardTitle}
                                                    </span>
                                                    <div className="flex items-center justify-center gap-x-3">
                                                        <span className="text-foreground text-3xl font-bold">
                                                            {formatValue(value, type)}
                                                        </span>
                                                        <Chip
                                                            classNames={{ content: "font-medium" }}
                                                            color={
                                                                (changeType === "positive"
                                                                    ? colors.positive
                                                                    : changeType === "negative"
                                                                        ? colors.negative
                                                                        : colors.neutral) as any
                                                            }
                                                            radius="sm"
                                                            size="sm"
                                                            startContent={
                                                                changeType === "positive" ? (
                                                                    <Icon height={16} icon={"solar:arrow-right-up-linear"} width={16} />
                                                                ) : changeType === "negative" ? (
                                                                    <Icon height={16} icon={"solar:arrow-right-down-linear"} width={16} />
                                                                ) : (
                                                                    <Icon height={16} icon={"solar:arrow-right-linear"} width={16} />
                                                                )
                                                            }
                                                            variant="flat"
                                                        >
                                                            <span>{change}</span>
                                                        </Chip>
                                                    </div>
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="min-h-[350px] relative z-0 px-4">
                        <Skeleton className="h-[300px] w-full rounded" />
                    </div>
                ) : (
                    <ResponsiveContainer
                        className="min-h-[350px] [&_.recharts-surface]:outline-hidden relative z-0"
                        height="100%"
                        width="100%"
                    >
                        <AreaChart
                            accessibilityLayer
                            data={active?.chartData ?? []}
                            height={300}
                            margin={{ left: 0, right: 0 }}
                            width={500}
                        >
                            <defs>
                                <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="10%" stopColor={`hsl(var(--heroui-${trendColor}-500))`} stopOpacity={0.3} />
                                    <stop offset="100%" stopColor={`hsl(var(--heroui-${trendColor}-100))`} stopOpacity={0.1} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid
                                horizontalCoordinatesGenerator={() => [200, 150, 100, 50]}
                                stroke="hsl(var(--heroui-default-200))"
                                strokeDasharray="3 3"
                                vertical={false}
                            />

                            <XAxis
                                axisLine={false}
                                dataKey="month"
                                style={{ fontSize: "var(--heroui-font-size-tiny)", transform: "translateX(-40px)" }}
                                tickLine={false}
                            />

                            <Tooltip
                                content={({ label, payload }) => (
                                    <div className="rounded-medium bg-foreground text-tiny shadow-small flex h-auto min-w-[120px] items-center gap-x-2 p-2">
                                        <div className="flex w-full flex-col gap-y-0">
                                            {payload?.map((p: any, index: number) => {
                                                const name = p.name as string;
                                                const value = p.value as number;
                                                const type = (active?.type ?? "number") as GraphDualItem["type"];

                                                return (
                                                    <div key={`${index}-${name}`} className="flex w-full items-center gap-x-2">
                                                        <div className="text-small text-background flex w-full items-center gap-x-1">
                                                            <span>{formatValue(value, type)}</span>
                                                            <span>{active?.suffix}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            <span className="text-small text-foreground-400 font-medium">
                                                {formatMonth(String(label))} {tooltipDate.day ?? 25}, {tooltipDate.year ?? 2024}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                cursor={{ strokeWidth: 0 }}
                            />

                            <Area
                                activeDot={{
                                    stroke: `hsl(var(--heroui-${trendColor === "default" ? "foreground" : trendColor}))`,
                                    strokeWidth: 2,
                                    fill: "hsl(var(--heroui-background))",
                                    r: 5,
                                }}
                                animationDuration={1000}
                                animationEasing="ease"
                                dataKey="value"
                                fill={`url(#${gradientId})`}
                                stroke={`hsl(var(--heroui-${trendColor === "default" ? "foreground" : trendColor}))`}
                                strokeWidth={2}
                                type="monotone"
                            />

                            {showComparison && (
                                <Area
                                    activeDot={{
                                        stroke: `hsl(var(--heroui-${colors.comparison}))`,
                                        strokeWidth: 2,
                                        fill: "hsl(var(--heroui-background))",
                                        r: 5,
                                    }}
                                    animationDuration={1000}
                                    animationEasing="ease"
                                    dataKey="lastYearValue"
                                    fill="transparent"
                                    stroke={`hsl(var(--heroui-${colors.comparison}))`}
                                    strokeWidth={2}
                                    type="monotone"
                                />
                            )}
                        </AreaChart>
                    </ResponsiveContainer>
                )}

                <Dropdown classNames={{ content: "min-w-[120px]" }} placement="bottom-end">
                    <DropdownTrigger>
                        <Button isIconOnly className="absolute top-2 right-2 w-auto rounded-full" size="sm" variant="light">
                            <Icon height={16} icon="solar:menu-dots-bold" width={16} />
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu itemClasses={{ title: "text-tiny" }} variant="flat">
                        {menuItems.map((mi) => (
                            <DropdownItem key={mi.key} onPress={mi.onClick}>
                                {mi.label}
                            </DropdownItem>
                        ))}
                    </DropdownMenu>
                </Dropdown>
            </section>
        </Card>
    );
}