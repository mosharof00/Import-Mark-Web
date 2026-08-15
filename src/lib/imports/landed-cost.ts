export function roundMoney(value: number, digits = 2): number {
  const factor = 10 ** digits
  return Math.round((value + Number.EPSILON) * factor) / factor
}

export function computeImportTotals({
  items,
  exchangeRate,
  freightCost,
  customDuty,
  portCharges,
  otherCharges,
}: {
  items: { quantity: number; costPerUnitForeign: number }[]
  exchangeRate: number
  freightCost: number
  customDuty: number
  portCharges: number
  otherCharges: number
}) {
  const totalInvoiceCost = roundMoney(
    items.reduce((sum, item) => sum + item.quantity * item.costPerUnitForeign, 0)
  )
  const totalInvoiceBdt = roundMoney(totalInvoiceCost * exchangeRate)
  const chargesTotal = roundMoney(
    freightCost + customDuty + portCharges + otherCharges
  )
  const totalLandedCost = roundMoney(totalInvoiceBdt + chargesTotal)

  return { totalInvoiceCost, totalInvoiceBdt, chargesTotal, totalLandedCost }
}
