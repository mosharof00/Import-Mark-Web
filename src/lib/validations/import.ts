import { z } from "zod"

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined))

export const importLineItemSchema = z.object({
  productId: z.string().uuid("Select a product."),
  quantity: z
    .number({ error: "Enter a quantity." })
    .positive("Quantity must be greater than zero."),
  costPerUnitForeign: z
    .number({ error: "Enter the unit cost." })
    .positive("Unit cost must be greater than zero."),
  batchNumber: optionalText,
  expiryDate: optionalText,
})
export type ImportLineItemInput = z.infer<typeof importLineItemSchema>

export const createImportSchema = z.object({
  supplierId: z.string().uuid("Select a supplier."),
  invoiceNumber: optionalText,
  lcNumber: optionalText,
  blNumber: optionalText,
  shipmentDate: z.string().min(1, "Shipment date is required."),
  currency: z.string().min(1).default("USD"),
  exchangeRate: z
    .number({ error: "Enter the exchange rate to BDT." })
    .positive("Exchange rate must be greater than zero."),
  freightCost: z.number().min(0).default(0),
  customDuty: z.number().min(0).default(0),
  portCharges: z.number().min(0).default(0),
  otherCharges: z.number().min(0).default(0),
  notes: optionalText,
  items: z
    .array(importLineItemSchema)
    .min(1, "Add at least one product to this shipment."),
})
export type CreateImportInput = z.infer<typeof createImportSchema>

export const advanceImportSchema = z.object({
  shipmentId: z.string().uuid(),
  eventDate: optionalText,
  note: optionalText,
})
export type AdvanceImportInput = z.infer<typeof advanceImportSchema>
