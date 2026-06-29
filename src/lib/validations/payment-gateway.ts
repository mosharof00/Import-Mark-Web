import { z } from "zod"

const paymentModes = [
  "cash",
  "bank_transfer",
  "cheque",
  "mobile_banking",
  "other",
] as const

const gatewayStatuses = ["active", "inactive"] as const

export const paymentGatewaySchema = z.object({
  name: z.string().min(1, "Name is required."),
  type: z.enum(paymentModes, { error: "Select a payment type." }),
  status: z.enum(gatewayStatuses).optional(),
  accountName: z.string().optional(),
  accountNumber: z.string().optional(),
  bankName: z.string().optional(),
  branchName: z.string().optional(),
  routingNumber: z.string().optional(),
  instructions: z.string().optional(),
  sortOrder: z.number().int().min(0).optional(),
})

export const createPaymentGatewaySchema = paymentGatewaySchema
export const updatePaymentGatewaySchema = paymentGatewaySchema.extend({
  id: z.string().uuid("Invalid gateway."),
})

export type CreatePaymentGatewayInput = z.infer<typeof createPaymentGatewaySchema>
export type UpdatePaymentGatewayInput = z.infer<typeof updatePaymentGatewaySchema>
