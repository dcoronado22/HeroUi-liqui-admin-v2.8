"use client";

import type { ButtonProps, CardProps } from "@heroui/react";
import React from "react";
import { BarChart as RBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
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
import { formatCurrency } from "@/lib/helpers/CurrencyFormatter";

// =====================
// Types
// =====================
export type BarDatum = {
    weekday: string;
    [key: string]: string | number;
};

export type BarCardItem = {
    key: string;
    title: string;
    /** e.g. "580/280" or "8,432" */
    value: string;
    unit?: string;
    color: ButtonProps["color"]; // token name: "warning" | "danger" | "success" | ...
    categories: string[]; // data keys to stack
    chartData: BarDatum[]; // array of rows with weekday + category values
    menuItems?: { key: string; label: string; onClick?: () => void }[];
};

export type BarGraphProps = {
    /** Cards to render */
    items: BarCardItem[];
    /** Grid classes for the wrapper <dl> */
    gridClassName?: string;
    /** Show the range select (visual only by default) */
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
    barSize?: number; // default 24
    stacked?: boolean; // default true
    /** Axis formatting */
    yTickFormatter?: (v: number) => string | number;
    /** Show legend chips under the chart */
    showLegend?: boolean; // default true
    singleMode?: boolean;
};

// =====================
// Defaults
// =====================
const DEFAULT_GRID = "grid w-full grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3";
const DEFAULT_RANGE: NonNullable<BarGraphProps["rangeOptions"]> = [
    { key: "per-day", label: "Per Day" },
    { key: "per-week", label: "Per Week" },
    { key: "per-month", label: "Per Month" },
];
const DEFAULT_MENU: NonNullable<BarGraphProps["menuItems"]> = [
    { key: "view-details", label: "View Details" },
    { key: "export-data", label: "Export Data" },
    { key: "set-alert", label: "Set Alert" },
];

// =====================
// Main grid component
// =====================
export default function BarGraph({
    items,
    gridClassName,
    showRangeSelect = true,
    rangeOptions = DEFAULT_RANGE,
    defaultRangeKey = "per-day",
    onRangeChange,
    menuItems = DEFAULT_MENU,
    barSize = 24,
    stacked = true,
    yTickFormatter,
    showLegend = true,
    singleMode = false,
}: BarGraphProps) {
    if (singleMode && items.length > 0) {
        const item = items[0];
        return (
            <BarChartCard
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
                stacked={stacked}
                yTickFormatter={yTickFormatter}
                showLegend={showLegend}
            />
        );
    }
    return (

        <dl className={cn(DEFAULT_GRID, gridClassName)}>
            {items.map((item) => (
                <BarChartCard
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
                    stacked={stacked}
                    yTickFormatter={yTickFormatter}
                    showLegend={showLegend}
                />
            ))}
        </dl>
    );
}

// =====================
// Single card component
// =====================
export type BarChartCardProps = Omit<CardProps, "children"> &
    Pick<BarCardItem, "title" | "value" | "unit" | "categories" | "color" | "chartData"> & {
        showRangeSelect?: boolean;
        rangeOptions?: { key: string; label: string }[];
        defaultRangeKey?: string;
        onRangeChange?: (key: string) => void;
        menuItems?: { key: string; label: string; onClick?: () => void }[];
        barSize?: number;
        stacked?: boolean;
        yTickFormatter?: (v: number) => string | number;
        showLegend?: boolean;
    };

export const BarChartCard = React.forwardRef<HTMLDivElement, BarChartCardProps>(
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
            barSize = 24,
            stacked = true,
            yTickFormatter,
            showLegend = true,
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

        return (
            <Card ref={ref} className={cn("h-full dark:border-default-100 border border-default-200 shadow-xl shadow-black/10 dark:shadow-black/40", className)} {...props}>
                <div className="flex flex-col gap-y-2 p-4">
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
                    <RBarChart
                        accessibilityLayer
                        data={chartData}
                        margin={{ top: 20, right: 14, left: -8, bottom: 5 }}
                    >
                        <XAxis dataKey="weekday" style={{ fontSize: "var(--heroui-font-size-tiny)" }} tickLine={false} />
                        <YAxis
                            axisLine={false}
                            style={{ fontSize: "var(--heroui-font-size-tiny)" }}
                            tickLine={false}
                            tickFormatter={(value: any, _index: number) => {
                                // Si se provee un formateador externo, úsalo
                                if (yTickFormatter) return String(yTickFormatter(value));
                                if (typeof value === "number") {
                                    if (value >= 1_000_000) {
                                        return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
                                    }
                                    if (value >= 1_000) {
                                        return `${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)}k`;
                                    }
                                }
                                return String(value);
                            }}
                        />
                        <Tooltip
                            content={({ label, payload }) => (
                                <div className="rounded-medium bg-background text-tiny shadow-small flex h-auto min-w-[120px] items-center gap-x-2 p-2">
                                    <div className="flex w-full flex-col gap-y-1">
                                        <span className="text-foreground font-medium">{(String(label))}</span>
                                        {payload?.map((p: any, index: number) => {
                                            const name = String(p.name ?? "");
                                            const value = p.value as number;
                                            const category = categories.find((c) => c.toLowerCase() === name.toLowerCase()) ?? name;
                                            return (
                                                <div key={`${index}-${name}`} className="flex w-full items-center gap-x-2">
                                                    <div
                                                        className="h-2 w-2 flex-none rounded-full"
                                                        style={{ backgroundColor: `hsl(var(--heroui-${color}-${(index + 1) * 200}))` }}
                                                    />
                                                    <div className="text-default-700 flex w-full items-center justify-between gap-x-2 pr-1 text-xs">
                                                        <span className="text-default-500">{category}</span>
                                                        <span className="text-default-700 font-mono font-medium">{formatCurrency(value)}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            cursor={false}
                        />
                        {categories.map((category, index) => (
                            <Bar
                                key={`${category}-${index}`}
                                animationDuration={450}
                                animationEasing="ease"
                                barSize={24}
                                dataKey={category}
                                fill={`hsl(var(--heroui-${color}-${(index + 1) * 200}))`}
                                radius={index === categories.length - 1 ? [4, 4, 0, 0] : 0}
                                stackId="bars"
                            />
                        ))}
                    </RBarChart>
                </ResponsiveContainer>

                {showLegend && (
                    <div className="text-tiny text-default-500 flex w-full justify-center gap-4 pb-4">
                        {categories.map((category, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <span
                                    className="h-2 w-2 rounded-full"
                                    style={{ backgroundColor: `hsl(var(--heroui-${color}-${(index + 1) * 200}))` }}
                                />
                                <span className="capitalize">{category}</span>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        );
    }
);

BarChartCard.displayName = "BarChartCard";