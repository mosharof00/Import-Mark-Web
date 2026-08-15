"use client"

import { useState, useTransition } from "react"
import { ArrowRight, Ban } from "lucide-react"
import { toast } from "sonner"

import {
  advanceImportStatus,
  cancelImport,
} from "@/app/(admin)/admin/imports/actions"
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
import { Input } from "@/components/ui/input"
import { SHIPMENT_STATUS_CONFIG } from "@/lib/constants"
import {
  canCancelShipment,
  getNextShipmentStatus,
} from "@/lib/imports/status-flow"
import type { ShipmentStatus } from "@/types"

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function ImportStatusActions({
  shipmentId,
  status,
}: {
  shipmentId: string
  status: ShipmentStatus
}) {
  const nextStatus = getNextShipmentStatus(status)
  const cancellable = canCancelShipment(status)
  const [note, setNote] = useState("")
  const [eventDate, setEventDate] = useState(today())
  const [open, setOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (!nextStatus && !cancellable) return null

  const nextLabel = nextStatus
    ? SHIPMENT_STATUS_CONFIG[nextStatus].label
    : ""
  const currentLabel = SHIPMENT_STATUS_CONFIG[status].label
  const dateLabel =
    nextStatus === "arrived"
      ? "Arrival date"
      : nextStatus === "cleared"
        ? "Clearance date"
        : null

  function reset() {
    setNote("")
    setEventDate(today())
  }

  function handleAdvance() {
    startTransition(async () => {
      const result = await advanceImportStatus({
        shipmentId,
        eventDate,
        note,
      })
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success(`Shipment marked as ${nextLabel.toLowerCase()}.`)
      reset()
      setOpen(false)
    })
  }

  function handleCancel() {
    startTransition(async () => {
      const result = await cancelImport({ shipmentId, note, eventDate: undefined })
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success("Shipment cancelled.")
      reset()
      setCancelOpen(false)
    })
  }

  return (
    <div className="border-border bg-card rounded-2xl border p-4 shadow-sm">
      <p className="text-muted-foreground mb-1 text-sm">Shipment cycle</p>
      <p className="mb-4 text-sm">
        Current status:{" "}
        <span className="text-foreground font-medium">{currentLabel}</span>
      </p>

      <div className="flex flex-wrap gap-2">
        {nextStatus ? (
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
                <DialogTitle>Update shipment status?</DialogTitle>
                <DialogDescription>
                  Move this import from {currentLabel.toLowerCase()} to{" "}
                  {nextLabel.toLowerCase()}.
                  {nextStatus === "cleared"
                    ? " Clearing adds imported quantities to inventory."
                    : ""}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {dateLabel ? (
                  <label className="block space-y-1.5">
                    <span className="text-sm font-medium">{dateLabel}</span>
                    <Input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                    />
                  </label>
                ) : null}
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium">Note (optional)</span>
                  <textarea
                    rows={3}
                    className="border-input bg-background w-full rounded-lg border px-3 py-2 text-sm"
                    placeholder="Add a note…"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </label>
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
        ) : null}

        {cancellable ? (
          <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
            <DialogTrigger
              render={
                <Button
                  variant="outline"
                  className="rounded-full"
                  disabled={isPending}
                >
                  <Ban className="size-4" />
                  Cancel shipment
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancel this shipment?</DialogTitle>
                <DialogDescription>
                  Stock will not be added. This cannot be undone from the app.
                </DialogDescription>
              </DialogHeader>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">Reason (optional)</span>
                <textarea
                  rows={3}
                  className="border-input bg-background w-full rounded-lg border px-3 py-2 text-sm"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </label>
              <DialogFooter>
                <DialogClose
                  render={
                    <Button variant="outline" className="rounded-full">
                      Keep shipment
                    </Button>
                  }
                />
                <Button
                  variant="destructive"
                  className="rounded-full"
                  disabled={isPending}
                  onClick={handleCancel}
                >
                  {isPending ? "Cancelling…" : "Cancel shipment"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : null}
      </div>
    </div>
  )
}
