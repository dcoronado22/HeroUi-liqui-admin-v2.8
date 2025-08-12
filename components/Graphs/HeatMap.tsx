
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, Tooltip, Chip, Select, SelectItem, Switch, cn } from "@heroui/react";

// ---------- Types ----------
export type HeatmapDatum = { x: string | number; y: string | number; value: number };
export type HeatmapInterpolate = "linear" | "log" | "quantize";

export type HeatmapHeroProps = {
    data: HeatmapDatum[];
    width?: number; // si se omite, ocupa el contenedor
    height?: number; // si se omite, calcula con ResizeObserver
    margin?: { top: number; right: number; bottom: number; left: number };

    xDomain?: Array<string | number>;
    yDomain?: Array<string | number>;
    valueDomain?: [number, number];
    interpolate?: HeatmapInterpolate;

    cellSize?: { width?: number; height?: number };
    cellPadding?: number;
    cellRadius?: number;
    showGrid?: boolean;

    xLabel?: string;
    yLabel?: string;
    valueFormatter?: (v: number) => string;
    tooltip?: (d: HeatmapDatum) => React.ReactNode;
    onCellClick?: (d: HeatmapDatum) => void;

    legend?: { show?: boolean; position?: "right" | "bottom" };
    controls?: boolean;

    a11yTitle?: string;
    a11yDescription?: string;
    className?: string;
};

// ---------- Utils ----------
function inferDomain<T extends string | number>(arr: T[]): T[] { return Array.from(new Set(arr)); }
function inferValueDomain(values: number[]): [number, number] { return values.length ? [Math.min(...values), Math.max(...values)] : [0, 1]; }

// Mezcla primary con background (auto light/dark) usando color-mix
function mixPrimaryWithBg(t: number) {
    const p = Math.max(0, Math.min(1, t));
    const pctPrimary = Math.round(p * 100);
    const pctBg = 100 - pctPrimary;
    return `color-mix(in oklab, hsl(var(--heroui-primary)) ${pctPrimary}%, hsl(var(--heroui-background)) ${pctBg}%)`;
}

// ---------- Legend ----------
function Legend({ min, max, position = "bottom" }: { min: number; max: number; position?: "right" | "bottom" }) {
    const isRight = position === "right";
    return (
        <div className={cn("flex items-center gap-3", isRight ? "flex-col justify-center pl-4" : "pt-3")}>
            <div className={cn("rounded-medium overflow-hidden", isRight ? "h-28 w-[18px]" : "h-[14px] w-40")}
                style={{ background: isRight ? `linear-gradient(180deg, ${mixPrimaryWithBg(0)} 0%, ${mixPrimaryWithBg(1)} 100%)` : `linear-gradient(90deg, ${mixPrimaryWithBg(0)} 0%, ${mixPrimaryWithBg(1)} 100%)` }}
            />
            <div className={cn("text-tiny text-default-500", isRight ? "flex flex-col gap-6" : "flex w-full justify-between")}>
                <span>{min.toLocaleString()}</span>
                <span>{max.toLocaleString()}</span>
            </div>
        </div>
    );
}

// ---------- Hook de medida ----------
function useMeasure(deps: any[] = []) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [rect, setRect] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
    useEffect(() => {
        if (!ref.current) return;
        const obs = new ResizeObserver((entries) => {
            for (const e of entries) setRect({ width: e.contentRect.width, height: e.contentRect.height });
        });
        obs.observe(ref.current);
        return () => obs.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
    return { ref, rect };
}

// ---------- Main component ----------
export default function HeatmapHero({
    data,
    width,
    height,
    margin = { top: 16, right: 16, bottom: 16, left: 16 },
    xDomain,
    yDomain,
    valueDomain,
    interpolate = "linear",
    cellSize,
    cellPadding = 2,
    cellRadius = 6,
    showGrid = true,
    xLabel,
    yLabel,
    valueFormatter = (v) => v.toLocaleString(),
    tooltip,
    onCellClick,
    legend = { show: true, position: "bottom" },
    controls = false,
    a11yTitle,
    a11yDescription,
    className,
}: HeatmapHeroProps) {
    const xDom = useMemo(() => xDomain ?? inferDomain(data.map((d) => d.x)), [data, xDomain]);
    const yDom = useMemo(() => yDomain ?? inferDomain(data.map((d) => d.y)), [data, yDomain]);
    const values = useMemo(() => data.map((d) => d.value), [data]);
    const [minV, maxV] = valueDomain ?? inferValueDomain(values);

    // Medida del contenedor
    const { ref, rect } = useMeasure([width, height, xDom.length, yDom.length]);
    const effWidth = width ?? rect.width;
    const effHeight = height ?? rect.height;

    // Dimensiones de celdas calculadas
    const rows = yDom.length;
    const cols = xDom.length;
    const baseCellH = cellSize?.height ?? 28;
    const legendBottomSpace = legend?.show && legend.position !== "right" ? 46 : 0;
    const innerH = Math.max(0, (effHeight || 0) - (margin.top + margin.bottom) - legendBottomSpace);
    const cellH = effHeight ? Math.max(20, Math.floor((innerH - (rows - 1) * cellPadding) / (rows || 1))) : baseCellH;

    // Map valor->intensidad
    const toT = (v?: number) => {
        if (typeof v !== "number" || Number.isNaN(v)) return 0;
        const tRaw = v <= minV ? 0 : v >= maxV ? 1 : (v - minV) / (maxV - minV || 1);
        if (interpolate === "log") return Math.log1p(tRaw * 9) / Math.log1p(9);
        if (interpolate === "quantize") { const buckets = 6; return Math.floor(tRaw * buckets) / (buckets - 1); }
        return tRaw;
    };

    // Lookup map
    const map = useMemo(() => {
        const m = new Map<string, HeatmapDatum>();
        for (const d of data) m.set(`${d.x}__${d.y}`, d);
        return m;
    }, [data]);

    // Estilos de grilla (solo celdas, sin ejes)
    const gridStyle: React.CSSProperties = {
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows}, ${cellH}px)`,
        gap: cellPadding,
    };

    // Animación: keyframes + delay por celda para efecto cascada
    const keyframes = `@keyframes hmFadeScale { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`;

    const heatmap = (
        <div className="w-full" style={{ width: width ? width : undefined, height: height ? height : undefined }}>
            <style>{keyframes}</style>
            <div className="flex gap-6" style={{ height: height ? height : undefined }}>
                {/* Columna izquierda: etiquetas Y */}
                <div className="flex flex-col items-end pr-2 pt-6" style={{ gap: cellPadding }}>
                    {yDom.map((y, rIdx) => (
                        <div key={`ylab-${String(y)}`} className="h-[var(--rowH)] text-tiny text-default-500 select-none"
                            style={{ height: cellH }}>{String(y).charAt(0)}</div>
                    ))}
                </div>

                {/* Zona principal: heatmap + eje X abajo */}
                <div className="flex-1 min-w-0">
                    {(xLabel || yLabel) && (
                        <div className="flex items-center justify-between px-1">
                            <div className="text-small text-default-500">{yLabel}</div>
                            <div className="text-small text-default-500">{xLabel}</div>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <div
                            className={cn(
                                showGrid && "[&>div>div]:ring-1 [&>div>div]:ring-default-200/60 dark:[&>div>div]:ring-default-100/40"
                            )}
                            style={gridStyle}
                            role="grid"
                            aria-label={a11yTitle}
                            aria-description={a11yDescription}
                        >
                            {yDom.map((y, rIdx) =>
                                xDom.map((x, cIdx) => {
                                    const d = map.get(`${x}__${y}`) ?? { x, y, value: NaN };
                                    const t = toT(d.value);
                                    const bg = mixPrimaryWithBg(t);
                                    const delay = (rIdx * cols + cIdx) * 12; // ms
                                    const cell = (
                                        <div
                                            key={`cell-${cIdx}-${rIdx}`}
                                            className={cn(
                                                "flex items-center justify-center rounded-medium",
                                                "will-change-[transform,opacity]"
                                            )}
                                            style={{
                                                background: bg,
                                                borderRadius: cellRadius,
                                                animation: `hmFadeScale 420ms ease-out both`,
                                                animationDelay: `${delay}ms`,
                                            }}
                                            onClick={() => onCellClick?.(d)}
                                            role="gridcell"
                                            aria-label={`${x} ${y} ${valueFormatter(d.value ?? 0)}`}
                                        />
                                    );

                                    return tooltip ? (
                                        <Tooltip key={`tt-${cIdx}-${rIdx}`} content={tooltip(d)} placement="top">
                                            {cell}
                                        </Tooltip>
                                    ) : (
                                        cell
                                    );
                                })
                            )}
                        </div>

                        {/* Eje X (iniciales) */}
                        <div className="mt-2 grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
                            {xDom.map((x, cIdx) => (
                                <div key={`xlab-${cIdx}-${String(x)}`} className="text-center text-tiny text-default-500 select-none">
                                    {String(x).charAt(0)}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Leyenda derecha */}
                {legend?.show && legend.position === "right" && (
                    <Legend min={minV} max={maxV} position="right" />
                )}
            </div>

            {/* Leyenda inferior */}
            {legend?.show && legend.position !== "right" && (
                <Legend min={minV} max={maxV} position="bottom" />
            )}
        </div>
    );

    return (
        <Card className={cn("shadow-xl shadow-black/10 dark:shadow-black/40 p-4", className)}>
            {a11yTitle && <h3 className="text-large font-semibold mb-2">{a11yTitle}</h3>}
            {controls && (
                <div className="flex flex-wrap items-center gap-3 mb-4">
                    <Select aria-label="Esquema de color" placeholder="primary (auto)" selectedKeys={["primary"]} className="w-44" isDisabled>
                        <SelectItem key="primary">primary (HeroUI)</SelectItem>
                    </Select>
                    <Switch defaultSelected={showGrid} isDisabled>
                        Mostrar grid
                    </Switch>
                    <Chip size="sm" variant="flat" color="default">
                        {xDom.length}×{yDom.length}
                    </Chip>
                </div>
            )}
            {/* Wrapper que capta el tamaño si no se pasan width/height */}
            <div ref={ref} className="w-full" style={{ height: height ?? undefined }}>
                <div ref={ref}>{heatmap}</div>
            </div>
        </Card>
    );
}