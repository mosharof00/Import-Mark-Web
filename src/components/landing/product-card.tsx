"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { motion } from "framer-motion"

import { formatCurrency } from "@/lib/format-currency"
import type { PublicProductListItem } from "@/lib/products/public-catalog"
import { cn } from "@/lib/utils"

import { Stagger, StaggerItem } from "./motion"

export function ProductCard({
  product,
  showPrice,
  currencySymbol,
  currencyLocale,
  className,
}: {
  product: PublicProductListItem
  showPrice: boolean
  currencySymbol: string
  currencyLocale: string
  className?: string
}) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group border-border bg-card relative overflow-hidden rounded-3xl border shadow-sm",
        className
      )}
    >
      <Link href={`/products/${product.id}`} className="block">
        <div className="bg-muted relative aspect-[4/3] overflow-hidden">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="text-muted-foreground flex size-full items-center justify-center text-sm">
              No image
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        <div className="space-y-2 p-5">
          <p className="text-muted-foreground text-xs tracking-wide uppercase">
            {product.brandName ?? product.categoryName}
          </p>
          <h3 className="text-lg font-semibold leading-snug">{product.name}</h3>
          <div className="flex items-center justify-between gap-3 pt-1">
            {showPrice ? (
              <p className="text-base font-semibold tabular-nums">
                {formatCurrency(product.sellPrice, {
                  symbol: currencySymbol,
                  locale: currencyLocale,
                })}
                <span className="text-muted-foreground ml-1 text-xs font-normal">
                  / {product.unit}
                </span>
              </p>
            ) : (
              <p className="text-muted-foreground text-sm">View details</p>
            )}
            <span className="bg-primary text-primary-foreground inline-flex size-8 items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100">
              <ArrowUpRight className="size-4" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}

export function ProductGrid({
  products,
  showPrice,
  currencySymbol,
  currencyLocale,
}: {
  products: PublicProductListItem[]
  showPrice: boolean
  currencySymbol: string
  currencyLocale: string
}) {
  if (!products.length) {
    return (
      <p className="text-muted-foreground py-12 text-center text-sm">
        No products are available right now.
      </p>
    )
  }

  return (
    <Stagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <StaggerItem key={product.id}>
          <ProductCard
            product={product}
            showPrice={showPrice}
            currencySymbol={currencySymbol}
            currencyLocale={currencyLocale}
          />
        </StaggerItem>
      ))}
    </Stagger>
  )
}
