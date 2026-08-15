export type ImportSupplier = {
  id: string
  name: string
  country: string
  contactPerson: string | null
}

export type ImportProduct = {
  id: string
  name: string
  sku: string | null
  brandName: string | null
  categoryName: string
  categoryId: string | null
  unit: string
}

export type ImportCategory = {
  id: string
  name: string
}

export type ImportCartItem = {
  key: string
  productId: string
  name: string
  unit: string
  quantity: number
  costPerUnitForeign: number
  batchNumber: string
  expiryDate: string
}

export type ImportWizardState = {
  supplierId: string | null
  invoiceNumber: string
  lcNumber: string
  blNumber: string
  shipmentDate: string
  currency: string
  exchangeRate: number
  freightCost: number
  customDuty: number
  portCharges: number
  otherCharges: number
  notes: string
  cart: ImportCartItem[]
}
