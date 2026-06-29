"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"

export function OrderPlacedToast() {
  const searchParams = useSearchParams()
  const placed = searchParams.get("placed")

  useEffect(() => {
    if (placed === "1") {
      toast.success("Order placed successfully — awaiting admin approval.")
    }
  }, [placed])

  return null
}
