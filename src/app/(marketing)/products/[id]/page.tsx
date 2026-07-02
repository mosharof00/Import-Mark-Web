import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { Reveal } from "@/components/landing/motion"
import { ProductImageGallery } from "@/components/shared/product-image-gallery"
import { getAuthedUser } from "@/lib/auth/get-user"
import { dashboardPathForRole } from "@/lib/auth/roles"
import { formatCurrency } from "@/lib/format-currency"
import {
  getLandingCurrency,
  getLandingSettings,
} from "@/lib/landing/get-landing-settings"
import { getPublicProduct } from "@/lib/products/public-catalog"
import { cn } from "@/lib/utils"

import { ProductOrderCta } from "./_components/product-order-cta"

export const dynamic = "force-dynamic"

export default async function PublicProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [{ user, role }, settings, currency, product] = await Promise.all([
    getAuthedUser(),
    getLandingSettings(),
    getLandingCurrency(),
    getPublicProduct(id),
  ])

  if (!product) notFound()

  const orderPath = `/customer/orders/new?productId=${product.id}`
  const loginNext = encodeURIComponent(orderPath)

  return (
    <div className="px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/products"
          className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-2 text-sm"
        >
          <ArrowLeft className="size-4" />
          All products
        </Link>

        <div className="grid gap-10 lg:grid-cols-2">
          <Reveal>
            <ProductImageGallery imageUrls={product.imageUrls} alt={product.name} />
          </Reveal>

          <div className="space-y-6">
            <Reveal delay={0.05}>
              <p className="text-muted-foreground text-sm tracking-wide uppercase">
                {product.brandName ?? product.categoryName}
              </p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight">
                {product.name}
              </h1>
              {product.sku ? (
                <p className="text-muted-foreground mt-2 text-sm">
                  SKU: {product.sku}
                </p>
              ) : null}
            </Reveal>

            <Reveal delay={0.1}>
              <div className="flex flex-wrap items-center gap-3">
                {settings.showProductPrices ? (
                  <p className="text-2xl font-semibold tabular-nums">
                    {formatCurrency(product.sellPrice, {
                      symbol: currency.symbol,
                      locale: currency.locale,
                    })}
                    <span className="text-muted-foreground ml-2 text-base font-normal">
                      / {product.unit}
                    </span>
                  </p>
                ) : null}
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium",
                    product.inStock
                      ? "bg-emerald-500/10 text-emerald-700"
                      : "bg-destructive/10 text-destructive"
                  )}
                >
                  {product.inStock ? "In stock" : "Out of stock"}
                </span>
              </div>
            </Reveal>

            <Reveal delay={0.14}>
              <ProductOrderCta
                inStock={product.inStock}
                canPlaceOrders={settings.customerCanPlaceOrders}
                showRegistration={settings.publicRegistration}
                isLoggedIn={Boolean(user)}
                role={role}
                orderPath={orderPath}
                loginNext={loginNext}
                dashboardHref={role ? dashboardPathForRole(role) : "/login"}
              />
            </Reveal>

            {product.description ? (
              <Reveal delay={0.18}>
                <h2 className="text-lg font-semibold">Description</h2>
                <p className="text-muted-foreground mt-2 leading-relaxed">
                  {product.description}
                </p>
              </Reveal>
            ) : null}

            {product.specifications ? (
              <Reveal delay={0.22}>
                <h2 className="text-lg font-semibold">Specifications</h2>
                <p className="text-muted-foreground mt-2 whitespace-pre-wrap leading-relaxed">
                  {product.specifications}
                </p>
              </Reveal>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
