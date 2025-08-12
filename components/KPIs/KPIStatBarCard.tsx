"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { Card, Chip, cn } from "@heroui/react";
import { Bar, BarChart as RBarChart, ResponsiveContainer, XAxis, Tooltip } from "recharts";

// =====================
// Types
// =====================
export type ChangeType = "positive" | "neutral" | "negative" | "default";

export type KPIBarDatum = {
    weekday: string; // Mo, Tu, We, Th, Fr, Sa, Su
    value: number;
};

export type KPIStatItem = {
    key: string;
    title: string;
    /** Big value shown on the left, e.g. "$228k" */
    value: string;
    change: string; // e.g. "3%"
    changeType: ChangeType;
    /** Where to place the trend chip relative to the big value */
    trendChipPosition?: "top" | "bottom";
    chartData: KPIBarDatum[];
};

export type KPIStatBarCardProps = {
    items: KPIStatItem[];
    /** Grid classes for the wrapper <dl> */
    gridClassName?: string;
    /** Chart sizing (keeps original look by default) */
    chartBoxClassName?: string; // default "flex h-[120px] w-[180px] shrink-0 items-center"
    /** Bars */
    barSize?: number; // default 12
    barRadius?: number; // default 8
    /** Fill tokens (HeroUI design tokens) */
    barFillToken?: string; // default "foreground"
    barBgToken?: string; // default "default-200"
    dimOthersFillToken?: string; // default "default-300"
    /** Formatters */
    weekdayFormatter?: (abbr: string) => string; // defaults to full weekday
    valueFormatter?: (n: number) => string; // defaults to USD currency, 0 decimals
    singleMode?: boolean; // if true, only renders one item (useful for single KPI cards)
};

// =====================
// Defaults & helpers
// =====================
const DEFAULT_GRID = "grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3";

const defaultWeekdayFormatter = (weekday: string) => {
    const day =
        {
            Mo: 1,
            Tu: 2,
            We: 3,
            Th: 4,
            Fr: 5,
            Sa: 6,
            Su: 0,
        }[weekday] ?? 0;
    return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date(2024, 0, day));
};

const defaultValueFormatter = (value: number) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);

const trendColor = (t: ChangeType) =>
    t === "positive" ? "success" : t === "neutral" ? "warning" : t === "negative" ? "danger" : "default";

// =====================
// Main component
// =====================
export default function KPIStatBarCard({
    items,
    gridClassName,
    chartBoxClassName = "flex h-[120px] w-[180px] shrink-0 items-center",
    barSize = 12,
    barRadius = 8,
    barFillToken = "foreground",
    barBgToken = "default-200",
    dimOthersFillToken = "default-300",
    weekdayFormatter = defaultWeekdayFormatter,
    valueFormatter = defaultValueFormatter,
    singleMode = false,
}: KPIStatBarCardProps) {
    if (singleMode && items.length > 0) {
        const item = items[0];
        return (
            <KPIStatBarCardItem
                key={item.key}
                item={item}
                chartBoxClassName={chartBoxClassName}
                barSize={barSize}
                barRadius={barRadius}
                barFillToken={barFillToken}
                barBgToken={barBgToken}
                dimOthersFillToken={dimOthersFillToken}
                weekdayFormatter={weekdayFormatter}
                valueFormatter={valueFormatter}
            />
        );
    }
    return (
        <dl className={cn(DEFAULT_GRID, gridClassName)}>
            {items.map((item) => (
                <KPIStatBarCardItem
                    key={item.key}
                    item={item}
                    chartBoxClassName={chartBoxClassName}
                    barSize={barSize}
                    barRadius={barRadius}
                    barFillToken={barFillToken}
                    barBgToken={barBgToken}
                    dimOthersFillToken={dimOthersFillToken}
                    weekdayFormatter={weekdayFormatter}
                    valueFormatter={valueFormatter}
                />
            ))}
        </dl>
    );
}

// =====================
// Single card
// =====================
function KPIStatBarCardItem({
    item,
    chartBoxClassName,
    barSize,
    barRadius,
    barFillToken,
    barBgToken,
    dimOthersFillToken,
    weekdayFormatter,
    valueFormatter,
}: {
    item: KPIStatItem;
    chartBoxClassName: string;
    barSize: number;
    barRadius: number;
    barFillToken: string;
    barBgToken: string;
    dimOthersFillToken: string;
    weekdayFormatter: (abbr: string) => string;
    valueFormatter: (n: number) => string;
}) {
    const { title, value, changeType, change, trendChipPosition = "bottom", chartData } = item;

    const chartId = React.useId();

    const handleMouseEnter = React.useCallback(
        (itemIndex: number) => {
            const root = document.querySelector(`#chart-${chartId}`);
            if (!root) return;
            const bars = root.querySelectorAll(".recharts-bar-rectangle");
            bars.forEach((bar, i) => {
                if (i !== itemIndex) {
                    const path = bar.querySelector("path");
                    if (path) path.setAttribute("fill", `hsl(var(--heroui-${dimOthersFillToken}))`);
                }
            });
        },
        [chartId, dimOthersFillToken]
    );

    const handleMouseLeave = React.useCallback(() => {
        const root = document.querySelector(`#chart-${chartId}`);
        if (!root) return;
        const bars = root.querySelectorAll(".recharts-bar-rectangle path");
        bars.forEach((path) => {
            (path as SVGPathElement).setAttribute("fill", `hsl(var(--heroui-${barFillToken}))`);
        });
    }, [chartId, barFillToken]);

    const renderTrendChip = React.useCallback(
        () => (
            <div
                className={cn({
                    "self-start": trendChipPosition === "top",
                    "self-end": trendChipPosition === "bottom",
                })}
            >
                <Chip
                    classNames={{ content: "font-medium" }}
                    color={trendColor(changeType) as any}
                    radius="sm"
                    size="sm"
                    startContent={
                        changeType === "positive" ? (
                            <Icon height={16} icon={"solar:arrow-right-up-linear"} width={16} />
                        ) : changeType === "neutral" ? (
                            <Icon height={16} icon={"solar:arrow-right-linear"} width={16} />
                        ) : (
                            <Icon height={16} icon={"solar:arrow-right-down-linear"} width={16} />
                        )
                    }
                    variant="flat"
                >
                    <span>{change}</span>
                </Chip>
            </div>
        ),
        [change, changeType, trendChipPosition]
    );

    return (
        <Card className="h-full dark:border-default-100 border border-default-200 shadow-xl shadow-black/10 dark:shadow-black/40 px-4">
            <section className="flex h-full flex-nowrap items-center justify-between">
                <div className="flex h-full flex-col gap-y-3 py-4 md:flex-row md:justify-between md:gap-x-2">
                    <div className="flex h-full w-full flex-col justify-between gap-y-3">
                        <dt className="text-default-500 flex items-center gap-x-2 text-base font-medium">
                            {title}
                            <div className="md:hidden">{renderTrendChip()}</div>
                        </dt>
                        <div className="flex gap-x-2">
                            <dd className="text-default-700 text-3xl font-semibold">{value}</dd>
                            <div
                                className={cn("hidden md:block", {
                                    "self-start": trendChipPosition === "top",
                                    "self-end": trendChipPosition === "bottom",
                                })}
                            >
                                {renderTrendChip()}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={chartBoxClassName}>
                    <ResponsiveContainer className="[&_.recharts-surface]:outline-hidden" height="150%" width="100%">
                        <RBarChart
                            accessibilityLayer
                            barSize={barSize}
                            data={chartData}
                            id={`chart-${chartId}`}
                            margin={{ top: 24, bottom: 4 }}
                        >
                            <XAxis axisLine={false} dataKey="weekday" style={{ fontSize: "var(--heroui-font-size-tiny)" }} tickLine={false} />
                            <Tooltip
                                content={({ label, payload }) => (
                                    <div className="rounded-medium bg-background text-tiny shadow-small flex h-8 min-w-[80px] items-center gap-x-2 p-2">
                                        <div className="bg-foreground h-2 w-2 rounded-xs" />
                                        <span className="text-default-500">{weekdayFormatter(String(label))}</span>
                                        <span className="text-default-700 font-medium">{valueFormatter((payload?.[0]?.value as number) ?? 0)}</span>
                                    </div>
                                )}
                                cursor={false}
                            />
                            <Bar
                                background={{ fill: `hsl(var(--heroui-${barBgToken}))`, radius: barRadius }}
                                className="transition-colors"
                                dataKey="value"
                                fill={`hsl(var(--heroui-${barFillToken}))`}
                                radius={barRadius}
                                onMouseEnter={(_, itemIndex) => handleMouseEnter(itemIndex)}
                                onMouseLeave={() => handleMouseLeave()}
                            />
                        </RBarChart>
                    </ResponsiveContainer>
                </div>
            </section>
        </Card>
    );
}