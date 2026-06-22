import { PackageCheck } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { ApprovalButtons } from "@/components/shared/approval-buttons"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorCard } from "@/components/shared/error-card"
import { formatTaka, formatRelativeTime } from "@/lib/format"
import { approveProduct, rejectProduct } from "@/app/(admin)/admin/actions"

export async function ProductApprovalQueue() {
  const supabase = await createClient()

  try {
    const { data: products, error } = await supabase
      .from("products")
      .select(
        "id, name, sell_price, created_at, created_by, categories(name), brands(name)"
      )
      .eq("status", "pending_approval")
      .order("created_at", { ascending: true })

    if (error) throw error

    const { data: managers } = await supabase
      .from("managers")
      .select("id, full_name")
    const managerName = new Map(
      (managers ?? []).map((m) => [m.id, m.full_name])
    )

    const rows = products ?? []

    return (
      <section className="border-border bg-card flex h-full flex-col rounded-2xl border p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <h2 className="text-foreground text-lg font-semibold">
            Product Approval Queue
          </h2>
          {rows.length > 0 ? (
            <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
              {rows.length}
            </span>
          ) : null}
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={PackageCheck}
            title="No products to approve"
            description="New products submitted by managers will appear here."
          />
        ) : (
          <ul className="divide-border divide-y">
            {rows.map((product, index) => (
              <li
                key={product.id}
                className="animate-fade-up flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="min-w-0">
                  <p className="text-foreground font-medium">{product.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {product.categories?.name ?? "Uncategorized"}
                    {product.brands?.name ? ` · ${product.brands.name}` : ""}
                    {` · ${formatTaka(product.sell_price)}`}
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {managerName.get(product.created_by) ?? "Staff"} ·{" "}
                    {formatRelativeTime(product.created_at)}
                  </p>
                </div>
                <ApprovalButtons
                  itemLabel="product"
                  onApprove={approveProduct.bind(null, product.id)}
                  onReject={rejectProduct.bind(null, product.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    )
  } catch {
    return <ErrorCard title="Couldn't load product queue" />
  }
}
