import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Package, Wallet, Boxes } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { StatCard } from "@/components/shared/stat-card"
import { formatDate, formatTaka } from "@/lib/format"

function DetailCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="border-border bg-card rounded-2xl border p-6 shadow-sm">
      <h2 className="text-muted-foreground mb-4 text-xs font-medium tracking-wider uppercase">
        {title}
      </h2>
      {children}
    </section>
  )
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-foreground text-right font-medium">{value}</span>
    </div>
  )
}

export async function ProductDetail({ productId }: { productId: string }) {
  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from("products")
    .select(
      "id, name, sku, sell_price, unit, unit_size, status, description, specifications, origin_country, image_urls, created_at, categories(name), brands(name), stock(quantity_available, low_stock_threshold)"
    )
    .eq("id", productId)
    .eq("status", "active")
    .single()

  if (error || !product) notFound()

  const stock = Array.isArray(product.stock) ? product.stock[0] : product.stock
  const stockQty = stock?.quantity_available ?? null
  const threshold = stock?.low_stock_threshold ?? null
  const isLowStock =
    stockQty !== null && threshold !== null && stockQty <= threshold

  return (
    <div className="space-y-6">
      <Link
        href="/customer/products"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to products
      </Link>

      <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
        <div className="min-w-0 space-y-2">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            {product.name}
          </h1>
          <p className="text-muted-foreground text-sm">
            {product.sku ? `SKU ${product.sku}` : "No SKU"}
            {" · "}
            {product.categories?.name ?? "Uncategorized"}
            {product.brands?.name ? ` · ${product.brands.name}` : ""}
          </p>
          {stockQty !== null && stockQty <= 0 ? (
            <p className="text-sm font-medium text-red-700 dark:text-red-400">
              Currently out of stock
            </p>
          ) : isLowStock ? (
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
              Limited stock — {stockQty} available
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Price"
          value={formatTaka(product.sell_price)}
          icon={Wallet}
          hint={`Per ${product.unit}`}
        />
        <StatCard
          label="Availability"
          value={
            stockQty === null
              ? "—"
              : stockQty <= 0
                ? "Out of stock"
                : stockQty
          }
          icon={Boxes}
          accent={
            stockQty !== null && stockQty <= 0
              ? "red"
              : isLowStock
                ? "amber"
                : "default"
          }
          hint={
            stockQty !== null && stockQty > 0
              ? `${product.unit} available`
              : "Contact your manager to order"
          }
        />
        <StatCard
          label="Unit"
          value={product.unit}
          icon={Package}
          hint={
            product.unit_size !== null ? `Size ${product.unit_size}` : "—"
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <DetailCard title="Description">
            {product.description ? (
              <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            ) : (
              <p className="text-muted-foreground text-sm">No description.</p>
            )}
          </DetailCard>

          <DetailCard title="Specifications">
            {product.specifications ? (
              <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                {product.specifications}
              </p>
            ) : (
              <p className="text-muted-foreground text-sm">
                No specifications listed.
              </p>
            )}
          </DetailCard>
        </div>

        <div className="space-y-6">
          <DetailCard title="Product details">
            <div className="divide-border divide-y">
              <MetaRow label="Unit" value={product.unit} />
              <MetaRow
                label="Unit size"
                value={product.unit_size ?? "—"}
              />
              <MetaRow
                label="Origin"
                value={product.origin_country ?? "—"}
              />
              <MetaRow
                label="Category"
                value={product.categories?.name ?? "—"}
              />
              <MetaRow label="Brand" value={product.brands?.name ?? "—"} />
              <MetaRow
                label="Listed since"
                value={formatDate(product.created_at)}
              />
            </div>
          </DetailCard>

          {product.image_urls && product.image_urls.length > 0 ? (
            <DetailCard title="Images">
              <div className="grid grid-cols-2 gap-3">
                {product.image_urls.map((url) => (
                  <div
                    key={url}
                    className="border-border bg-muted/40 aspect-square overflow-hidden rounded-xl border"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={product.name}
                      className="size-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </DetailCard>
          ) : (
            <DetailCard title="Images">
              <div className="bg-muted/40 text-muted-foreground flex aspect-video flex-col items-center justify-center rounded-xl">
                <Package className="mb-2 size-8 opacity-50" />
                <p className="text-sm">No images uploaded</p>
              </div>
            </DetailCard>
          )}
        </div>
      </div>
    </div>
  )
}
