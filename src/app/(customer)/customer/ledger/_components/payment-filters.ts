export type PaymentFilter = "all" | "outstanding"

export const PAYMENT_FILTER_LABELS: Record<PaymentFilter, string> = {
  all: "Payment history",
  outstanding: "Outstanding",
}
