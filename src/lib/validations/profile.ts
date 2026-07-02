import { z } from "zod"

const optionalUrl = z
  .string()
  .url("Enter a valid image URL.")
  .or(z.literal(""))

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name."),
  phone: z.string().optional(),
  avatarUrl: optionalUrl.optional(),
  companyName: z.string().optional(),
  address: z.string().optional(),
  area: z.string().optional(),
  city: z.string().optional(),
})
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
