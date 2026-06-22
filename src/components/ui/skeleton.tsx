import { cn } from "@/lib/utils"

/**
 * Loading placeholder with a warm beige shimmer (not generic gray) so it blends
 * with the editorial palette. Shape it with width/height/rounded classes.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-[#ddd8cb]/60 animate-pulse rounded-md",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
