"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

import { placeCustomerOrder } from "@/app/(customer)/customer/orders/actions"
import { createCustomerAddress } from "@/app/(customer)/customer/addresses/actions"
import { StepAddProducts } from "@/app/(manager)/manager/orders/new/_components/step-add-products"
import { StepDeliveryPayment } from "@/app/(manager)/manager/orders/new/_components/step-delivery-payment"
import { StepReview } from "@/app/(manager)/manager/orders/new/_components/step-review"
import type {
  CartItem,
  CategoryOption,
  WizardAddress,
  WizardGateway,
  WizardProduct,
} from "@/app/(manager)/manager/orders/new/_components/types"
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

import { CustomerWizardProgress } from "./customer-wizard-progress"

export function CustomerPlaceOrderWizard({
  customerId,
  customerName,
  companyName,
  phone,
  products,
  categories,
  addresses: initialAddresses,
  gateways,
  requireAdvancePayment,
  minAdvancePercent,
  initialProductId,
}: {
  customerId: string
  customerName: string
  companyName: string | null
  phone: string | null
  products: WizardProduct[]
  categories: CategoryOption[]
  addresses: WizardAddress[]
  gateways: WizardGateway[]
  requireAdvancePayment: boolean
  minAdvancePercent: number
  initialProductId?: string | null
}) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [direction, setDirection] = useState<"forward" | "back">("forward")
  const [cart, setCart] = useState<CartItem[]>([])
  const [deliveryMethod, setDeliveryMethod] = useState<
    "own_team" | "customer_pickup"
  >("own_team")
  const [addressId, setAddressId] = useState<string | null>(null)
  const [addresses, setAddresses] = useState(initialAddresses)
  const [paymentGatewayId, setPaymentGatewayId] = useState<string | null>(null)
  const [advancePaid, setAdvancePaid] = useState(0)
  const [paymentReference, setPaymentReference] = useState("")
  const [advanceProofImageUrl, setAdvanceProofImageUrl] = useState("")
  const [orderNotes, setOrderNotes] = useState("")
  const [isPending, startTransition] = useTransition()
  const [leaveOpen, setLeaveOpen] = useState(false)

  useEffect(() => {
    if (!initialProductId || cart.length > 0) return
    const product = products.find((p) => p.id === initialProductId)
    if (!product || product.stockAvailable <= 0) return
    setCart([
      {
        productId: product.id,
        name: product.name,
        unit: product.unit,
        unitPrice: product.sellPrice,
        quantity: 1,
        stockAvailable: product.stockAvailable,
        avgCost: product.avgCost,
      },
    ])
  }, [initialProductId, products, cart.length])

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [cart]
  )

  const hasProgress =
    cart.length > 0 ||
    addressId !== null ||
    paymentGatewayId !== null ||
    advancePaid > 0 ||
    paymentReference.trim().length > 0 ||
    orderNotes.trim().length > 0

  const selectedAddress = addresses.find((a) => a.id === addressId) ?? null
  const selectedGateway = gateways.find((g) => g.id === paymentGatewayId) ?? null

  const customer = {
    id: customerId,
    fullName: customerName,
    companyName,
    phone,
    city: null,
    totalDue: 0,
  }

  function goToStep(next: 1 | 2 | 3) {
    setDirection(next > step ? "forward" : "back")
    setStep(next)
  }

  function canProceedFromStep(current: number): boolean {
    if (current === 1) return cart.length > 0
    if (current === 2) {
      if (!paymentGatewayId) return false
      if (deliveryMethod === "own_team" && !addressId) return false
      if (requireAdvancePayment && advancePaid <= 0) return false
      if (
        requireAdvancePayment &&
        minAdvancePercent > 0 &&
        advancePaid < (subtotal * minAdvancePercent) / 100
      ) {
        return false
      }
      if (advancePaid > subtotal) return false
      return true
    }
    return true
  }

  function handleNext() {
    if (!canProceedFromStep(step)) {
      if (step === 2 && requireAdvancePayment && advancePaid <= 0) {
        toast.error("An advance payment is required.")
      } else if (step === 2) {
        toast.error("Complete delivery and payment details.")
      }
      return
    }
    if (step < 3) goToStep((step + 1) as 1 | 2 | 3)
  }

  function handleConfirm() {
    if (!paymentGatewayId || cart.length === 0) {
      toast.error("Order is incomplete.")
      return
    }

    startTransition(async () => {
      const result = await placeCustomerOrder({
        customerId,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        deliveryMethod,
        addressId: deliveryMethod === "own_team" ? addressId : null,
        paymentGatewayId,
        advancePaid,
        paymentReference: paymentReference || undefined,
        orderNotes: orderNotes || undefined,
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      if (result.orderId) {
        router.push(`/customer/orders/${result.orderId}?placed=1`)
      }
    })
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => (hasProgress ? setLeaveOpen(true) : router.push("/customer/orders"))}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to my orders
      </button>

      <Dialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave order placement?</DialogTitle>
            <DialogDescription>
              Your progress will be lost. Are you sure?
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
              onClick={() => router.push("/customer/orders")}
            >
              Leave without saving
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CustomerWizardProgress step={step} />

      <div
        key={step}
        className={cn(
          "border-border bg-card rounded-2xl border p-6 shadow-sm",
          direction === "forward" ? "wizard-enter-forward" : "wizard-enter-back"
        )}
      >
        {step === 1 ? (
          <StepAddProducts
            products={products}
            categories={categories}
            cart={cart}
            onCartChange={setCart}
            readOnlyPrice
          />
        ) : null}

        {step === 2 ? (
          <StepDeliveryPayment
            customerId={customerId}
            addresses={addresses}
            gateways={gateways}
            subtotal={subtotal}
            deliveryMethod={deliveryMethod}
            addressId={addressId}
            paymentGatewayId={paymentGatewayId}
            advancePaid={advancePaid}
            paymentReference={paymentReference}
            advanceProofImageUrl={advanceProofImageUrl}
            orderNotes={orderNotes}
            onDeliveryMethodChange={(method) => {
              setDeliveryMethod(method)
              if (method === "customer_pickup") setAddressId(null)
            }}
            onAddressIdChange={setAddressId}
            onAddressesChange={setAddresses}
            onPaymentGatewayIdChange={setPaymentGatewayId}
            onAdvancePaidChange={setAdvancePaid}
            onPaymentReferenceChange={setPaymentReference}
            onAdvanceProofImageUrlChange={setAdvanceProofImageUrl}
            onOrderNotesChange={setOrderNotes}
            createAddress={createCustomerAddress}
            showAdvanceProof={false}
          />
        ) : null}

        {step === 3 ? (
          <StepReview
            customer={customer}
            cart={cart}
            deliveryMethod={deliveryMethod}
            address={selectedAddress}
            gateway={selectedGateway}
            advancePaid={advancePaid}
            paymentReference={paymentReference}
            orderNotes={orderNotes}
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
              onClick={() => goToStep((step - 1) as 1 | 2 | 3)}
              disabled={isPending}
            >
              ← Back
            </Button>
          ) : null}
        </div>
        <div className="flex gap-2">
          {step < 3 ? (
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
