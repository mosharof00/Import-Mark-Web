"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { createCustomerAddress as defaultCreateAddress } from "@/app/(manager)/manager/orders/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { formatCustomerAddress } from "@/lib/format-address"
import { formatTaka } from "@/lib/format"
import type { DeliveryMethod, PaymentMode } from "@/types"

import type { CreateCustomerAddressInput } from "@/lib/validations/customer-address"

import type { WizardAddress, WizardGateway } from "./types"

const PAYMENT_LABEL: Record<PaymentMode, string> = {
  cash: "Cash",
  bank_transfer: "Bank transfer",
  cheque: "Cheque",
  mobile_banking: "Mobile banking",
  other: "Other",
}

const DELIVERY_OPTIONS: { value: DeliveryMethod; label: string }[] = [
  { value: "own_team", label: "Own Delivery Team" },
  { value: "customer_pickup", label: "Customer Pickup" },
]

export function StepDeliveryPayment({
  customerId,
  addresses,
  gateways,
  subtotal,
  deliveryMethod,
  addressId,
  paymentGatewayId,
  advancePaid,
  paymentReference,
  orderNotes,
  onDeliveryMethodChange,
  onAddressIdChange,
  onAddressesChange,
  onPaymentGatewayIdChange,
  onAdvancePaidChange,
  onPaymentReferenceChange,
  onOrderNotesChange,
  createAddress = defaultCreateAddress,
}: {
  customerId: string
  addresses: WizardAddress[]
  gateways: WizardGateway[]
  subtotal: number
  deliveryMethod: DeliveryMethod
  addressId: string | null
  paymentGatewayId: string | null
  advancePaid: number
  paymentReference: string
  orderNotes: string
  onDeliveryMethodChange: (method: DeliveryMethod) => void
  onAddressIdChange: (id: string | null) => void
  onAddressesChange: (addresses: WizardAddress[]) => void
  onPaymentGatewayIdChange: (id: string) => void
  onAdvancePaidChange: (amount: number) => void
  onPaymentReferenceChange: (value: string) => void
  onOrderNotesChange: (value: string) => void
  createAddress?: (
    values: CreateCustomerAddressInput
  ) => Promise<{ error?: string; addressId?: string } | void>
}) {
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    label: "",
    recipientName: "",
    recipientPhone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    stateProvince: "",
    postalCode: "",
    country: "Bangladesh",
  })

  const dueAmount = Math.max(0, subtotal - advancePaid)
  const customerAddresses = addresses.filter((a) => a.customerId === customerId)

  function handleAdvanceChange(raw: string) {
    const value = Math.max(0, Number(raw) || 0)
    onAdvancePaidChange(Math.min(value, subtotal))
  }

  function saveAddress() {
    startTransition(async () => {
      const result = await createAddress({
        customerId,
        label: form.label,
        recipientName: form.recipientName,
        recipientPhone: form.recipientPhone || undefined,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2 || undefined,
        city: form.city,
        stateProvince: form.stateProvince || undefined,
        postalCode: form.postalCode || undefined,
        country: form.country,
      })

      if (result && "error" in result && result.error) {
        toast.error(result.error)
        return
      }

      if (result && "addressId" in result && result.addressId) {
        const newAddress: WizardAddress = {
          id: result.addressId,
          customerId,
          label: form.label.trim(),
          recipientName: form.recipientName.trim(),
          recipientPhone: form.recipientPhone.trim() || null,
          addressLine1: form.addressLine1.trim(),
          addressLine2: form.addressLine2.trim() || null,
          city: form.city.trim(),
          stateProvince: form.stateProvince.trim() || null,
          postalCode: form.postalCode.trim() || null,
          country: form.country.trim(),
          isDefault: false,
        }
        onAddressesChange([...addresses, newAddress])
        onAddressIdChange(result.addressId)
        setShowAddressForm(false)
        setForm({
          label: "",
          recipientName: "",
          recipientPhone: "",
          addressLine1: "",
          addressLine2: "",
          city: "",
          stateProvince: "",
          postalCode: "",
          country: "Bangladesh",
        })
        toast.success("Address saved.")
      }
    })
  }

  const inputClassName = cn(
    "border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border px-2.5 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] dark:bg-input/30"
  )

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h3 className="text-foreground text-lg font-semibold">Delivery</h3>
        <div className="flex flex-wrap gap-2">
          {DELIVERY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onDeliveryMethodChange(opt.value)
                if (opt.value === "customer_pickup") onAddressIdChange(null)
              }}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                deliveryMethod === opt.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:bg-muted/50"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {deliveryMethod === "customer_pickup" ? (
          <p className="rounded-xl bg-muted/50 px-4 py-3 text-sm">
            Customer will collect from godown — no delivery address needed.
          </p>
        ) : (
          <div className="space-y-3">
            {customerAddresses.length === 0 && !showAddressForm ? (
              <p className="text-muted-foreground text-sm">
                No saved addresses for this customer.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {customerAddresses.map((address) => {
                  const selected = address.id === addressId
                  return (
                    <div
                      key={address.id}
                      className={cn(
                        "border-border bg-card rounded-2xl border p-4 shadow-sm",
                        selected && "border-primary ring-primary/20 ring-2"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-foreground font-medium">
                            {address.label}
                          </p>
                          <p className="text-muted-foreground mt-1 text-sm">
                            {address.recipientName}
                            {address.recipientPhone
                              ? ` · ${address.recipientPhone}`
                              : ""}
                          </p>
                          <p className="text-muted-foreground mt-2 text-sm">
                            {formatCustomerAddress(address)}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant={selected ? "default" : "outline"}
                          className="shrink-0 rounded-full"
                          onClick={() => onAddressIdChange(address.id)}
                        >
                          {selected ? "Selected" : "Select"}
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {showAddressForm ? (
              <div className="border-border bg-card space-y-4 rounded-2xl border p-4 shadow-sm">
                <h4 className="text-foreground font-medium">New address</h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="addr-label">Label</Label>
                    <Input
                      id="addr-label"
                      value={form.label}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, label: e.target.value }))
                      }
                      placeholder="Main Office"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="addr-recipient">Recipient name</Label>
                    <Input
                      id="addr-recipient"
                      value={form.recipientName}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          recipientName: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="addr-phone">Phone</Label>
                    <Input
                      id="addr-phone"
                      value={form.recipientPhone}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          recipientPhone: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="addr-line1">Address line 1</Label>
                    <Input
                      id="addr-line1"
                      value={form.addressLine1}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          addressLine1: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="addr-line2">Address line 2</Label>
                    <Input
                      id="addr-line2"
                      value={form.addressLine2}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          addressLine2: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="addr-city">City</Label>
                    <Input
                      id="addr-city"
                      value={form.city}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, city: e.target.value }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="addr-state">State / province</Label>
                    <Input
                      id="addr-state"
                      value={form.stateProvince}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          stateProvince: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="addr-postal">Postal code</Label>
                    <Input
                      id="addr-postal"
                      value={form.postalCode}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          postalCode: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="addr-country">Country</Label>
                    <Input
                      id="addr-country"
                      value={form.country}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, country: e.target.value }))
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    className="rounded-full"
                    disabled={isPending}
                    onClick={saveAddress}
                  >
                    Save address
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => setShowAddressForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => setShowAddressForm(true)}
              >
                Add new address
              </Button>
            )}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h3 className="text-foreground text-lg font-semibold">Payment</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {gateways.map((gateway) => {
            const selected = gateway.id === paymentGatewayId
            return (
              <button
                key={gateway.id}
                type="button"
                onClick={() => onPaymentGatewayIdChange(gateway.id)}
                className={cn(
                  "border-border bg-card rounded-2xl border p-4 text-left shadow-sm transition-colors",
                  selected
                    ? "border-primary ring-primary/20 ring-2"
                    : "hover:border-primary/40"
                )}
              >
                <div className="flex items-center gap-2">
                  <p className="text-foreground font-medium">{gateway.name}</p>
                  <Badge variant="outline">
                    {PAYMENT_LABEL[gateway.type]}
                  </Badge>
                </div>
                <div className="text-muted-foreground mt-2 space-y-0.5 text-xs">
                  {gateway.accountName ? (
                    <p>Account: {gateway.accountName}</p>
                  ) : null}
                  {gateway.accountNumber ? (
                    <p>No: {gateway.accountNumber}</p>
                  ) : null}
                  {gateway.bankName ? <p>{gateway.bankName}</p> : null}
                  {gateway.branchName ? <p>{gateway.branchName}</p> : null}
                  {gateway.instructions ? (
                    <p className="mt-1">{gateway.instructions}</p>
                  ) : null}
                </div>
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="advance-paid">Advance paid amount</Label>
            <Input
              id="advance-paid"
              type="number"
              min={0}
              max={subtotal}
              step="0.01"
              value={advancePaid || ""}
              onChange={(e) => handleAdvanceChange(e.target.value)}
              className="mt-1 tabular-nums"
            />
            <p className="text-muted-foreground mt-2 text-sm">
              Remaining due:{" "}
              <span
                className={cn(
                  "font-medium tabular-nums",
                  dueAmount > 0
                    ? "text-amber-700 dark:text-amber-400"
                    : "text-foreground"
                )}
              >
                {formatTaka(dueAmount)}
              </span>
            </p>
          </div>
          <div>
            <Label htmlFor="payment-ref">Payment reference / note</Label>
            <Input
              id="payment-ref"
              value={paymentReference}
              onChange={(e) => onPaymentReferenceChange(e.target.value)}
              placeholder="Transaction ID, cheque no., etc."
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="order-notes">Order notes</Label>
          <textarea
            id="order-notes"
            value={orderNotes}
            onChange={(e) => onOrderNotesChange(e.target.value)}
            rows={3}
            placeholder="Internal notes about this order..."
            className={cn(inputClassName, "mt-1 resize-y")}
          />
        </div>
      </section>
    </div>
  )
}
