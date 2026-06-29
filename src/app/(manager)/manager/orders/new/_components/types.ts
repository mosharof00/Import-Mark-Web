import type { DeliveryMethod, PaymentMode } from "@/types"

export type WizardCustomer = {
  id: string
  fullName: string
  companyName: string | null
  phone: string | null
  city: string | null
  totalDue: number
}

export type WizardProduct = {
  id: string
  name: string
  brandName: string | null
  categoryName: string
  categoryId: string | null
  unit: string
  sellPrice: number
  stockAvailable: number
  avgCost: number | null
}

export type WizardAddress = {
  id: string
  customerId: string
  label: string
  recipientName: string
  recipientPhone: string | null
  addressLine1: string
  addressLine2: string | null
  city: string
  stateProvince: string | null
  postalCode: string | null
  country: string
  isDefault: boolean
}

export type WizardGateway = {
  id: string
  name: string
  type: PaymentMode
  accountName: string | null
  accountNumber: string | null
  bankName: string | null
  branchName: string | null
  routingNumber: string | null
  instructions: string | null
}

export type CategoryOption = {
  id: string
  name: string
}

export type CartItem = {
  productId: string
  name: string
  unit: string
  stockAvailable: number
  avgCost: number | null
  quantity: number
  unitPrice: number
}

export type WizardState = {
  step: 1 | 2 | 3 | 4
  direction: "forward" | "back"
  customerId: string | null
  cart: CartItem[]
  deliveryMethod: DeliveryMethod
  addressId: string | null
  paymentGatewayId: string | null
  advancePaid: number
  paymentReference: string
  orderNotes: string
}
