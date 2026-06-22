import { createClient } from "@/lib/supabase/server"
import { getAuthedUser } from "@/lib/auth/get-user"
import { ErrorCard } from "@/components/shared/error-card"
import { RevenueChartClient } from "@/app/(admin)/admin/_components/revenue-chart-client"

export type RevenuePoint = {
  day: string
  label: string
  revenue: number
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export async function RevenueChart() {
  const { user } = await getAuthedUser()
  if (!user) return <ErrorCard title="Couldn't load sales chart" />

  const supabase = await createClient()

  try {
    const today = new Date()
    const start = new Date(today)
    start.setDate(start.getDate() - 29)
    start.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from("sales_orders")
      .select("total_amount, created_at")
      .eq("created_by", user.id)
      .eq("status", "delivered")
      .gte("created_at", start.toISOString())

    if (error) throw error

    const buckets = new Map<string, number>()
    const labelFmt = new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
    })
    const points: RevenuePoint[] = []
    for (let i = 0; i < 30; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      const key = dayKey(d)
      buckets.set(key, 0)
      points.push({ day: key, label: labelFmt.format(d), revenue: 0 })
    }

    for (const row of data ?? []) {
      const key = row.created_at.slice(0, 10)
      if (buckets.has(key)) {
        buckets.set(key, (buckets.get(key) ?? 0) + row.total_amount)
      }
    }
    for (const p of points) p.revenue = buckets.get(p.day) ?? 0

    const total = points.reduce((sum, p) => sum + p.revenue, 0)

    return (
      <section className="border-border bg-card rounded-2xl border p-6 shadow-sm">
        <div className="mb-1 flex items-baseline justify-between gap-3">
          <h2 className="text-foreground text-lg font-semibold">My Sales</h2>
          <span className="text-muted-foreground text-xs tracking-wider uppercase">
            Last 30 days
          </span>
        </div>
        <RevenueChartClient data={points} total={total} />
      </section>
    )
  } catch {
    return <ErrorCard title="Couldn't load sales chart" />
  }
}
