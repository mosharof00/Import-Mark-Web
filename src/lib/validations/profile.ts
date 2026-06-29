import { z } from "zod"

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name."),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  address: z.string().optional(),
  area: z.string().optional(),
  city: z.string().optional(),
})
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
