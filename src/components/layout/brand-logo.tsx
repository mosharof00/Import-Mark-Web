import Link from "next/link"

import { brand } from "@/config/brand"
import { cn } from "@/lib/utils"

function brandSrc(path: string) {
  const separator = path.includes("?") ? "&" : "?"
  return `${path}${separator}v=${brand.assetVersion}`
}

/**
 * Horizontal brand lockup: icon + name + tagline from `src/config/brand.ts`.
 * Pass `variant="full"` on auth pages to use the complete logo image.
 *
 * Uses a plain img (not next/image) so replacing files in `public/` is not
 * stuck behind the image optimizer cache.
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={brandSrc(brand.logoFull)}
          alt={brand.name}
          width={1007}
          height={400}
          className="h-14 w-auto object-contain sm:h-16"
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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={brandSrc(brand.logoIcon)}
        alt=""
        width={40}
        height={40}
        className="size-10 shrink-0 rounded-md object-contain"
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
