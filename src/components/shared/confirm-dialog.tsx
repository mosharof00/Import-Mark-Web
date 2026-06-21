"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type ActionResult = { error?: string } | void

/**
 * Generic confirmation dialog. Wrap any trigger element and supply an
 * `onConfirm` (usually a server action). Used for destructive or irreversible
 * actions like cancelling an order or deactivating a user.
 *
 * Example:
 *   <ConfirmDialog
 *     trigger={<Button variant="destructive">Cancel order</Button>}
 *     title="Cancel this order?"
 *     onConfirm={() => cancelOrder(order.id)}
 *   />
 */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  destructive = false,
  successMessage,
  onConfirm,
}: {
  trigger: React.ReactElement
  title: string
  description?: string
  confirmLabel?: string
  destructive?: boolean
  successMessage?: string
  onConfirm: () => Promise<ActionResult>
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleConfirm() {
    startTransition(async () => {
      const result = await onConfirm()
      if (result?.error) {
        toast.error(result.error)
      } else {
        if (successMessage) toast.success(successMessage)
        setOpen(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <DialogFooter>
          <DialogClose
            render={
              <Button variant="outline" disabled={isPending}>
                Cancel
              </Button>
            }
          />
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? "Working..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
