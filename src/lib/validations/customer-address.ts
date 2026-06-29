import { z } from "zod"

export const customerAddressSchema = z.object({
  customerId: z.string().uuid("Select a customer."),
  label: z.string().min(1, "Label is required."),
  recipientName: z.string().min(1, "Recipient name is required."),
  recipientPhone: z.string().optional(),
  addressLine1: z.string().min(1, "Address line 1 is required."),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required."),
  stateProvince: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().min(1, "Country is required."),
  isDefault: z.boolean().optional(),
})

export const updateCustomerAddressSchema = customerAddressSchema.extend({
  id: z.string().uuid("Invalid address."),
})

export type CreateCustomerAddressInput = z.infer<typeof customerAddressSchema>
export type UpdateCustomerAddressInput = z.infer<typeof updateCustomerAddressSchema>
