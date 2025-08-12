"use client";

import type { ButtonProps, CardProps } from "@heroui/react";
import React from "react";
import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell, Label } from "recharts";
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
export type DonutDatum = {
    name: string;
    value: number;
    [key: string]: string | number;
};

export type DonutCardItem = {
    key: string;
    title: string;
    total: number;
    unit?: string;
    color: ButtonProps["color"]; // HeroUI color token (e.g., "default", "primary", ...)
    categories: string[]; // labels for legend and tooltip
    chartData: DonutDatum[]; // [{ name, value }]
    menuItems?: { key: string; label: string; onClick?: () => void }[];
};

export type DonutGraphProps = {
    /** Cards to render */
    items: DonutCardItem[];
    /** Grid classes for the wrapper <dl> */
    gridClassName?: string;
    /** Show the time-range select (purely visual, does not filter by default) */
    showRangeSelect?: boolean;
    /** Items for the range select */
    rangeOptions?: { key: string; label: string }[];
    /** Default selected range key */
    defaultRangeKey?: string;
    /** Callback when range changes */
    onRangeChange?: (key: string) => void;
    /** Fallback context menu for every card (overridden by per-item menuItems) */
    menuItems?: { key: string; label: string; onClick?: () => void }[];
    /** Custom formatter for the big center total */
    formatTotal?: (n: number) => string;
    /** Donut visual params */
    donutHeight?: number | string; // default "100%"
    donutMaxWidth?: number; // default 200
    innerRadius?: string | number; // default "68%"
    cornerRadius?: number; // default 12
    paddingAngle?: number; // default -20
    /** Show legend items on the right */
    showLegend?: boolean; // default true
    singleMode?: boolean;
};

// =====================
// Defaults
// =====================
const DEFAULT_GRID = "grid w-full grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3";
const DEFAULT_RANGE: NonNullable<DonutGraphProps["rangeOptions"]> = [
    { key: "per-day", label: "Per Day" },
    { key: "per-week", label: "Per Week" },
    { key: "per-month", label: "Per Month" },
];
const DEFAULT_MENU: NonNullable<DonutGraphProps["menuItems"]> = [
    { key: "view-details", label: "View Details" },
    { key: "export-data", label: "Export Data" },
    { key: "set-alert", label: "Set Alert" },
];

const defaultFormatTotal = (total: number) => (total >= 1000 ? `${(total / 1000).toFixed(1)}K` : String(total));

// =====================
// Main grid component
// =====================
export default function DonutGraph({
    items,
    gridClassName,
    showRangeSelect = true,
    rangeOptions = DEFAULT_RANGE,
    defaultRangeKey = "per-day",
    onRangeChange,
    menuItems = DEFAULT_MENU,
    formatTotal = defaultFormatTotal,
    donutHeight = "100%",
    donutMaxWidth = 200,
    innerRadius = "68%",
    cornerRadius = 12,
    paddingAngle = -20,
    showLegend = true,
    singleMode = false
}: DonutGraphProps) {

    if (singleMode && items.length > 0) {
        const item = items[0];
        return (
            <CircleChartCard
                title={item.title}
                total={item.total}
                unit={item.unit}
                categories={item.categories}
                color={item.color}
                chartData={item.chartData}
                menuItems={item.menuItems ?? menuItems}
                showRangeSelect={showRangeSelect}
                rangeOptions={rangeOptions}
                defaultRangeKey={defaultRangeKey}
                onRangeChange={onRangeChange}
                formatTotal={formatTotal}
                donutHeight={donutHeight}
                donutMaxWidth={donutMaxWidth}
                innerRadius={innerRadius}
                cornerRadius={cornerRadius}
                paddingAngle={paddingAngle}
                showLegend={showLegend}
                className="h-full"
            />
        );
    }

    return (
        <dl className={cn(DEFAULT_GRID, gridClassName)}>
            {items.map((item) => (
                <CircleChartCard
                    key={item.key}
                    title={item.title}
                    total={item.total}
                    unit={item.unit}
                    categories={item.categories}
                    color={item.color}
                    chartData={item.chartData}
                    menuItems={item.menuItems ?? menuItems}
                    showRangeSelect={showRangeSelect}
                    rangeOptions={rangeOptions}
                    defaultRangeKey={defaultRangeKey}
                    onRangeChange={onRangeChange}
                    formatTotal={formatTotal}
                    donutHeight={donutHeight}
                    donutMaxWidth={donutMaxWidth}
                    innerRadius={innerRadius}
                    cornerRadius={cornerRadius}
                    paddingAngle={paddingAngle}
                    showLegend={showLegend}
                />
            ))}
        </dl>
    );
}

// =====================
// Single card component
// =====================
export type CircleChartCardProps = Omit<CardProps, "children"> &
    Pick<DonutCardItem, "title" | "total" | "unit" | "categories" | "color" | "chartData"> & {
        showRangeSelect?: boolean;
        rangeOptions?: { key: string; label: string }[];
        defaultRangeKey?: string;
        onRangeChange?: (key: string) => void;
        menuItems?: { key: string; label: string; onClick?: () => void }[];
        formatTotal?: (n: number) => string;
        donutHeight?: number | string;
        donutMaxWidth?: number;
        innerRadius?: string | number;
        cornerRadius?: number;
        paddingAngle?: number;
        showLegend?: boolean;
    };

export const CircleChartCard = React.forwardRef<HTMLDivElement, CircleChartCardProps>(
    (
        {
            className,
            title,
            total,
            unit,
            categories,
            color,
            chartData,
            showRangeSelect = true,
            rangeOptions = DEFAULT_RANGE,
            defaultRangeKey = "per-day",
            onRangeChange,
            menuItems = DEFAULT_MENU,
            formatTotal = defaultFormatTotal,
            donutHeight = "100%",
            donutMaxWidth = 200,
            innerRadius = "68%",
            cornerRadius = 12,
            paddingAngle = -20,
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
                <div className="flex flex-col gap-y-2 p-4 pb-0">
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
                                    listboxProps={{
                                        itemClasses: { title: "text-tiny" },
                                    }}
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
                </div>

                <div className="flex h-full flex-wrap items-center justify-center gap-x-2 lg:flex-nowrap">
                    <ResponsiveContainer className="w-full [&_.recharts-surface]:outline-hidden" height={donutHeight} width="100%">
                        <PieChart accessibilityLayer margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                            <Tooltip
                                content={({ label, payload }) => (
                                    <div className="rounded-medium bg-background text-tiny shadow-small flex h-8 min-w-[120px] items-center gap-x-2 px-1">
                                        <span className="text-foreground font-medium">{label as React.ReactNode}</span>
                                        {payload?.map((p: any, index: number) => {
                                            const name = String(p.name ?? "");
                                            const value = p.value as number;
                                            const category =
                                                categories.find((c) => c.toLowerCase() === name.toLowerCase()) ?? name;
                                            return (
                                                <div key={`${index}-${name}`} className="flex w-full items-center gap-x-2">
                                                    <div
                                                        className="h-2 w-2 flex-none rounded-full"
                                                        style={{ backgroundColor: `hsl(var(--heroui-${color}-${(index + 1) * 200}))` }}
                                                    />
                                                    <div className="text-default-700 flex w-full items-center justify-between gap-x-2 pr-1 text-xs">
                                                        <span className="text-default-500">{category}</span>
                                                        <span className="text-default-700 font-mono font-medium">{formatTotal(value)}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                cursor={false}
                            />
                            <Pie
                                animationDuration={1000}
                                animationEasing="ease"
                                cornerRadius={cornerRadius}
                                data={chartData}
                                dataKey="value"
                                innerRadius={innerRadius}
                                nameKey="name"
                                paddingAngle={paddingAngle}
                                strokeWidth={0}
                            >
                                {chartData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={`hsl(var(--heroui-${color}-${(index + 1) * 200}))`} />)
                                )}
                                <Label
                                    content={({ viewBox }) => {
                                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                            return (
                                                <text dominantBaseline="auto" textAnchor="middle" x={viewBox.cx!} y={viewBox.cy!}>
                                                    <tspan
                                                        fill="hsl(var(--heroui-default-700))"
                                                        fontSize={20}
                                                        fontWeight={600}
                                                        x={viewBox.cx!}
                                                        y={viewBox.cy!}
                                                    >
                                                        {formatTotal(total)}
                                                    </tspan>
                                                    <tspan
                                                        fill="hsl(var(--heroui-default-500))"
                                                        fontSize={12}
                                                        fontWeight={500}
                                                        x={viewBox.cx!}
                                                        y={viewBox.cy! + 14}
                                                    >
                                                        {unit}
                                                    </tspan>
                                                </text>
                                            );
                                        }
                                        return null;
                                    }}
                                    position="center"
                                />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>

                    {showLegend && (
                        <div className="text-tiny text-default-500 flex w-full flex-col justify-center gap-4 p-4 lg:p-0">
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
                </div>
            </Card>
        );
    }
);

CircleChartCard.displayName = "CircleChartCard";