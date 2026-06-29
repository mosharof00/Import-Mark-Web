"use client"

import { formatCustomerAddress } from "@/lib/format-address"
import { formatTaka } from "@/lib/format"
import type { DeliveryMethod, PaymentMode } from "@/types"

import type {
  CartItem,
  WizardAddress,
  WizardCustomer,
  WizardGateway,
} from "./types"

const DELIVERY_LABEL: Record<DeliveryMethod, string> = {
  own_team: "Own delivery team",
  customer_pickup: "Godown pickup",
}

const PAYMENT_LABEL: Record<PaymentMode, string> = {
  cash: "Cash",
  bank_transfer: "Bank transfer",
  cheque: "Cheque",
  mobile_banking: "Mobile banking",
  other: "Other",
}

export function StepReview({
  customer,
  cart,
  deliveryMethod,
  address,
  gateway,
  advancePaid,
  paymentReference,
  orderNotes,
}: {
  customer: WizardCustomer
  cart: CartItem[]
  deliveryMethod: DeliveryMethod
  address: WizardAddress | null
  gateway: WizardGateway | null
  advancePaid: number
  paymentReference: string
  orderNotes: string
}) {
  const subtotal = cart.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  )
  const dueAmount = subtotal - advancePaid

  return (
    <div className="space-y-6">
      <section className="border-border bg-card rounded-2xl border p-6 shadow-sm">
        <h3 className="text-muted-foreground mb-3 text-xs font-medium tracking-wider uppercase">
          Customer
        </h3>
        <p className="text-foreground font-medium">{customer.fullName}</p>
        {customer.companyName ? (
          <p className="text-muted-foreground text-sm">{customer.companyName}</p>
        ) : null}
        {customer.phone ? (
          <p className="text-muted-foreground mt-1 text-sm">{customer.phone}</p>
        ) : null}
      </section>

      <section className="border-border bg-card rounded-2xl border p-6 shadow-sm">
        <h3 className="text-muted-foreground mb-3 text-xs font-medium tracking-wider uppercase">
          Delivery
        </h3>
        <p className="text-foreground font-medium">
          {DELIVERY_LABEL[deliveryMethod]}
        </p>
        {deliveryMethod === "own_team" && address ? (
          <p className="text-muted-foreground mt-2 text-sm">
            {address.label} — {formatCustomerAddress(address)}
          </p>
        ) : null}
      </section>

      <section className="border-border bg-card rounded-2xl border p-6 shadow-sm">
        <h3 className="text-muted-foreground mb-3 text-xs font-medium tracking-wider uppercase">
          Products
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-muted-foreground text-left text-xs tracking-wider uppercase">
                <th className="px-2 py-2 font-medium">Product</th>
                <th className="px-2 py-2 text-right font-medium">Qty</th>
                <th className="px-2 py-2 text-right font-medium">Unit price</th>
                <th className="px-2 py-2 text-right font-medium">Line total</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.productId} className="border-border border-t">
                  <td className="text-foreground px-2 py-3">{item.name}</td>
                  <td className="text-foreground px-2 py-3 text-right tabular-nums">
                    {item.quantity}
                  </td>
                  <td className="text-muted-foreground px-2 py-3 text-right tabular-nums">
                    {formatTaka(item.unitPrice)}
                  </td>
                  <td className="text-foreground px-2 py-3 text-right font-medium tabular-nums">
                    {formatTaka(item.quantity * item.unitPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border-border bg-card rounded-2xl border p-6 shadow-sm">
        <h3 className="text-muted-foreground mb-3 text-xs font-medium tracking-wider uppercase">
          Financial summary
        </h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="text-foreground font-medium tabular-nums">
              {formatTaka(subtotal)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Advance paid</dt>
            <dd className="text-foreground font-medium tabular-nums">
              {formatTaka(advancePaid)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Due amount</dt>
            <dd
              className={
                dueAmount > 0
                  ? "font-semibold text-amber-700 tabular-nums dark:text-amber-400"
                  : "text-foreground font-medium tabular-nums"
              }
            >
              {formatTaka(dueAmount)}
            </dd>
          </div>
          {gateway ? (
            <div className="flex justify-between gap-4 pt-2">
              <dt className="text-muted-foreground">Payment via</dt>
              <dd className="text-foreground font-medium">
                {gateway.name} ({PAYMENT_LABEL[gateway.type]})
              </dd>
            </div>
          ) : null}
          {paymentReference ? (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Payment reference</dt>
              <dd className="text-foreground text-right">{paymentReference}</dd>
            </div>
          ) : null}
          {orderNotes ? (
            <div className="pt-2">
              <dt className="text-muted-foreground mb-1">Notes</dt>
              <dd className="text-foreground bg-muted/50 rounded-xl px-3 py-2">
                {orderNotes}
              </dd>
            </div>
          ) : null}
        </dl>
      </section>
    </div>
  )
}
