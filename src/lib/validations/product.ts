import { z } from "zod"

const optionalUrl = z
  .string()
  .url("Enter a valid image URL.")
  .or(z.literal(""))

const imageUrlsSchema = z
  .array(z.string().url("Enter a valid image URL."))
  .max(8, "You can upload up to 8 images per product.")

/**
 * Admin "Add product" form. Re-validated in the server action — never trust
 * the client.
 */
export const createProductSchema = z.object({
  name: z.string().min(2, "Enter a product name."),
  sku: z.string().optional(),
  categoryId: z.string().uuid("Select a category."),
  brandId: z.string().optional(),
  unit: z.string().min(1, "Unit is required (e.g. 20L pail, 25kg bag)."),
  unitSize: z.string().optional(),
  sellPrice: z
    .number({ error: "Enter a sell price." })
    .positive("Sell price must be greater than zero."),
  originCountry: z.string().optional(),
  description: z.string().optional(),
  specifications: z.string().optional(),
  imageUrls: imageUrlsSchema.default([]),
  initialQuantity: z
    .number({ error: "Enter a valid quantity." })
    .min(0, "Quantity cannot be negative."),
  lowStockThreshold: z
    .number({ error: "Enter a valid threshold." })
    .min(0, "Threshold cannot be negative."),
})

export type CreateProductInput = z.infer<typeof createProductSchema>

/** Catalog fields editable after a product exists (stock qty via Inventory). */
export const updateProductSchema = z.object({
  name: z.string().min(2, "Enter a product name."),
  sku: z.string().optional(),
  categoryId: z.string().uuid("Select a category."),
  brandId: z.string().optional(),
  unit: z.string().min(1, "Unit is required (e.g. 20L pail, 25kg bag)."),
  unitSize: z.string().optional(),
  sellPrice: z
    .number({ error: "Enter a sell price." })
    .positive("Sell price must be greater than zero."),
  originCountry: z.string().optional(),
  description: z.string().optional(),
  specifications: z.string().optional(),
  imageUrls: imageUrlsSchema.default([]),
  lowStockThreshold: z
    .number({ error: "Enter a valid threshold." })
    .min(0, "Threshold cannot be negative."),
})

export type UpdateProductInput = z.infer<typeof updateProductSchema>
