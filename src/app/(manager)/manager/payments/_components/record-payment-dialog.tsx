"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { recordPayment } from "@/app/(manager)/manager/payments/actions"
import type { RecordPaymentInput } from "@/lib/validations/payment"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { formatTaka } from "@/lib/format"
import type { PaymentMode } from "@/types"

const PAYMENT_MODES: { value: PaymentMode; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "cheque", label: "Cheque" },
  { value: "mobile_banking", label: "Mobile banking" },
  { value: "other", label: "Other" },
]

const selectClassName = cn(
  "border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-lg border px-2.5 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
)

export type RecordPaymentOrder = {
  orderId: string
  orderNumber: string | null
  customerName: string
  dueAmount: number
}

export function RecordPaymentDialog({ order }: { order: RecordPaymentOrder }) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState(String(order.dueAmount))
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("cash")
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().slice(0, 10)
  )
  const [referenceNo, setReferenceNo] = useState("")
  const [notes, setNotes] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    const parsedAmount = Number(amount)
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error("Enter a valid amount.")
      return
    }

    const payload: RecordPaymentInput = {
      orderId: order.orderId,
      amount: parsedAmount,
      paymentMode,
      paymentDate,
      referenceNo: referenceNo || undefined,
      notes: notes || undefined,
    }

    startTransition(async () => {
      const result = await recordPayment(payload)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success("Payment recorded.")
      setOpen(false)
      setReferenceNo("")
      setNotes("")
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" className="rounded-full px-4">
            <Plus className="size-3.5" />
            Record
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
          <DialogDescription>
            Log a customer payment for {order.orderNumber ?? "this order"} (
            {order.customerName}). Due: {formatTaka(order.dueAmount)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="amount">
              Amount (৳)
            </label>
            <Input
              id="amount"
              type="number"
              min={0}
              max={order.dueAmount}
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="paymentMode">
              Payment mode
            </label>
            <select
              id="paymentMode"
              className={selectClassName}
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
            >
              {PAYMENT_MODES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="paymentDate">
              Payment date
            </label>
            <Input
              id="paymentDate"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="referenceNo">
              Reference (optional)
            </label>
            <Input
              id="referenceNo"
              placeholder="Cheque #, transaction ID..."
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="notes">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={cn(
                selectClassName,
                "h-auto min-h-[72px] py-2"
              )}
            />
          </div>
        </div>

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
            onClick={handleSubmit}
            disabled={isPending}
            className="rounded-full px-5"
          >
            {isPending ? "Saving..." : "Record payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
