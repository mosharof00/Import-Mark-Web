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
type ActionSuccess = { error?: undefined }
type LoginSuccess = { redirectTo: string }

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

// ── LOGIN ────────────────────────────────────────────────────────────────
// Email + password sign in for any role. On success we return the dashboard
// path so the client can navigate — avoiding server-action redirect(), which
// surfaces as a false "{}" error toast in some clients (e.g. mobile WebView).
export async function login(
  values: LoginInput,
  nextPath?: string | null
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

  const safeNext =
    nextPath &&
    nextPath.startsWith("/") &&
    !nextPath.startsWith("//") &&
    !nextPath.startsWith("/login") &&
    !nextPath.startsWith("/signup")
      ? nextPath
      : null

  return { redirectTo: safeNext ?? dashboardPathForRole(role) }
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

function normalizeOtpToken(token: string) {
  return token.replace(/\s+/g, "").trim()
}

async function finalizeCustomerSignup(
  user: {
    id: string
    email?: string | null
    user_metadata?: Record<string, unknown> | null
  },
  /** Prefer the caller's session client after verifyOtp (authenticated INSERT). */
  sessionClient?: Awaited<ReturnType<typeof createClient>>
): Promise<ActionResult | ActionSuccess> {
  const admin = createAdminClient()

  const { error: roleError } = await admin.auth.admin.updateUserById(user.id, {
    app_metadata: { role: "customer" },
  })
  if (roleError) return { error: roleError.message }

  const meta = user.user_metadata ?? {}
  const { getAppSettings } = await import("@/lib/settings/get-settings")
  const settings = await getAppSettings()
  const customerStatus = settings.customer_auto_activate_on_signup
    ? "active"
    : "pending"

  const row = {
    id: user.id,
    full_name: (meta.full_name as string) ?? "Customer",
    email: user.email ?? "",
    phone: (meta.phone as string) ?? null,
    company_name: (meta.company_name as string) ?? null,
    status: customerStatus as "active" | "pending",
    created_by: null,
  }

  // 1) Session client — works with "Customer inserts own record" RLS.
  if (sessionClient) {
    const { error: sessionError } = await sessionClient
      .from("customers")
      .upsert(row, { onConflict: "id" })
    if (!sessionError) return {}
  }

  // 2) Service-role client — bypasses RLS (requires table GRANTs).
  const { error: adminError } = await admin
    .from("customers")
    .upsert(row, { onConflict: "id" })

  if (adminError) {
    return {
      error:
        adminError.message ||
        "Could not create your customer profile. Please try again.",
    }
  }
  return {}
}

async function findAuthUserByEmail(email: string) {
  const admin = createAdminClient()
  const normalized = email.trim().toLowerCase()

  // Paginate lightly — wholesale apps stay small; used only as OTP recovery.
  for (let page = 1; page <= 5; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    })
    if (error) return { user: null, error: error.message }
    const match = data.users.find(
      (u) => (u.email ?? "").toLowerCase() === normalized
    )
    if (match) return { user: match, error: null }
    if (data.users.length < 200) break
  }

  return { user: null, error: null }
}

// ── VERIFY OTP (customer signup) ───────────────────────────────────────────
// Confirms the 6-digit email code, then finalizes the account: sets the
// customer role in app_metadata and creates the customers row.
export async function verifyCustomerOtp(
  values: OtpInput
): Promise<ActionResult | void> {
  const parsed = otpSchema.safeParse({
    ...values,
    token: normalizeOtpToken(values.token),
  })
  if (!parsed.success) {
    return { error: "Enter the 6-digit code from your email." }
  }

  const email = parsed.data.email
  const token = parsed.data.token
  const supabase = await createClient()

  // Prefer "signup" for confirm-signup emails; fall back to "email".
  let verify = await supabase.auth.verifyOtp({
    email,
    token,
    type: "signup",
  })
  if (verify.error) {
    verify = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    })
  }

  let user = verify.data.user

  // Token already used (double-click / prior success): finish account if confirmed.
  if (verify.error || !user) {
    const existing = await findAuthUserByEmail(email)
    if (existing.user?.email_confirmed_at) {
      const finalized = await finalizeCustomerSignup(existing.user, supabase)
      if (finalized && "error" in finalized && finalized.error) {
        await supabase.auth.signOut()
        return { error: finalized.error }
      }
      await supabase.auth.signOut()
      redirect("/login?registered=1")
    }

    return {
      error:
        verify.error?.message ??
        "Verification failed. Request a new code and try again.",
    }
  }

  const finalized = await finalizeCustomerSignup(user, supabase)
  if (finalized && "error" in finalized && finalized.error) {
    await supabase.auth.signOut()
    return { error: finalized.error }
  }

  await supabase.auth.signOut()
  redirect("/login?registered=1")
}

/** Resend the confirm-signup OTP email. */
export async function resendSignupOtp(
  values: ForgotPasswordInput
): Promise<ActionResult | ActionSuccess> {
  const parsed = forgotPasswordSchema.safeParse(values)
  if (!parsed.success) {
    return { error: "Enter a valid email address." }
  }

  const email = parsed.data.email
  const existing = await findAuthUserByEmail(email)
  if (existing.user?.email_confirmed_at) {
    const finalized = await finalizeCustomerSignup(existing.user)
    if (finalized && "error" in finalized && finalized.error) {
      return { error: finalized.error }
    }
    return {
      error:
        "This email is already verified. Please sign in with your password.",
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${SITE_URL}/auth/confirm?next=/customer`,
    },
  })

  if (error) return { error: error.message }
  return {}
}

// ── INVITE: VERIFY OTP ─────────────────────────────────────────────────────
export async function verifyInviteOtp(
  values: OtpInput
): Promise<ActionResult | void> {
  const parsed = otpSchema.safeParse({
    ...values,
    token: normalizeOtpToken(values.token),
  })
  if (!parsed.success) {
    return { error: "Enter the 6-digit code from your email." }
  }

  const supabase = await createClient()
  let verify = await supabase.auth.verifyOtp({
    email: parsed.data.email,
    token: parsed.data.token,
    type: "invite",
  })

  if (verify.error) {
    verify = await supabase.auth.verifyOtp({
      email: parsed.data.email,
      token: parsed.data.token,
      type: "signup",
    })
  }

  if (verify.error || !verify.data.user) {
    return {
      error:
        verify.error?.message ??
        "Verification failed. Request a new invite and try again.",
    }
  }

  redirect("/set-password")
}

// ── INVITED USER: SET FIRST PASSWORD ───────────────────────────────────────
// Used after invite email verification (manager or customer created by staff).
export async function setInvitedUserPassword(
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
    return { error: "Your session has expired. Please use the invite again." }
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })
  if (error) {
    return { error: error.message }
  }

  redirect(dashboardPathForRole(getUserRole(user)))
}

/** @deprecated Use setInvitedUserPassword */
export async function setManagerPassword(
  values: SetPasswordInput
): Promise<ActionResult | void> {
  return setInvitedUserPassword(values)
}

// ── PASSWORD RESET: REQUEST EMAIL OTP ──────────────────────────────────────
export async function requestPasswordReset(
  values: ForgotPasswordInput
): Promise<ActionResult | void> {
  const parsed = forgotPasswordSchema.safeParse(values)
  if (!parsed.success) {
    return { error: "Enter a valid email address." }
  }

  const email = parsed.data.email
  const result = await sendRecoveryOtp(email)
  if (result?.error) return result

  redirect(
    `/verify-otp?email=${encodeURIComponent(email)}&flow=recovery`
  )
}

/** Resend recovery OTP without redirecting (used on /verify-otp). */
export async function resendRecoveryOtp(
  values: ForgotPasswordInput
): Promise<ActionResult | ActionSuccess> {
  const parsed = forgotPasswordSchema.safeParse(values)
  if (!parsed.success) {
    return { error: "Enter a valid email address." }
  }
  return sendRecoveryOtp(parsed.data.email)
}

async function sendRecoveryOtp(
  email: string
): Promise<ActionResult | ActionSuccess> {
  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE_URL}/auth/confirm?next=/reset-password`,
  })
  if (error) return { error: error.message }
  return {}
}

// ── PASSWORD RESET: VERIFY RECOVERY OTP ────────────────────────────────────
export async function verifyRecoveryOtp(
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
    type: "recovery",
  })

  if (error || !data.user) {
    return { error: error?.message ?? "Verification failed. Try again." }
  }

  redirect("/reset-password")
}

// ── PASSWORD RESET: SET NEW PASSWORD ───────────────────────────────────────
// Runs with the recovery session created by verifyRecoveryOtp (or /auth/confirm).
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
    return { error: "Your reset code has expired. Request a new one." }
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })
  if (error) {
    return { error: error.message }
  }

  redirect(dashboardPathForRole(getUserRole(user)))
}
