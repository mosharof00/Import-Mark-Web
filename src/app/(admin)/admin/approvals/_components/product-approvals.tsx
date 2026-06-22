import { PackageCheck } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { ApprovalButtons } from "@/components/shared/approval-buttons"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorCard } from "@/components/shared/error-card"
import { formatTaka, formatRelativeTime } from "@/lib/format"
import { approveProduct, rejectProduct } from "@/app/(admin)/admin/actions"

/**
 * Full list of products awaiting admin approval. Mirrors the dashboard's
 * compact queue but as a complete, table-based management view.
 */
export async function ProductApprovals() {
  const supabase = await createClient()

  try {
    const { data: products, error } = await supabase
      .from("products")
      .select(
        "id, name, sku, sell_price, unit, origin_country, created_at, created_by, categories(name), brands(name)"
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

    if (rows.length === 0) {
      return (
        <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <EmptyState
            icon={PackageCheck}
            title="No products to approve"
            description="New products submitted by managers will appear here."
          />
        </div>
      )
    }

    return (
      <div className="border-border bg-card overflow-x-auto rounded-2xl border p-2 shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-muted-foreground text-left text-xs tracking-wider uppercase">
              <th className="px-3 py-3 font-medium">Product</th>
              <th className="px-3 py-3 font-medium">Category</th>
              <th className="px-3 py-3 font-medium">Brand</th>
              <th className="px-3 py-3 text-right font-medium">Sell price</th>
              <th className="px-3 py-3 font-medium">Submitted by</th>
              <th className="px-3 py-3 font-medium">When</th>
              <th className="px-3 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((product, index) => (
              <tr
                key={product.id}
                className="border-border animate-fade-up hover:bg-muted/40 border-t transition-colors"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="px-3 py-4">
                  <div className="text-foreground font-medium">
                    {product.name}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {product.sku ? `${product.sku} · ` : ""}
                    {product.origin_country ?? "—"}
                  </div>
                </td>
                <td className="text-muted-foreground px-3 py-4 whitespace-nowrap">
                  {product.categories?.name ?? "Uncategorized"}
                </td>
                <td className="text-muted-foreground px-3 py-4 whitespace-nowrap">
                  {product.brands?.name ?? "—"}
                </td>
                <td className="text-foreground px-3 py-4 text-right whitespace-nowrap tabular-nums">
                  {formatTaka(product.sell_price)}
                  <span className="text-muted-foreground text-xs">
                    {product.unit ? ` / ${product.unit}` : ""}
                  </span>
                </td>
                <td className="text-muted-foreground px-3 py-4 whitespace-nowrap">
                  {managerName.get(product.created_by) ?? "Staff"}
                </td>
                <td className="text-muted-foreground px-3 py-4 whitespace-nowrap">
                  {formatRelativeTime(product.created_at)}
                </td>
                <td className="px-3 py-4">
                  <div className="flex justify-end">
                    <ApprovalButtons
                      itemLabel="product"
                      onApprove={approveProduct.bind(null, product.id)}
                      onReject={rejectProduct.bind(null, product.id)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  } catch {
    return <ErrorCard title="Couldn't load product approvals" />
  }
}
