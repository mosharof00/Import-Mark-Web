"use client"

import { createContext, useContext } from "react"

import type { CurrencyFormat } from "@/lib/format-currency"
import { FALLBACK_CURRENCY } from "@/lib/format-currency"

const CurrencyContext = createContext<CurrencyFormat>(FALLBACK_CURRENCY)

export function CurrencyProvider({
  currency,
  children,
}: {
  currency: CurrencyFormat
  children: React.ReactNode
}) {
  return (
    <CurrencyContext.Provider value={currency}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  return useContext(CurrencyContext)
}
