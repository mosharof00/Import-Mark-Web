import Link from "next/link"
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react"

import { Reveal } from "@/components/landing/motion"
import { ProductGrid } from "@/components/landing/product-card"
import { buttonVariants } from "@/components/ui/button"
import { brand } from "@/config/brand"
import {
  getLandingCurrency,
  getLandingSettings,
} from "@/lib/landing/get-landing-settings"
import { getPublicProducts } from "@/lib/products/public-catalog"
import { cn } from "@/lib/utils"

export default async function LandingPage() {
  const [settings, currency, products] = await Promise.all([
    getLandingSettings(),
    getLandingCurrency(),
    getPublicProducts(6),
  ])

  return (
    <>
      <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(20,20,20,0.06),transparent_55%)]" />
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="text-muted-foreground mb-4 text-sm tracking-[0.2em] uppercase">
              Construction chemicals · Wholesale
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
              Quality imports for modern construction
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-relaxed">
              {brand.name} supplies trusted brands in waterproofing, admixtures,
              sealants, and specialty chemicals — with a streamlined ordering
              experience for contractors and traders.
            </p>
          </Reveal>
          <Reveal delay={0.18} className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/products"
              className={cn(buttonVariants({ size: "lg" }), "rounded-full px-6")}
            >
              Browse products
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/#contact"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-full px-6"
              )}
            >
              Contact us
            </Link>
          </Reveal>
        </div>
      </section>

      <section id="products" className="scroll-mt-24 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-muted-foreground text-sm tracking-[0.18em] uppercase">
                Catalog
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                Featured products
              </h2>
            </div>
            <Link
              href="/products"
              className={buttonVariants({ variant: "ghost" })}
            >
              View all
              <ArrowRight className="size-4" />
            </Link>
          </Reveal>
          <ProductGrid
            products={products}
            showPrice={settings.showProductPrices}
            currencySymbol={currency.symbol}
            currencyLocale={currency.locale}
          />
        </div>
      </section>

      <section id="about" className="scroll-mt-24 px-4 py-16 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <p className="text-muted-foreground text-sm tracking-[0.18em] uppercase">
              About
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Built for importers, managers, and customers
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="text-muted-foreground text-lg leading-relaxed">
              We combine catalog management, inventory control, and customer
              ordering in one platform. Browse our active product range publicly,
              register as a customer to place orders, and track fulfillment from
              approval to delivery.
            </p>
          </Reveal>
        </div>
      </section>

      <section id="contact" className="scroll-mt-24 px-4 pb-24 pt-8 sm:px-6">
        <div className="border-border bg-card mx-auto max-w-6xl rounded-[2rem] border p-8 sm:p-12">
          <Reveal>
            <p className="text-muted-foreground text-sm tracking-[0.18em] uppercase">
              Contact
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Let&apos;s talk about your next order
            </h2>
          </Reveal>
          <Reveal delay={0.08} className="mt-8 grid gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <Mail className="text-muted-foreground size-5" />
              <p className="font-medium">Email</p>
              <a
                href={`mailto:${brand.contact.email}`}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                {brand.contact.email}
              </a>
            </div>
            <div className="space-y-2">
              <Phone className="text-muted-foreground size-5" />
              <p className="font-medium">Phone</p>
              <p className="text-muted-foreground text-sm">{brand.contact.phone}</p>
            </div>
            <div className="space-y-2">
              <MapPin className="text-muted-foreground size-5" />
              <p className="font-medium">Office</p>
              <p className="text-muted-foreground text-sm">
                {brand.contact.location}
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
