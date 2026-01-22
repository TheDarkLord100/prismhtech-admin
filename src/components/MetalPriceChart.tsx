"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { notify, Notification } from "@/utils/notify";

type RangeKey = "1W" | "1M" | "3M" | "6M" | "1Y" | "ALL";

const RANGES: { label: RangeKey; days?: number }[] = [
    { label: "1W", days: 7 },
    { label: "1M", days: 30 },
    { label: "3M", days: 90 },
    { label: "6M", days: 180 },
    { label: "1Y", days: 365 },
    { label: "ALL" },
];

interface PricePoint {
    price_date: string;
    price: number;
}

interface Props {
    metalId: string;
    metalName: string;
    token: string;
}

export function MetalPriceChart({ metalId, metalName, token }: Props) {
    const [range, setRange] = useState<RangeKey>("1M");
    const [data, setData] = useState<PricePoint[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData(range);
    }, [range]);

    async function loadData(r: RangeKey) {
        setLoading(true);

        const rangeConfig = RANGES.find((x) => x.label === r);
        let url = `/api/metals/${metalId}/history`;

        if (rangeConfig?.days) {
            const from = new Date();
            from.setDate(from.getDate() - rangeConfig.days);
            url += `?from=${from.toISOString().slice(0, 10)}`;
        }

        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json();
        setLoading(false);

        if (!res.ok) {
            notify(Notification.FAILURE, json.error);
            return;
        }

        setData(json.data);
    }

    const todayPrice = data.at(-1)?.price ?? null;
    const yesterdayPrice =
        data.length >= 2 ? data.at(-2)?.price : null;

    const trend: "up" | "down" | "neutral" =
        todayPrice != null && yesterdayPrice != null
            ? todayPrice > yesterdayPrice
                ? "up"
                : todayPrice < yesterdayPrice
                    ? "down"
                    : "neutral"
            : "neutral";

    const COLORS = {
        up: {
            stroke: "#4CAF50",
            fill: "rgba(76, 175, 80, 0.35)",
        },
        down: {
            stroke: "#E53935",
            fill: "rgba(229, 57, 53, 0.35)",
        },
        neutral: {
            stroke: "#9E9E9E",
            fill: "rgba(158, 158, 158, 0.25)",
        },
    };

    const chartColor = COLORS[trend];

    return (
        <div className="bg-white rounded-xl shadow-md p-4 space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <span className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                    {metalName}
                </span>

                <div className="flex gap-1">
                    {RANGES.map((r) => (
                        <Button
                            key={r.label}
                            size="sm"
                            variant={range === r.label ? "default" : "ghost"}
                            onClick={() => setRange(r.label)}
                        >
                            {r.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <div className="h-56">
                {loading ? (
                    <div className="h-full flex items-center justify-center text-gray-500">
                        Loading chart…
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop
                                        offset="0%"
                                        stopColor={chartColor.stroke}
                                        stopOpacity={0.4}
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor={chartColor.stroke}
                                        stopOpacity={0.05}
                                    />
                                </linearGradient>
                            </defs>
                            <Area
                                type="monotone"
                                dataKey="price"
                                stroke={chartColor.stroke}
                                fill="url(#priceFill)"
                                strokeWidth={2}
                            />

                            <XAxis
                                dataKey="price_date"
                                tickFormatter={(d) =>
                                    new Date(d).toLocaleDateString("en-IN", {
                                        month: "short",
                                        day: "numeric",
                                    })
                                }
                            />

                            <YAxis
                                tickFormatter={(v) => `₹${v}`}
                                domain={["dataMin - 10", "dataMax + 10"]}
                            />

                            <Tooltip
                                formatter={(value) => {
                                    if (value == null) return ["—", "Price"];
                                    return [`₹ ${value}`, "Price"];
                                }}
                                labelFormatter={(label) => {
                                    if (!label) return "";
                                    return new Date(label).toLocaleDateString("en-IN", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                    });
                                }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <div className="text-gray-500">Yesterday</div>
                    <div className="font-semibold">
                        {yesterdayPrice ? `₹ ${yesterdayPrice}` : "—"}
                    </div>
                </div>

                <div>
                    <div className="text-gray-500">Today</div>
                    <div className="font-semibold">
                        {todayPrice ? `₹ ${todayPrice}` : "—"}
                    </div>
                </div>
            </div>
        </div>
    );
}
