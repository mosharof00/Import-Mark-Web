import Link from "next/link"
import Image from "next/image"

import { brand } from "@/config/brand"
import { cn } from "@/lib/utils"

/**
 * Horizontal brand lockup: icon + name + tagline from `src/config/brand.ts`.
 * Pass `variant="full"` on auth pages to use the complete logo image.
 */
export function BrandLogo({
  href,
  className,
  showTagline = true,
  variant = "mark",
}: {
  href: string
  className?: string
  showTagline?: boolean
  variant?: "mark" | "full"
}) {
  if (variant === "full") {
    return (
      <Link
        href={href}
        className={cn("inline-flex items-center justify-center", className)}
        aria-label={`${brand.name} — home`}
      >
        <Image
          src={brand.logoFull}
          alt={brand.name}
          width={1007}
          height={400}
          className="h-14 w-auto object-contain sm:h-16"
          priority
        />
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className={cn("flex min-w-0 items-center gap-3", className)}
      aria-label={`${brand.name} — home`}
    >
      <Image
        src={brand.logoIcon}
        alt=""
        width={40}
        height={40}
        className="size-10 shrink-0 rounded-md object-contain"
        priority
      />

      <div className="min-w-0 leading-none">
        <p className="text-foreground truncate text-[13px] font-bold tracking-[0.16em]">
          {brand.shortName}
        </p>
        {showTagline ? (
          <p className="text-muted-foreground mt-1 truncate text-[10px] font-medium tracking-[0.12em] uppercase">
            {brand.tagline}
          </p>
        ) : null}
      </div>
    </Link>
  )
}
