import { cn } from "@/lib/utils"

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

const sizeClasses = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-16 text-xl",
  xl: "size-24 text-3xl",
} as const

export function Avatar({
  name,
  src,
  size = "md",
  className,
}: {
  name: string
  src?: string | null
  size?: keyof typeof sizeClasses
  className?: string
}) {
  const initials = getInitials(name || "?")

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={cn(
          "shrink-0 rounded-full object-cover bg-muted",
          sizeClasses[size],
          className
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-primary font-semibold text-primary-foreground",
        sizeClasses[size],
        className
      )}
      aria-hidden={!name}
    >
      {initials}
    </div>
  )
}
