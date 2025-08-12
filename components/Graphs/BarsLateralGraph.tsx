"use client";

import type { ButtonProps, CardProps } from "@heroui/react";
import React from "react";
import {
    BarChart as RBarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    LabelList,
} from "recharts";
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
export type LateralBarDatum = {
    weekday: string;
    [key: string]: string | number;
};

export type LateralBarCardItem = {
    key: string;
    title: string;
    value: string;
    unit?: string;
    color: ButtonProps["color"]; // e.g. "default", "primary", "secondary", ...
    categories: string[]; // stacked series
    chartData: LateralBarDatum[]; // rows per weekday
    menuItems?: { key: string; label: string; onClick?: () => void }[];
};

export type BarsLateralGraphProps = {
    /** Cards to render */
    items: LateralBarCardItem[];
    /** Grid classes for the wrapper <dl> */
    gridClassName?: string;
    /** Show the range select (decorative by default) */
    showRangeSelect?: boolean;
    /** Options for the range select */
    rangeOptions?: { key: string; label: string }[];
    /** Default selected range key */
    defaultRangeKey?: string;
    /** Callback when range changes */
    onRangeChange?: (key: string) => void;
    /** Fallback context menu (overridden per card) */
    menuItems?: { key: string; label: string; onClick?: () => void }[];
    /** Visual tuning */
    barSize?: number; // default 26
    cardHeightClass?: string; // default "h-[400px]"
    showLegend?: boolean; // default true
    /** Axis label formatter for Y ticks (weekdays). Defaults to 3-letter abbreviation. */
    yTickFormatter?: (v: string) => string;
    singleMode?: boolean; // true if only one card is rendered, false if multiple
};

// =====================
// Defaults
// =====================
const DEFAULT_GRID = "grid w-full grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3";
const DEFAULT_RANGE: NonNullable<BarsLateralGraphProps["rangeOptions"]> = [
    { key: "per-day", label: "Per Day" },
    { key: "per-week", label: "Per Week" },
    { key: "per-month", label: "Per Month" },
];
const DEFAULT_MENU: NonNullable<BarsLateralGraphProps["menuItems"]> = [
    { key: "view-details", label: "View Details" },
    { key: "export-data", label: "Export Data" },
    { key: "set-alert", label: "Set Alert" },
];

// =====================
// Helpers (match original visuals)
// =====================
const formatWeekday = (weekday: string) => {
    const day =
        {
            Mon: 1,
            Tue: 2,
            Wed: 3,
            Thu: 4,
            Fri: 5,
            Sat: 6,
            Sun: 0,
        }[weekday] ?? 0;
    return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date(2024, 0, day));
};

// =====================
// Main grid component
// =====================
export default function BarsLateralGraph({
    items,
    gridClassName,
    showRangeSelect = true,
    rangeOptions = DEFAULT_RANGE,
    defaultRangeKey = "per-day",
    onRangeChange,
    menuItems = DEFAULT_MENU,
    barSize = 26,
    cardHeightClass = "h-full",
    showLegend = true,
    yTickFormatter = (v) => String(v).slice(0, 3),
    singleMode = false,
}: BarsLateralGraphProps) {

    if (singleMode && items.length > 0) {
        const item = items[0];
        return (
            <BarsLateralCard
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
                cardHeightClass={cardHeightClass}
                showLegend={showLegend}
                yTickFormatter={yTickFormatter}
            />
        );
    }
    return (
        <dl className={cn(DEFAULT_GRID, gridClassName)}>
            {items.map((item) => (
                <BarsLateralCard
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
                    cardHeightClass={cardHeightClass}
                    showLegend={showLegend}
                    yTickFormatter={yTickFormatter}
                />
            ))}
        </dl>
    );
}

// =====================
// Single card component
// =====================
export type BarsLateralCardProps = Omit<CardProps, "children"> &
    Pick<LateralBarCardItem, "title" | "value" | "unit" | "categories" | "color" | "chartData"> & {
        showRangeSelect?: boolean;
        rangeOptions?: { key: string; label: string }[];
        defaultRangeKey?: string;
        onRangeChange?: (key: string) => void;
        menuItems?: { key: string; label: string; onClick?: () => void }[];
        barSize?: number;
        cardHeightClass?: string;
        showLegend?: boolean;
        yTickFormatter?: (v: string) => string;
    };

export const BarsLateralCard = React.forwardRef<HTMLDivElement, BarsLateralCardProps>(
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
            barSize = 26,
            cardHeightClass = "h-[400px]",
            showLegend = true,
            yTickFormatter = (v) => String(v).slice(0, 3),
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
            <Card ref={ref} className={cn("h-full dark:border-default-100 border border-default-200 shadow-xl shadow-black/10 dark:shadow-black/40", cardHeightClass, className)} {...props}>
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
                    <RBarChart accessibilityLayer data={chartData} layout="vertical" margin={{ top: 0, right: 34, left: -4, bottom: 5 }}>
                        <CartesianGrid horizontal={false} strokeOpacity={0.25} />
                        <XAxis hide axisLine={false} style={{ fontSize: "var(--heroui-font-size-tiny)" }} tickLine={false} type="number" />
                        <YAxis
                            axisLine={false}
                            dataKey="weekday"
                            strokeOpacity={0.25}
                            style={{ fontSize: "var(--heroui-font-size-tiny)" }}
                            tickFormatter={yTickFormatter as any}
                            tickLine={false}
                            type="category"
                        />
                        <Tooltip
                            content={({ label, payload }) => (
                                <div className="rounded-medium bg-background text-tiny shadow-small flex h-auto min-w-[120px] items-center gap-x-2 p-2">
                                    <div className="flex w-full flex-col gap-y-1">
                                        <span className="text-foreground font-medium">{formatWeekday(String(label))}</span>
                                        {payload?.map((p: any, index: number) => {
                                            const name = String(p.name ?? "");
                                            const value = p.value as number;
                                            const category = categories.find((c) => c.toLowerCase() === name.toLowerCase()) ?? name;
                                            return (
                                                <div key={`${index}-${name}`} className="flex w-full items-center gap-x-2">
                                                    <div className="h-2 w-2 flex-none rounded-full" style={{ backgroundColor: `hsl(var(--heroui-${color}-${(index + 1) * 200}))` }} />
                                                    <div className="text-default-700 flex w-full items-center justify-between gap-x-2 pr-1 text-xs">
                                                        <span className="text-default-500">{category}</span>
                                                        <span className="text-default-700 font-mono font-medium">{value}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            cursor={false}
                        />
                        {categories.map((category, index) => {
                            const step = (index + 1) * 200; // 200, 400, 600, ...
                            const bg = `hsl(var(--heroui-${color}-${step}))`;
                            const fg = `hsl(var(--heroui-${color}-${step === 200 ? 700 : step === 400 ? 100 : 50}))`;
                            return (
                                <Bar
                                    key={`${category}-${index}`}
                                    animationDuration={450}
                                    animationEasing="ease"
                                    barSize={barSize}
                                    dataKey={category}
                                    fill={bg}
                                    radius={index === categories.length - 1 ? [0, 8, 8, 0] : 0}
                                    stackId="bars"
                                >
                                    <LabelList dataKey={category} fill={fg} fontSize={12} offset={4} position="insideLeft" />
                                </Bar>
                            );
                        })}
                    </RBarChart>
                </ResponsiveContainer>

                {showLegend && (
                    <div className="text-tiny text-default-500 flex w-full justify-center gap-4 pb-4">
                        {categories.map((category, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: `hsl(var(--heroui-${color}-${(index + 1) * 200}))` }} />
                                <span className="capitalize">{category}</span>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        );
    }
);

BarsLateralCard.displayName = "BarsLateralCard";