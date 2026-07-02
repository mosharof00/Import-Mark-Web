import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { ProductGrid } from "@/components/landing/product-card"
import { Reveal } from "@/components/landing/motion"
import { buttonVariants } from "@/components/ui/button"
import {
  getLandingCurrency,
  getLandingSettings,
} from "@/lib/landing/get-landing-settings"
import { getPublicProducts } from "@/lib/products/public-catalog"

export const dynamic = "force-dynamic"

export default async function PublicProductsPage() {
  const [settings, currency, products] = await Promise.all([
    getLandingSettings(),
    getLandingCurrency(),
    getPublicProducts(),
  ])

  return (
    <div className="px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-2 text-sm"
        >
          <ArrowLeft className="size-4" />
          Back to home
        </Link>
        <Reveal>
          <h1 className="text-4xl font-semibold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-3 max-w-2xl text-lg">
            Explore our active catalog of construction chemicals and specialty
            materials.
          </p>
        </Reveal>
        <div className="mt-10">
          <ProductGrid
            products={products}
            showPrice={settings.showProductPrices}
            currencySymbol={currency.symbol}
            currencyLocale={currency.locale}
          />
        </div>
      </div>
    </div>
  )
}
