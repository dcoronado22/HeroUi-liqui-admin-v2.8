export const fmtPct = (n: number) => `${Math.round(n)} %`;

export const Dots = ({ pct }: { pct: number }) => {
    const filled = Math.round((pct / 100) * 5);
    const isFull = pct === 100;

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                    <span
                        key={i}
                        className={[
                            "inline-block h-3 w-3 rounded-full",
                            i < filled
                                ? isFull
                                    ? "bg-success" // verde cuando es 100%
                                    : "bg-primary"
                                : "bg-default-300/40 dark:bg-default-500/40",
                        ].join(" ")}
                    />
                ))}
            </div>
            <span
                className={[
                    "text-sm text-foreground/70",
                ].join(" ")}
            >
                {fmtPct(pct)}
            </span>
        </div>
    );
};