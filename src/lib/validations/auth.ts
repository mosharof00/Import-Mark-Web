import { z } from "zod"

/**
 * Zod schemas for the auth forms. Each schema is shared between the client form
 * (via @hookform/resolvers) and the server action (which re-validates the input
 * — never trust the client).
 */

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
})
export type LoginInput = z.infer<typeof loginSchema>

export const customerSignupSchema = z
  .object({
    fullName: z.string().min(2, "Please enter your full name."),
    companyName: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email("Enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })
export type CustomerSignupInput = z.infer<typeof customerSignupSchema>

export const otpSchema = z.object({
  email: z.string().email(),
  token: z
    .string()
    .min(6, "Enter the 6-digit code.")
    .max(6, "Enter the 6-digit code."),
})
export type OtpInput = z.infer<typeof otpSchema>

export const setPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })
export type SetPasswordInput = z.infer<typeof setPasswordSchema>

export const changePasswordWithOtpSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
    token: z
      .string()
      .min(6, "Enter the 6-digit code.")
      .max(6, "Enter the 6-digit code."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })
export type ChangePasswordWithOtpInput = z.infer<
  typeof changePasswordWithOtpSchema
>

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address."),
})
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
