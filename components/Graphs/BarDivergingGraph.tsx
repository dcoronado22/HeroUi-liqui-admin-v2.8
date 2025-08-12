"use client";

import type { ButtonProps, CardProps } from "@heroui/react";
import React from "react";
import { BarChart as RBarChart, Bar, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import {
    Card,
    Button,
    Select,
    SelectItem,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    cn,
} from "@heroui/react";
import { Icon } from "@iconify/react";

// =====================
// Types
// =====================
export type DivergingBarDatum = {
    month: string;
    [key: string]: string | number;
};

export type DivergingBarCardItem = {
    key: string;
    title: string;
    value: string; // e.g. "$5,420"
    unit?: string; // e.g. "avg"
    color: ButtonProps["color"]; // "default" | "primary" | ...
    categories: string[]; // e.g. ["Expenses", "Savings"] (first is primary)
    chartData: DivergingBarDatum[];
    menuItems?: { key: string; label: string; onClick?: () => void }[];
};

export type BarDivergingGraphProps = {
    /** Cards to render */
    items: DivergingBarCardItem[];
    /** Grid classes for the wrapper <dl> */
    gridClassName?: string;
    /** Show the range select */
    showRangeSelect?: boolean;
    /** Options for the range select */
    rangeOptions?: { key: string; label: string }[];
    /** Default selected range key */
    defaultRangeKey?: string;
    /** Callback when range changes */
    onRangeChange?: (key: string) => void;
    /** Fallback context menu (overridden per item) */
    menuItems?: { key: string; label: string; onClick?: () => void }[];
    /** Chart visuals */
    barSize?: number; // default 8
    barRadius?: number | [number, number, number, number]; // default [8,8,0,0]
    /** Recharts stack offset; keep default "sign" for diverging */
    stackOffset?: "sign" | "none" | "expand" | "wiggle" | "silhouette" | "positive";
    /** Reference line values */
    referenceLines?: number[]; // default [-1000, 0, 1000]
    /** Secondary series fill token (e.g., "default-200") */
    comparisonFillToken?: string; // default "default-200"
    /** Card height class (keeps original look if unset) */
    cardHeightClass?: string; // default "h-[300px]"
    singleMode?: boolean; // If true, renders a single card without grid
};

// =====================
// Defaults
// =====================
const DEFAULT_GRID = "grid w-full grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3";
const DEFAULT_RANGE: NonNullable<BarDivergingGraphProps["rangeOptions"]> = [
    { key: "per-day", label: "Per Day" },
    { key: "per-week", label: "Per Week" },
    { key: "per-month", label: "Per Month" },
];
const DEFAULT_MENU: NonNullable<BarDivergingGraphProps["menuItems"]> = [
    { key: "view-details", label: "View Details" },
    { key: "export-data", label: "Export Data" },
    { key: "set-alert", label: "Set Alert" },
];

// =====================
// Helpers (match original visuals)
// =====================
const formatMonth = (month: string) => {
    const monthNumber =
        {
            Jan: 0,
            Feb: 1,
            Mar: 2,
            Apr: 3,
            May: 4,
            Jun: 5,
            Jul: 6,
            Aug: 7,
            Sep: 8,
            Oct: 9,
            Nov: 10,
            Dec: 11,
        }[month] ?? 0;
    return new Intl.DateTimeFormat("en-US", { month: "long" }).format(new Date(2024, monthNumber, 1));
};

const colorTokenToHsl = (token: ButtonProps["color"]) =>
    token === "default" ? "hsl(var(--heroui-foreground))" : `hsl(var(--heroui-${token}))`;

// =====================
// Main grid component
// =====================
export default function BarDivergingGraph({
    items,
    gridClassName,
    showRangeSelect = true,
    rangeOptions = DEFAULT_RANGE,
    defaultRangeKey = "per-day",
    onRangeChange,
    menuItems = DEFAULT_MENU,
    barSize = 8,
    barRadius = [8, 8, 0, 0],
    stackOffset = "sign",
    referenceLines = [-1000, 0, 1000],
    comparisonFillToken = "default-200",
    cardHeightClass = "h-full",
    singleMode = false,
}: BarDivergingGraphProps) {
    if (singleMode && items.length > 0) {
        const item = items[0];
        return (
            <BarDivergingCard
                key={item.key}
                title={item.title}
                value={item.value}
                unit={item.unit}
                categories={item.categories}
                color={item.color}
                chartData={item.chartData}
                menuItems={item.menuItems ?? menuItems}
                showRangeSelect={showRangeSelect}
                rangeOptions={rangeOptions}
                defaultRangeKey={defaultRangeKey}
                onRangeChange={onRangeChange}
                barSize={barSize}
                barRadius={barRadius}
                stackOffset={stackOffset}
                referenceLines={referenceLines}
                comparisonFillToken={comparisonFillToken}
                cardHeightClass={cardHeightClass}
            />
        );
    }
    return (
        <dl className={cn(DEFAULT_GRID, gridClassName)}>
            {items.map((item) => (
                <BarDivergingCard
                    key={item.key}
                    title={item.title}
                    value={item.value}
                    unit={item.unit}
                    categories={item.categories}
                    color={item.color}
                    chartData={item.chartData}
                    menuItems={item.menuItems ?? menuItems}
                    showRangeSelect={showRangeSelect}
                    rangeOptions={rangeOptions}
                    defaultRangeKey={defaultRangeKey}
                    onRangeChange={onRangeChange}
                    barSize={barSize}
                    barRadius={barRadius}
                    stackOffset={stackOffset}
                    referenceLines={referenceLines}
                    comparisonFillToken={comparisonFillToken}
                    cardHeightClass={cardHeightClass}
                />
            ))}
        </dl>
    );
}

// =====================
// Single card component
// =====================
export type BarDivergingCardProps = Omit<CardProps, "children"> &
    Pick<DivergingBarCardItem, "title" | "value" | "unit" | "categories" | "color" | "chartData"> & {
        showRangeSelect?: boolean;
        rangeOptions?: { key: string; label: string }[];
        defaultRangeKey?: string;
        onRangeChange?: (key: string) => void;
        menuItems?: { key: string; label: string; onClick?: () => void }[];
        barSize?: number;
        barRadius?: number | [number, number, number, number];
        stackOffset?: BarDivergingGraphProps["stackOffset"];
        referenceLines?: number[];
        comparisonFillToken?: string;
        cardHeightClass?: string;
    };

export const BarDivergingCard = React.forwardRef<HTMLDivElement, BarDivergingCardProps>(
    (
        {
            className,
            title,
            value,
            unit,
            categories,
            color,
            chartData,
            showRangeSelect = true,
            rangeOptions = DEFAULT_RANGE,
            defaultRangeKey = "per-day",
            onRangeChange,
            menuItems = DEFAULT_MENU,
            barSize = 8,
            barRadius = [8, 8, 0, 0],
            stackOffset = "sign",
            referenceLines = [-1000, 0, 1000],
            comparisonFillToken = "default-200",
            cardHeightClass = "h-full",
            ...props
        },
        ref
    ) => {
        const [selectedRange, setSelectedRange] = React.useState<string>(defaultRangeKey);

        const handleRangeChange = React.useCallback(
            (keys: any) => {
                const key = Array.from(keys)[0] as string;
                setSelectedRange(key);
                onRangeChange?.(key);
            },
            [onRangeChange]
        );

        const primaryFill = colorTokenToHsl(color);
        const comparisonFill = `hsl(var(--heroui-${comparisonFillToken}))`;

        return (
            <Card ref={ref} className={cn("h-full dark:border-default-100 border border-default-200 shadow-xl shadow-black/10 dark:shadow-black/40", cardHeightClass, className)} {...props}>
                <div className="flex flex-col gap-y-2 px-4 pt-4 pb-2">
                    <div className="flex items-center justify-between gap-x-2">
                        <dt>
                            <h3 className="text-small text-default-500 font-medium">{title}</h3>
                        </dt>
                        <div className="flex items-center justify-end gap-x-2">
                            {showRangeSelect && (
                                <Select
                                    aria-label="Time Range"
                                    classNames={{
                                        trigger: "min-w-[100px] min-h-7 h-7",
                                        value: "text-tiny text-default-500!",
                                        selectorIcon: "text-default-500",
                                        popoverContent: "min-w-[120px]",
                                    }}
                                    selectedKeys={new Set([selectedRange])}
                                    onSelectionChange={handleRangeChange as any}
                                    listboxProps={{ itemClasses: { title: "text-tiny" } }}
                                    placeholder={rangeOptions.find((o) => o.key === selectedRange)?.label ?? "Per Day"}
                                    size="sm"
                                >
                                    {rangeOptions.map((o) => (
                                        <SelectItem key={o.key}>{o.label}</SelectItem>
                                    ))}
                                </Select>
                            )}
                            <Dropdown classNames={{ content: "min-w-[120px]" }} placement="bottom-end">
                                <DropdownTrigger>
                                    <Button isIconOnly radius="full" size="sm" variant="light">
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
                        </div>
                    </div>
                    <dd className="flex items-baseline gap-x-1">
                        <span className="text-default-900 text-3xl font-semibold">{value}</span>
                        <span className="text-medium text-default-500 font-medium">{unit}</span>
                    </dd>
                </div>

                <ResponsiveContainer className="[&_.recharts-surface]:outline-hidden" height="100%" width="100%">
                    <RBarChart accessibilityLayer data={chartData} margin={{ top: 10, right: 24, left: 20, bottom: 24 }} stackOffset={stackOffset}>
                        <Tooltip
                            content={({ payload }) => {
                                const month = payload?.[0]?.payload?.month as string | undefined;
                                return (
                                    <div className="rounded-medium bg-background text-tiny shadow-small flex h-auto min-w-[120px] items-center gap-x-2 p-2">
                                        <div className="flex w-full flex-col gap-y-1">
                                            <span className="text-foreground font-medium">{month ? formatMonth(month) : ""}</span>
                                            {payload?.map((p: any, index: number) => {
                                                const name = String(p.name ?? "");
                                                const value = p.value as number;
                                                const category = categories.find((c) => c.toLowerCase() === name.toLowerCase()) ?? name;
                                                return (
                                                    <div key={`${index}-${name}`} className="flex w-full items-center gap-x-2">
                                                        <div
                                                            className="h-2 w-2 flex-none rounded-full"
                                                            style={{ backgroundColor: index === 0 ? primaryFill : comparisonFill }}
                                                        />
                                                        <div className="text-default-700 flex w-full items-center justify-between gap-x-2 pr-1 text-xs">
                                                            <span className="text-default-500">{category}</span>
                                                            <span className="text-default-700 font-mono font-medium">{value}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            }}
                            cursor={false}
                        />

                        {referenceLines.map((y) => (
                            <ReferenceLine key={y} stroke="hsl(var(--heroui-default-200))" strokeDasharray="3 3" y={y} />
                        ))}

                        {categories.map((category, index) => (
                            <Bar
                                key={category}
                                animationDuration={450}
                                animationEasing="ease"
                                barSize={barSize}
                                dataKey={category}
                                fill={index === 0 ? primaryFill : comparisonFill}
                                radius={barRadius as any}
                                stackId="stack"
                            />
                        ))}
                    </RBarChart>
                </ResponsiveContainer>

                <div className="text-tiny text-default-500 flex w-full justify-center gap-4 pb-4">
                    {categories.map((category, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: index === 0 ? primaryFill : comparisonFill }} />
                            <span className="capitalize">{category}</span>
                        </div>
                    ))}
                </div>
            </Card>
        );
    }
);

BarDivergingCard.displayName = "BarDivergingCard";
