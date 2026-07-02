import Link from "next/link"

import { BrandLogo } from "@/components/layout/brand-logo"

export function LandingFooter() {
  return (
    <footer className="border-border border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <BrandLogo href="/" />
        <p className="text-muted-foreground max-w-md text-sm">
          ImportMark — construction chemicals import & wholesale. Quality
          products for builders, contractors, and traders across Bangladesh.
        </p>
        <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
          <Link href="/products" className="hover:text-foreground">
            Products
          </Link>
          <Link href="/#about" className="hover:text-foreground">
            About
          </Link>
          <Link href="/#contact" className="hover:text-foreground">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  )
}
