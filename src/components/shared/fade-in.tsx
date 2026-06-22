import { cn } from "@/lib/utils"

/**
 * Wraps content in a staggered "fade-up" entrance. Pass `delay` (ms) to stagger
 * sections — e.g. 0, 100, 200, 300 down the page. Uses the `animate-fade-up`
 * keyframe defined in globals.css (CSS only, no animation library).
 */
export function FadeIn({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode
  delay?: number
  className?: string
  as?: React.ElementType
}) {
  return (
    <Tag
      className={cn("animate-fade-up", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  )
}
