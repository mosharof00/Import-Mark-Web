"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { formatTaka } from "@/lib/format"
import type { RevenuePoint } from "@/app/(admin)/admin/_components/revenue-chart"

// Minimal, well-typed tooltip (no `any`). Recharts injects these props.
function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value?: number; payload?: RevenuePoint }>
  label?: string
}) {
  if (!active || !payload || payload.length === 0) return null
  const value = payload[0]?.value ?? 0
  return (
    <div className="border-border bg-card rounded-xl border px-3 py-2 shadow-md">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-foreground text-sm font-semibold tabular-nums">
        {formatTaka(value)}
      </p>
    </div>
  )
}

export function RevenueChartClient({
  data,
  total,
}: {
  data: RevenuePoint[]
  total: number
}) {
  return (
    <div>
      <p className="text-foreground mb-4 text-2xl font-semibold tracking-tight">
        {formatTaka(total)}
        <span className="text-muted-foreground ml-2 text-xs font-normal">
          total delivered
        </span>
      </p>

      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#141414" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#141414" stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* Only light horizontal guides — no vertical clutter. */}
            <CartesianGrid
              vertical={false}
              stroke="#141414"
              strokeOpacity={0.08}
            />

            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              interval={4}
              tick={{ fontSize: 11, fill: "#828282" }}
              dy={8}
            />
            <YAxis hide />

            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: "#828282", strokeOpacity: 0.3 }}
            />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#141414"
              strokeWidth={2}
              fill="url(#revenueFill)"
              activeDot={{ r: 4, fill: "#141414" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
