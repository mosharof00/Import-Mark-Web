import Link from "next/link"
import { Plus } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** Pill CTA linking to the dedicated add-product screen. */
export function AddProductButton({ className }: { className?: string }) {
  return (
    <Link
      href="/admin/products/new"
      className={cn(
        buttonVariants({ size: "sm" }),
        "mb-px gap-1.5 rounded-full px-5",
        className
      )}
    >
      <Plus className="size-4" />
      Add Product
    </Link>
  )
}
