"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

import { placeOrder } from "@/app/(manager)/manager/orders/actions"
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

import { WizardProgress } from "./wizard-progress"
import { StepSelectCustomer } from "./step-select-customer"
import { StepAddProducts } from "./step-add-products"
import { StepDeliveryPayment } from "./step-delivery-payment"
import { StepReview } from "./step-review"
import type {
  CartItem,
  CategoryOption,
  WizardAddress,
  WizardCustomer,
  WizardGateway,
  WizardProduct,
  WizardState,
} from "./types"

const INITIAL_STATE: Omit<WizardState, "step" | "direction"> = {
  customerId: null,
  cart: [],
  deliveryMethod: "own_team",
  addressId: null,
  paymentGatewayId: null,
  advancePaid: 0,
  paymentReference: "",
  orderNotes: "",
}

export function PlaceOrderWizard({
  customers,
  products,
  categories,
  addresses: initialAddresses,
  gateways,
}: {
  customers: WizardCustomer[]
  products: WizardProduct[]
  categories: CategoryOption[]
  addresses: WizardAddress[]
  gateways: WizardGateway[]
}) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [direction, setDirection] = useState<"forward" | "back">("forward")
  const [state, setState] = useState(INITIAL_STATE)
  const [addresses, setAddresses] = useState(initialAddresses)
  const [isPending, startTransition] = useTransition()
  const [leaveOpen, setLeaveOpen] = useState(false)

  const hasProgress =
    state.customerId !== null ||
    state.cart.length > 0 ||
    state.addressId !== null ||
    state.paymentGatewayId !== null ||
    state.advancePaid > 0 ||
    state.paymentReference.trim().length > 0 ||
    state.orderNotes.trim().length > 0

  const subtotal = useMemo(
    () =>
      state.cart.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      ),
    [state.cart]
  )

  const selectedCustomer = customers.find((c) => c.id === state.customerId)
  const selectedAddress =
    addresses.find((a) => a.id === state.addressId) ?? null
  const selectedGateway =
    gateways.find((g) => g.id === state.paymentGatewayId) ?? null

  function goToStep(next: 1 | 2 | 3 | 4) {
    setDirection(next > step ? "forward" : "back")
    setStep(next)
  }

  function canProceedFromStep(current: number): boolean {
    switch (current) {
      case 1:
        return state.customerId !== null
      case 2:
        return state.cart.length > 0
      case 3:
        if (!state.paymentGatewayId) return false
        if (state.advancePaid > subtotal) return false
        if (state.deliveryMethod === "own_team" && !state.addressId) {
          return false
        }
        return true
      default:
        return true
    }
  }

  function handleNext() {
    if (!canProceedFromStep(step)) {
      if (step === 3 && state.advancePaid > subtotal) {
        toast.error("Advance paid cannot exceed the order total.")
      } else if (step === 3 && state.deliveryMethod === "own_team") {
        toast.error("Select a delivery address.")
      } else if (step === 3) {
        toast.error("Select a payment gateway.")
      }
      return
    }
    if (step < 4) goToStep((step + 1) as 1 | 2 | 3 | 4)
  }

  function handleBack() {
    if (step > 1) goToStep((step - 1) as 1 | 2 | 3 | 4)
  }

  function handleConfirm() {
    if (!state.customerId || !state.paymentGatewayId || state.cart.length === 0) {
      toast.error("Order is incomplete.")
      return
    }

    startTransition(async () => {
      const result = await placeOrder({
        customerId: state.customerId!,
        items: state.cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        deliveryMethod: state.deliveryMethod,
        addressId:
          state.deliveryMethod === "own_team" ? state.addressId : null,
        paymentGatewayId: state.paymentGatewayId!,
        advancePaid: state.advancePaid,
        paymentReference: state.paymentReference || undefined,
        orderNotes: state.orderNotes || undefined,
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      if (result.orderId) {
        router.push(`/manager/orders/${result.orderId}?placed=1`)
      }
    })
  }

  function updateCart(cart: CartItem[]) {
    setState((s) => ({ ...s, cart }))
  }

  function handleLeave() {
    router.push("/manager/orders")
  }

  function requestLeave() {
    if (hasProgress) {
      setLeaveOpen(true)
    } else {
      handleLeave()
    }
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={requestLeave}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to orders
      </button>

      <Dialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave order placement?</DialogTitle>
            <DialogDescription>
              Your progress will be lost. Are you sure you want to go back to
              the orders list?
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
              onClick={handleLeave}
            >
              Leave without saving
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <WizardProgress step={step} />

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
          <StepSelectCustomer
            customers={customers}
            selectedId={state.customerId}
            onSelect={(id) => setState((s) => ({ ...s, customerId: id }))}
          />
        ) : null}

        {step === 2 ? (
          <StepAddProducts
            products={products}
            categories={categories}
            cart={state.cart}
            onCartChange={updateCart}
          />
        ) : null}

        {step === 3 && state.customerId ? (
          <StepDeliveryPayment
            customerId={state.customerId}
            addresses={addresses}
            gateways={gateways}
            subtotal={subtotal}
            deliveryMethod={state.deliveryMethod}
            addressId={state.addressId}
            paymentGatewayId={state.paymentGatewayId}
            advancePaid={state.advancePaid}
            paymentReference={state.paymentReference}
            orderNotes={state.orderNotes}
            onDeliveryMethodChange={(deliveryMethod) =>
              setState((s) => ({
                ...s,
                deliveryMethod,
                addressId:
                  deliveryMethod === "customer_pickup" ? null : s.addressId,
              }))
            }
            onAddressIdChange={(addressId) =>
              setState((s) => ({ ...s, addressId }))
            }
            onAddressesChange={setAddresses}
            onPaymentGatewayIdChange={(paymentGatewayId) =>
              setState((s) => ({ ...s, paymentGatewayId }))
            }
            onAdvancePaidChange={(advancePaid) =>
              setState((s) => ({ ...s, advancePaid }))
            }
            onPaymentReferenceChange={(paymentReference) =>
              setState((s) => ({ ...s, paymentReference }))
            }
            onOrderNotesChange={(orderNotes) =>
              setState((s) => ({ ...s, orderNotes }))
            }
          />
        ) : null}

        {step === 4 && selectedCustomer ? (
          <StepReview
            customer={selectedCustomer}
            cart={state.cart}
            deliveryMethod={state.deliveryMethod}
            address={selectedAddress}
            gateway={selectedGateway}
            advancePaid={state.advancePaid}
            paymentReference={state.paymentReference}
            orderNotes={state.orderNotes}
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
              onClick={handleBack}
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
              disabled={!canProceedFromStep(step)}
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
              {isPending ? "Placing order…" : "Confirm & Place Order"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
