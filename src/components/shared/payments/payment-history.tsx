import { formatDate, formatTaka } from "@/lib/format"
import { PAYMENT_MODE_LABEL } from "@/lib/constants"
import type { PaymentMode } from "@/types"

export type PaymentHistoryItem = {
  id: string
  amount: number
  paymentMode: PaymentMode
  paymentDate: string
  referenceNo: string | null
  notes: string | null
  proofImageUrl: string | null
  gatewayName: string | null
  recordedByName: string | null
  recordedByRole: "admin" | "manager" | "customer" | "unknown"
}

export function PaymentHistory({
  payments,
  title = "Payment history",
}: {
  payments: PaymentHistoryItem[]
  title?: string
}) {
  if (payments.length === 0) {
    return (
      <section className="border-border bg-card rounded-2xl border p-6 shadow-sm">
        <h2 className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
          {title}
        </h2>
        <p className="text-muted-foreground text-sm">No payments recorded yet.</p>
      </section>
    )
  }

  return (
    <section className="border-border bg-card rounded-2xl border p-6 shadow-sm">
      <h2 className="text-muted-foreground mb-4 text-xs font-medium tracking-wider uppercase">
        {title}
      </h2>
      <div className="space-y-4">
        {payments.map((payment) => (
          <article
            key={payment.id}
            className="border-border flex flex-col gap-3 rounded-xl border p-4 sm:flex-row"
          >
            {payment.proofImageUrl ? (
              <a
                href={payment.proofImageUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-muted block size-24 shrink-0 overflow-hidden rounded-lg"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={payment.proofImageUrl}
                  alt="Payment proof"
                  className="size-full object-cover"
                />
              </a>
            ) : (
              <div className="bg-muted text-muted-foreground flex size-24 shrink-0 items-center justify-center rounded-lg text-center text-[11px] leading-tight">
                No
                <br />
                proof
              </div>
            )}

            <div className="min-w-0 flex-1 space-y-1.5 text-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-foreground text-base font-semibold tabular-nums">
                  {formatTaka(payment.amount)}
                </p>
                <p className="text-muted-foreground text-xs">
                  {formatDate(payment.paymentDate)}
                </p>
              </div>
              <p className="text-foreground">
                {PAYMENT_MODE_LABEL[payment.paymentMode]}
                {payment.gatewayName ? ` · ${payment.gatewayName}` : ""}
              </p>
              {payment.referenceNo ? (
                <p className="text-muted-foreground">
                  Ref: {payment.referenceNo}
                </p>
              ) : null}
              {payment.notes ? (
                <p className="text-muted-foreground">{payment.notes}</p>
              ) : null}
              <p className="text-muted-foreground text-xs">
                Recorded by{" "}
                {payment.recordedByName ?? "Unknown"}
                {payment.recordedByRole !== "unknown"
                  ? ` (${payment.recordedByRole})`
                  : ""}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
