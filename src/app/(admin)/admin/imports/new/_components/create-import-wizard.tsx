"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

import { createImport } from "@/app/(admin)/admin/imports/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

import { ImportWizardProgress } from "./wizard-progress"
import { StepSupplierDocs } from "./step-supplier-docs"
import { StepImportProducts } from "./step-import-products"
import { StepLandedCosts } from "./step-landed-costs"
import { StepReview } from "./step-review"
import {
  firstStepErrorMessage,
  getStepFieldErrors,
} from "./wizard-validation"
import type {
  ImportCategory,
  ImportCartItem,
  ImportProduct,
  ImportSupplier,
  ImportWizardState,
} from "./types"

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

const INITIAL_STATE: ImportWizardState = {
  supplierId: null,
  invoiceNumber: "",
  lcNumber: "",
  blNumber: "",
  shipmentDate: today(),
  currency: "USD",
  exchangeRate: 1,
  freightCost: 0,
  customDuty: 0,
  portCharges: 0,
  otherCharges: 0,
  notes: "",
  cart: [],
}

export function CreateImportWizard({
  suppliers,
  products,
  categories,
}: {
  suppliers: ImportSupplier[]
  products: ImportProduct[]
  categories: ImportCategory[]
}) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [direction, setDirection] = useState<"forward" | "back">("forward")
  const [state, setState] = useState(INITIAL_STATE)
  const [isPending, startTransition] = useTransition()
  const [leaveOpen, setLeaveOpen] = useState(false)
  const [showErrors, setShowErrors] = useState(false)

  const hasProgress =
    state.supplierId !== null ||
    state.cart.length > 0 ||
    state.invoiceNumber.trim().length > 0 ||
    state.notes.trim().length > 0

  const selectedSupplier = suppliers.find((s) => s.id === state.supplierId)
  const stepErrors = useMemo(
    () => getStepFieldErrors(step, state),
    [step, state]
  )
  const visibleErrors = showErrors ? stepErrors : {}

  function goToStep(next: 1 | 2 | 3 | 4) {
    setDirection(next > step ? "forward" : "back")
    setShowErrors(false)
    setStep(next)
  }

  function handleNext() {
    const errors = getStepFieldErrors(step, state)
    const message = firstStepErrorMessage(errors)
    if (message) {
      setShowErrors(true)
      toast.error(message)
      return
    }
    if (step < 4) goToStep((step + 1) as 1 | 2 | 3 | 4)
  }

  function handleConfirm() {
    const first = getStepFieldErrors(1, state)
    const second = getStepFieldErrors(2, state)
    const message =
      firstStepErrorMessage(first) ?? firstStepErrorMessage(second)
    if (message) {
      toast.error(message)
      return
    }

    startTransition(async () => {
      const result = await createImport({
        supplierId: state.supplierId!,
        invoiceNumber: state.invoiceNumber,
        lcNumber: state.lcNumber,
        blNumber: state.blNumber,
        shipmentDate: state.shipmentDate,
        currency: state.currency,
        exchangeRate: state.exchangeRate,
        freightCost: state.freightCost,
        customDuty: state.customDuty,
        portCharges: state.portCharges,
        otherCharges: state.otherCharges,
        notes: state.notes,
        items: state.cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          costPerUnitForeign: item.costPerUnitForeign,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate,
        })),
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      if (result.shipmentId) {
        router.push(`/admin/imports/${result.shipmentId}`)
      }
    })
  }

  function requestLeave() {
    if (hasProgress) setLeaveOpen(true)
    else router.push("/admin/imports")
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={requestLeave}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to imports
      </button>

      <Dialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave this import?</DialogTitle>
            <DialogDescription>
              Your progress will be lost. Are you sure you want to go back?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose
              render={
                <Button variant="outline" className="rounded-full">
                  Keep editing
                </Button>
              }
            />
            <Button
              variant="destructive"
              className="rounded-full"
              onClick={() => router.push("/admin/imports")}
            >
              Leave without saving
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ImportWizardProgress step={step} />

      <div
        key={step}
        className={cn(
          "border-border bg-card rounded-2xl border p-6 shadow-sm",
          direction === "forward"
            ? "wizard-enter-forward"
            : "wizard-enter-back"
        )}
      >
        {step === 1 ? (
          <StepSupplierDocs
            suppliers={suppliers}
            supplierId={state.supplierId}
            invoiceNumber={state.invoiceNumber}
            lcNumber={state.lcNumber}
            blNumber={state.blNumber}
            shipmentDate={state.shipmentDate}
            currency={state.currency}
            exchangeRate={state.exchangeRate}
            notes={state.notes}
            onSupplierIdChange={(supplierId) =>
              setState((s) => ({ ...s, supplierId }))
            }
            onInvoiceNumberChange={(invoiceNumber) =>
              setState((s) => ({ ...s, invoiceNumber }))
            }
            onLcNumberChange={(lcNumber) =>
              setState((s) => ({ ...s, lcNumber }))
            }
            onBlNumberChange={(blNumber) =>
              setState((s) => ({ ...s, blNumber }))
            }
            onShipmentDateChange={(shipmentDate) =>
              setState((s) => ({ ...s, shipmentDate }))
            }
            onCurrencyChange={(currency) =>
              setState((s) => ({ ...s, currency }))
            }
            onExchangeRateChange={(exchangeRate) =>
              setState((s) => ({ ...s, exchangeRate }))
            }
            onNotesChange={(notes) => setState((s) => ({ ...s, notes }))}
            errors={visibleErrors}
          />
        ) : null}

        {step === 2 ? (
          <StepImportProducts
            products={products}
            categories={categories}
            cart={state.cart}
            currency={state.currency}
            onCartChange={(cart: ImportCartItem[]) =>
              setState((s) => ({ ...s, cart }))
            }
            errors={visibleErrors}
          />
        ) : null}

        {step === 3 ? (
          <StepLandedCosts
            cart={state.cart}
            currency={state.currency}
            exchangeRate={state.exchangeRate}
            freightCost={state.freightCost}
            customDuty={state.customDuty}
            portCharges={state.portCharges}
            otherCharges={state.otherCharges}
            onFreightCostChange={(freightCost) =>
              setState((s) => ({ ...s, freightCost }))
            }
            onCustomDutyChange={(customDuty) =>
              setState((s) => ({ ...s, customDuty }))
            }
            onPortChargesChange={(portCharges) =>
              setState((s) => ({ ...s, portCharges }))
            }
            onOtherChargesChange={(otherCharges) =>
              setState((s) => ({ ...s, otherCharges }))
            }
          />
        ) : null}

        {step === 4 && selectedSupplier ? (
          <StepReview
            supplier={selectedSupplier}
            cart={state.cart}
            invoiceNumber={state.invoiceNumber}
            lcNumber={state.lcNumber}
            blNumber={state.blNumber}
            shipmentDate={state.shipmentDate}
            currency={state.currency}
            exchangeRate={state.exchangeRate}
            freightCost={state.freightCost}
            customDuty={state.customDuty}
            portCharges={state.portCharges}
            otherCharges={state.otherCharges}
            notes={state.notes}
          />
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              className="rounded-full px-5"
              onClick={() => goToStep((step - 1) as 1 | 2 | 3 | 4)}
              disabled={isPending}
            >
              ← Back
            </Button>
          ) : null}
        </div>
        <div className="flex gap-2">
          {step < 4 ? (
            <Button
              type="button"
              className="rounded-full px-5"
              onClick={handleNext}
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              className="rounded-full px-5"
              onClick={handleConfirm}
              disabled={isPending}
            >
              {isPending ? "Saving…" : "Record import"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
