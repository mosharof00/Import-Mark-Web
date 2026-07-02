"use client"

import { useState, useTransition } from "react"
import { ArrowRight, PackageCheck } from "lucide-react"
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
import { ORDER_STATUS_CONFIG } from "@/lib/constants"
import {
  advanceOrderStatus,
  markOrderDelivered,
} from "@/lib/orders/order-status-actions"
import { getNextOrderStatus } from "@/lib/orders/status-flow"
import type { DeliveryMethod, OrderStatus } from "@/types"

export function OrderFulfillmentActions({
  orderId,
  status,
  deliveryMethod,
}: {
  orderId: string
  status: OrderStatus
  deliveryMethod: DeliveryMethod
}) {
  const nextStatus = getNextOrderStatus(status, deliveryMethod)
  const [note, setNote] = useState("")
  const [open, setOpen] = useState(false)
  const [deliverOpen, setDeliverOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (!nextStatus) return null

  const nextLabel = ORDER_STATUS_CONFIG[nextStatus].label
  const currentLabel = ORDER_STATUS_CONFIG[status].label
  const canSkipToDelivered = nextStatus !== "delivered"

  function handleAdvance() {
    startTransition(async () => {
      const result = await advanceOrderStatus(orderId, note)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success(`Order marked as ${nextLabel.toLowerCase()}.`)
      setNote("")
      setOpen(false)
    })
  }

  function handleDeliver() {
    startTransition(async () => {
      const result = await markOrderDelivered(orderId, note)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success("Order marked as delivered.")
      setNote("")
      setDeliverOpen(false)
    })
  }

  return (
    <div className="border-border bg-card rounded-2xl border p-4 shadow-sm">
      <p className="text-muted-foreground mb-1 text-sm">Fulfillment</p>
      <p className="mb-4 text-sm">
        Current status:{" "}
        <span className="text-foreground font-medium">{currentLabel}</span>
      </p>

      <div className="flex flex-wrap gap-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button className="rounded-full" disabled={isPending}>
                <ArrowRight className="size-4" />
                Mark as {nextLabel}
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update order status?</DialogTitle>
              <DialogDescription>
                Move this order from {currentLabel.toLowerCase()} to{" "}
                {nextLabel.toLowerCase()}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <label
                htmlFor={`fulfillment-note-${orderId}`}
                className="text-sm font-medium"
              >
                Note (optional)
              </label>
              <textarea
                id={`fulfillment-note-${orderId}`}
                rows={3}
                className="border-input bg-background w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="Add a note for the status history…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <DialogFooter>
              <DialogClose
                render={
                  <Button variant="outline" className="rounded-full">
                    Cancel
                  </Button>
                }
              />
              <Button
                className="rounded-full"
                disabled={isPending}
                onClick={handleAdvance}
              >
                {isPending ? "Updating…" : `Mark as ${nextLabel}`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {canSkipToDelivered ? (
          <Dialog open={deliverOpen} onOpenChange={setDeliverOpen}>
            <DialogTrigger
              render={
                <Button
                  variant="outline"
                  className="rounded-full"
                  disabled={isPending}
                >
                  <PackageCheck className="size-4" />
                  Mark as delivered
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Mark order as delivered?</DialogTitle>
                <DialogDescription>
                  This completes the order immediately, skipping any remaining
                  fulfillment steps. Stock reservation and delivery timestamps
                  will be applied.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <label
                  htmlFor={`deliver-note-${orderId}`}
                  className="text-sm font-medium"
                >
                  Note (optional)
                </label>
                <textarea
                  id={`deliver-note-${orderId}`}
                  rows={3}
                  className="border-input bg-background w-full rounded-lg border px-3 py-2 text-sm"
                  placeholder="Add a delivery note…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              <DialogFooter>
                <DialogClose
                  render={
                    <Button variant="outline" className="rounded-full">
                      Cancel
                    </Button>
                  }
                />
                <Button
                  className="rounded-full"
                  disabled={isPending}
                  onClick={handleDeliver}
                >
                  {isPending ? "Updating…" : "Mark as delivered"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : null}
      </div>
    </div>
  )
}
