export type CurrencyFormat = {
  symbol: string
  locale: string
  code?: string
}

export const FALLBACK_CURRENCY: CurrencyFormat = {
  symbol: "\u09F3",
  locale: "en-IN",
  code: "BDT",
}

export function formatCurrency(
  amount: number | null | undefined,
  currency: CurrencyFormat = FALLBACK_CURRENCY,
  fractionDigits = 0
): string {
  const value =
    typeof amount === "number" && Number.isFinite(amount) ? amount : 0
  const formatted = new Intl.NumberFormat(currency.locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)
  return `${currency.symbol}${formatted}`
}

/** @deprecated Prefer formatCurrency with platform currency config. */
export function formatTaka(
  amount: number | null | undefined,
  fractionDigits = 0
): string {
  return formatCurrency(amount, FALLBACK_CURRENCY, fractionDigits)
}
