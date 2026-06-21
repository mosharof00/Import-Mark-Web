"use client"

import { useState, useTransition } from "react"
import { Check, X } from "lucide-react"
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
import { cn } from "@/lib/utils"

type ActionResult = { error?: string } | void

/**
 * Reusable Approve / Reject control for admin approval queues (orders,
 * products, etc.). The parent passes server actions:
 *  - `onApprove()` runs immediately.
 *  - `onReject(note)` opens a dialog to capture a rejection reason first.
 *
 * Both show a toast on error and refresh happens via the server action
 * (revalidatePath) in the caller.
 */
export function ApprovalButtons({
  onApprove,
  onReject,
  size = "sm",
}: {
  onApprove: () => Promise<ActionResult>
  onReject: (note: string) => Promise<ActionResult>
  size?: "xs" | "sm" | "default"
}) {
  const [isPending, startTransition] = useTransition()
  const [rejectOpen, setRejectOpen] = useState(false)
  const [note, setNote] = useState("")

  function handleApprove() {
    startTransition(async () => {
      const result = await onApprove()
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Approved.")
      }
    })
  }

  function handleReject() {
    startTransition(async () => {
      const result = await onReject(note)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Rejected.")
        setRejectOpen(false)
        setNote("")
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Button size={size} onClick={handleApprove} disabled={isPending}>
        <Check className="size-4" />
        Approve
      </Button>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogTrigger
          render={
            <Button size={size} variant="destructive" disabled={isPending}>
              <X className="size-4" />
              Reject
            </Button>
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject this item?</DialogTitle>
            <DialogDescription>
              Add a short reason. The submitter will see this note.
            </DialogDescription>
          </DialogHeader>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Reason for rejection..."
            className={cn(
              "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
            )}
          />

          <DialogFooter>
            <DialogClose
              render={
                <Button variant="outline" disabled={isPending}>
                  Cancel
                </Button>
              }
            />
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isPending || note.trim().length === 0}
            >
              Confirm reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
