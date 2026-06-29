import { z } from "zod"

const deliveryMethods = ["own_team", "customer_pickup"] as const

export const cartItemSchema = z.object({
  productId: z.string().uuid("Invalid product."),
  quantity: z.number().int().min(1, "Quantity must be at least 1."),
  unitPrice: z.number().min(0, "Unit price cannot be negative."),
})

export const placeOrderSchema = z
  .object({
    customerId: z.string().uuid("Select a customer."),
    items: z.array(cartItemSchema).min(1, "Add at least one product."),
    deliveryMethod: z.enum(deliveryMethods),
    addressId: z.string().uuid().nullable(),
    paymentGatewayId: z.string().uuid("Select a payment gateway."),
    advancePaid: z.number().min(0, "Advance paid cannot be negative."),
    paymentReference: z.string().optional(),
    orderNotes: z.string().optional(),
  })
  .refine(
    (data) =>
      data.deliveryMethod !== "own_team" || data.addressId !== null,
    { message: "Select a delivery address.", path: ["addressId"] }
  )

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>

export {
  customerAddressSchema as createCustomerAddressSchema,
  type CreateCustomerAddressInput,
} from "@/lib/validations/customer-address"
