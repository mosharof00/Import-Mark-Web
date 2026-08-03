import { z } from "zod"

export const createCustomerAccountSchema = z.object({
  fullName: z.string().min(2, "Enter the full name."),
  email: z.string().email("Enter a valid email address."),
  phone: z.string().optional(),
  companyName: z.string().optional(),
})
export type CreateCustomerAccountInput = z.infer<
  typeof createCustomerAccountSchema
>

export const createManagerAccountSchema = z.object({
  fullName: z.string().min(2, "Enter the full name."),
  email: z.string().email("Enter a valid email address."),
  phone: z.string().optional(),
})
export type CreateManagerAccountInput = z.infer<
  typeof createManagerAccountSchema
>
