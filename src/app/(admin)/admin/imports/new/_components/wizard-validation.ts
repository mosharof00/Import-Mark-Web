import type { ImportWizardState } from "./types"

export type StepFieldErrors = {
  supplierId?: string
  shipmentDate?: string
  exchangeRate?: string
  cart?: string
  lines?: Record<string, { quantity?: string; cost?: string }>
}

export function getStepFieldErrors(
  step: 1 | 2 | 3 | 4,
  state: ImportWizardState
): StepFieldErrors {
  const errors: StepFieldErrors = {}

  if (step === 1) {
    if (!state.supplierId) errors.supplierId = "Select a supplier to continue."
    if (!state.shipmentDate) errors.shipmentDate = "Shipment date is required."
    if (!(state.exchangeRate > 0)) {
      errors.exchangeRate = "Enter an exchange rate greater than zero."
    }
  }

  if (step === 2) {
    if (state.cart.length === 0) {
      errors.cart = "Add at least one product to continue."
    } else {
      const lines: NonNullable<StepFieldErrors["lines"]> = {}
      for (const item of state.cart) {
        const line: { quantity?: string; cost?: string } = {}
        if (!(item.quantity > 0)) line.quantity = "Quantity is required."
        if (!(item.costPerUnitForeign > 0)) {
          line.cost = "Unit cost is required."
        }
        if (line.quantity || line.cost) lines[item.key] = line
      }
      if (Object.keys(lines).length > 0) errors.lines = lines
    }
  }

  return errors
}

export function firstStepErrorMessage(errors: StepFieldErrors): string | null {
  return (
    errors.supplierId ??
    errors.shipmentDate ??
    errors.exchangeRate ??
    errors.cart ??
    Object.values(errors.lines ?? {})[0]?.quantity ??
    Object.values(errors.lines ?? {})[0]?.cost ??
    null
  )
}
