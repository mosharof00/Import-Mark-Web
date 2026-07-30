import { z } from "zod"

const paymentModes = [
  "cash",
  "bank_transfer",
  "cheque",
  "mobile_banking",
  "other",
] as const

export const recordPaymentSchema = z.object({
  orderId: z.string().uuid("Invalid order."),
  amount: z
    .number({ error: "Enter an amount." })
    .positive("Amount must be greater than zero."),
  paymentMode: z.enum(paymentModes, {
    error: "Select a payment mode.",
  }),
  paymentDate: z.string().min(1, "Payment date is required."),
  paymentGatewayId: z.string().uuid().optional().nullable(),
  referenceNo: z.string().optional(),
  notes: z.string().optional(),
  proofImageUrl: z.string().url().optional().nullable().or(z.literal("")),
})

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>
