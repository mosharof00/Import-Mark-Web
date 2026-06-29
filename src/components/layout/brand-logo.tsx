import Link from "next/link"
import Image from "next/image"

import { cn } from "@/lib/utils"

/**
 * Horizontal brand lockup: monogram mark + wordmark.
 * Uses a dedicated icon asset cropped from the master logo for crisp display.
 */
export function BrandLogo({
  href,
  className,
  showTagline = true,
}: {
  href: string
  className?: string
  showTagline?: boolean
}) {
  return (
    <Link
      href={href}
      className={cn("flex min-w-0 items-center gap-3", className)}
      aria-label="ImportMark home"
    >
      <Image
        src="/importmark-icon.png"
        alt=""
        width={40}
        height={40}
        className="size-10 shrink-0 object-contain"
        priority
      />

      <div className="min-w-0 leading-none">
        <p className="text-foreground truncate text-[13px] font-bold tracking-[0.16em]">
          IMPORTMARK
        </p>
        {showTagline ? (
          <p className="text-muted-foreground mt-1 truncate text-[10px] font-medium tracking-[0.12em] uppercase">
            Wholesale Platform
          </p>
        ) : null}
      </div>
    </Link>
  )
}
