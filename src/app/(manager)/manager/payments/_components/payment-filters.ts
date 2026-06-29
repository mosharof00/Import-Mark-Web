export type PaymentFilter = "all" | "outstanding"

export const PAYMENT_FILTER_LABELS: Record<PaymentFilter, string> = {
  all: "All payments",
  outstanding: "Outstanding",
}
