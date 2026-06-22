import Link from "next/link"
import { Pencil } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** Links to the edit screen for an existing product. */
export function EditProductButton({
  productId,
  className,
}: {
  productId: string
  className?: string
}) {
  return (
    <Link
      href={`/admin/products/${productId}/edit`}
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        "gap-1.5 rounded-full px-4",
        className
      )}
    >
      <Pencil className="size-3.5" />
      Edit
    </Link>
  )
}
