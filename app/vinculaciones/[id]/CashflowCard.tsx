"use client";

import React from "react";
import { Card, CardBody, CardHeader, Skeleton, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import GraphDual, { GraphDualItem, ChartDataPoint } from "@/components/Graphs/DualGraph";
import { getCashflow, CashflowRow } from "@/lib/api/getCashflow";

const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;
const mabbr = (n: number) => M[Math.max(1, Math.min(12, n)) - 1];

function buildCombined(rows: CashflowRow[]): GraphDualItem[] {
    const sorted = [...rows].sort((a, b) => a.year - b.year || a.month - b.month);
    const last12 = sorted.slice(-12);

    const data: ChartDataPoint[] = last12.map(r => ({
        month: mabbr(r.month),
        value: r.in,            // Ingresos -> línea/área principal
        lastYearValue: r.out,   // Egresos -> línea de comparación (roja)
    }));

    const lastIn = data.at(-1)?.value ?? 0;
    const prevIn = data.at(-2)?.value ?? 0;
    const changeP = prevIn ? (((lastIn - prevIn) / Math.abs(prevIn)) * 100) : 0;

    return [{
        key: "cashflow",
        title: "CashFlow",
        value: lastIn,
        suffix: "MXN",
        type: "number",
        change: `${changeP >= 0 ? "+" : ""}${changeP.toFixed(1)}%`,
        changeType: changeP > 0 ? "positive" : changeP < 0 ? "negative" : "neutral",
        chartData: data,
    }];
}

export default function CashflowCard({ id }: { id: string }) {
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [items, setItems] = React.useState<GraphDualItem[]>([]);

    React.useEffect(() => {
        let on = true; (async () => {
            try {
                setLoading(true);
                const rows = await getCashflow(id);
                if (!on) return;
                setItems(buildCombined(rows));
            } catch (e: any) { setError(e?.message ?? "Error"); }
            finally { on && setLoading(false); }
        })(); return () => { on = false; };
    }, [id]);

    if (loading) {
        return (
            <Card shadow="sm">
                <CardHeader className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Icon icon="solar:chart-2-linear" className="text-xl" />
                        <div className="font-semibold">CashFlow</div>
                    </div>
                </CardHeader>
                <CardBody className="space-y-3">
                    <Skeleton className="h-8 w-60 rounded-md" />
                    <Skeleton className="h-72 w-full rounded-xl" />
                </CardBody>
            </Card>
        );
    }
    if (error || !items.length) {
        return <Card shadow="sm"><CardBody className="text-danger">{error ?? "Sin datos"}</CardBody></Card>;
    }

    return (
        <div className="space-y-2 py-3 ">
            {/* Leyenda simple */}

            <GraphDual
                title="CashFlow (últimos 12 meses)"
                items={items}                 // un solo item -> no muestra tarjetas de Ingresos/Egresos
                tabs={[]}                     // sin tabs de periodo
                showComparison                // muestra la 2da serie (egresos)
                colors={{
                    positive: "success",        // color de la serie principal (Ingresos)
                    negative: "success",
                    neutral: "default",
                    comparison: "danger",       // color de la comparación (Egresos)
                }}
                menuItems={[]}                // evita menú (quedará sin opciones; si quieres, podemos ocultar el botón con CSS)
                initialActiveKey="cashflow"
                visibleCards={false}
                customCard={
                    <>
                        <div className="flex items-center gap-4 px-1">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-6 rounded-full" style={{ background: "hsl(var(--heroui-success))" }} />
                                <span className="text-small text-foreground-500">Ingresos</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-6 rounded-full" style={{ background: "hsl(var(--heroui-danger))" }} />
                                <span className="text-small text-foreground-500">Egresos</span>
                            </div>
                        </div></>
                }
            />
        </div>
    );
}