"use server"

import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { dashboardPathForRole, getUserRole } from "@/lib/auth/roles"
import {
  loginSchema,
  customerSignupSchema,
  otpSchema,
  setPasswordSchema,
  forgotPasswordSchema,
  type LoginInput,
  type CustomerSignupInput,
  type OtpInput,
  type SetPasswordInput,
  type ForgotPasswordInput,
} from "@/lib/validations/auth"

/** Shape returned to the client forms when something goes wrong. */
type ActionResult = { error: string }
type LoginSuccess = { redirectTo: string }

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

// ── LOGIN ────────────────────────────────────────────────────────────────
// Email + password sign in for any role. On success we return the dashboard
// path so the client can navigate — avoiding server-action redirect(), which
// surfaces as a false "{}" error toast in some clients (e.g. mobile WebView).
export async function login(
  values: LoginInput
): Promise<ActionResult | LoginSuccess> {
  const parsed = loginSchema.safeParse(values)
  if (!parsed.success) {
    return { error: "Please check the form and try again." }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { error: error.message || "Invalid email or password." }
  }

  const role = getUserRole(data.user)
  if (!role) {
    await supabase.auth.signOut()
    return {
      error:
        "This account has no role assigned. Use a manager, admin, or customer account.",
    }
  }

  return { redirectTo: dashboardPathForRole(role) }
}

// ── CUSTOMER SELF-REGISTRATION ─────────────────────────────────────────────
// Creates the auth user and sends a verification email. The display fields are
// stashed in user_metadata so we can copy them into the customers row once the
// email is verified. With email confirmation enabled, no session exists yet.
export async function signUpCustomer(
  values: CustomerSignupInput
): Promise<ActionResult | void> {
  const { getAppSettings } = await import("@/lib/settings/get-settings")
  const settings = await getAppSettings()
  if (!settings.public_customer_registration) {
    return { error: "New customer registration is currently closed." }
  }

  const parsed = customerSignupSchema.safeParse(values)
  if (!parsed.success) {
    return { error: "Please check the form and try again." }
  }

  const { fullName, companyName, phone, email, password } = parsed.data
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Personal info goes in user_metadata (not the role!). Role lives in
      // app_metadata and is set server-side during verification.
      data: {
        full_name: fullName,
        company_name: companyName ?? null,
        phone: phone ?? null,
      },
      emailRedirectTo: `${SITE_URL}/auth/confirm?next=/customer`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  redirect(`/verify-otp?email=${encodeURIComponent(email)}&flow=signup`)
}

// ── VERIFY OTP (customer signup) ───────────────────────────────────────────
// Confirms the 6-digit email code, then finalizes the account: sets the
// customer role in app_metadata and creates the customers row (status pending).
// Self-registered customers stay 'pending' until an admin/manager activates
// them, so we sign them out and send them to login afterward.
export async function verifyCustomerOtp(
  values: OtpInput
): Promise<ActionResult | void> {
  const parsed = otpSchema.safeParse(values)
  if (!parsed.success) {
    return { error: "Enter the 6-digit code from your email." }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.verifyOtp({
    email: parsed.data.email,
    token: parsed.data.token,
    type: "email",
  })

  if (error || !data.user) {
    return { error: error?.message ?? "Verification failed. Try again." }
  }

  const user = data.user
  const admin = createAdminClient()

  // Set the server-controlled role.
  const { error: roleError } = await admin.auth.admin.updateUserById(user.id, {
    app_metadata: { role: "customer" },
  })
  if (roleError) {
    return { error: roleError.message }
  }

  // Create the matching customers row (bypasses RLS via the admin client).
  const meta = user.user_metadata ?? {}
  const { getAppSettings } = await import("@/lib/settings/get-settings")
  const settings = await getAppSettings()
  const customerStatus = settings.customer_auto_activate_on_signup
    ? "active"
    : "pending"

  const { error: insertError } = await admin.from("customers").insert({
    id: user.id,
    full_name: (meta.full_name as string) ?? "Customer",
    email: user.email ?? parsed.data.email,
    phone: (meta.phone as string) ?? null,
    company_name: (meta.company_name as string) ?? null,
    status: customerStatus,
    created_by: null,
  })
  // Ignore duplicate inserts (e.g. if verification is retried).
  if (insertError && insertError.code !== "23505") {
    return { error: insertError.message }
  }

  // Account is pending activation, so do not keep them signed in.
  await supabase.auth.signOut()
  redirect("/login?registered=1")
}

// ── MANAGER: SET FIRST PASSWORD ────────────────────────────────────────────
// Used after a manager verifies their invite. At this point a session exists
// (from the invite/OTP) and their managers row + role were created by the admin
// flow, so we just set their password and send them to their dashboard.
export async function setManagerPassword(
  values: SetPasswordInput
): Promise<ActionResult | void> {
  const parsed = setPasswordSchema.safeParse(values)
  if (!parsed.success) {
    return { error: "Please check the form and try again." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Your session has expired. Please use the link again." }
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })
  if (error) {
    return { error: error.message }
  }

  redirect(dashboardPathForRole(getUserRole(user)))
}

// ── PASSWORD RESET: REQUEST EMAIL ──────────────────────────────────────────
export async function requestPasswordReset(
  values: ForgotPasswordInput
): Promise<ActionResult | void> {
  const parsed = forgotPasswordSchema.safeParse(values)
  if (!parsed.success) {
    return { error: "Enter a valid email address." }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    { redirectTo: `${SITE_URL}/auth/confirm?next=/reset-password` }
  )
  if (error) {
    return { error: error.message }
  }

  redirect("/forgot-password?sent=1")
}

// ── PASSWORD RESET: SET NEW PASSWORD ───────────────────────────────────────
// Runs with the recovery session created by /auth/confirm.
export async function updatePassword(
  values: SetPasswordInput
): Promise<ActionResult | void> {
  const parsed = setPasswordSchema.safeParse(values)
  if (!parsed.success) {
    return { error: "Please check the form and try again." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Your reset link has expired. Request a new one." }
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })
  if (error) {
    return { error: error.message }
  }

  redirect(dashboardPathForRole(getUserRole(user)))
}
