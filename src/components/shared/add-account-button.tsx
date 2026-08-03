import Link from "next/link"
import { Plus } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function AddAccountButton({
  href,
  label,
  className,
}: {
  href: string
  label: string
  className?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({ size: "sm" }),
        "mb-px gap-1.5 rounded-full px-5",
        className
      )}
    >
      <Plus className="size-4" />
      {label}
    </Link>
  )
}
