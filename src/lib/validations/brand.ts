import { z } from "zod"

const optionalUrl = z
  .string()
  .url("Enter a valid image URL.")
  .or(z.literal(""))

export const brandFormSchema = z.object({
  name: z.string().min(2, "Enter a brand name."),
  logoUrl: optionalUrl.optional(),
  website: z
    .string()
    .url("Enter a valid website URL.")
    .or(z.literal(""))
    .optional(),
  countryOfOrigin: z.string().optional(),
  isActive: z.boolean(),
})

export type BrandFormInput = z.infer<typeof brandFormSchema>
