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
 * Reusable Approve / Reject control for admin approval queues (orders &
 * products). BOTH actions open a confirmation dialog with a note/reason
 * textarea before running:
 *  - Approve: note is optional.
 *  - Reject: reason is required.
 *
 * The parent passes bound server actions (e.g. `approveOrder.bind(null, id)`).
 * Refreshing the list happens via `revalidatePath` inside those actions.
 */
export function ApprovalButtons({
  onApprove,
  onReject,
  itemLabel = "item",
}: {
  onApprove: (note: string) => Promise<ActionResult>
  onReject: (note: string) => Promise<ActionResult>
  /** Used in dialog copy, e.g. "order" or "product". */
  itemLabel?: string
}) {
  return (
    <div className="flex items-center gap-2">
      <ApprovalDialog
        mode="approve"
        itemLabel={itemLabel}
        onConfirm={onApprove}
      />
      <ApprovalDialog mode="reject" itemLabel={itemLabel} onConfirm={onReject} />
    </div>
  )
}

function ApprovalDialog({
  mode,
  itemLabel,
  onConfirm,
}: {
  mode: "approve" | "reject"
  itemLabel: string
  onConfirm: (note: string) => Promise<ActionResult>
}) {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState("")
  const [isPending, startTransition] = useTransition()

  const isReject = mode === "reject"
  const noteRequired = isReject

  function handleConfirm() {
    if (noteRequired && note.trim().length === 0) return
    startTransition(async () => {
      const result = await onConfirm(note.trim())
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(isReject ? "Rejected." : "Approved.")
        setOpen(false)
        setNote("")
      }
    })
  }

  const triggerButton = isReject ? (
    <Button
      variant="outline"
      size="sm"
      className="rounded-full border-red-300 px-5 text-red-700 transition-transform hover:bg-red-50 hover:text-red-800 active:scale-95 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
    >
      <X className="size-4" />
      Reject
    </Button>
  ) : (
    <Button
      size="sm"
      className="rounded-full px-5 transition-transform active:scale-95"
    >
      <Check className="size-4" />
      Approve
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={triggerButton} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isReject ? `Reject this ${itemLabel}?` : `Approve this ${itemLabel}?`}
          </DialogTitle>
          <DialogDescription>
            {isReject
              ? "Add a reason. The submitter will see this note."
              : "Optionally add a note. This confirms the action."}
          </DialogDescription>
        </DialogHeader>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder={
            isReject ? "Reason for rejection..." : "Note (optional)..."
          }
          className={cn(
            "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-xl border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
          )}
        />

        <DialogFooter>
          <DialogClose
            render={
              <Button
                variant="ghost"
                className="rounded-full px-5"
                disabled={isPending}
              >
                Cancel
              </Button>
            }
          />
          <Button
            variant={isReject ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isPending || (noteRequired && note.trim().length === 0)}
            className="rounded-full px-5 transition-transform active:scale-95"
          >
            {isPending
              ? "Working..."
              : isReject
                ? "Confirm reject"
                : "Confirm approve"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
