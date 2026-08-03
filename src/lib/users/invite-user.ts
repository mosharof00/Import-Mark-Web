import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

export type InviteRole = "customer" | "manager"

type InviteInput = {
  email: string
  fullName: string
  phone?: string | null
  companyName?: string | null
  role: InviteRole
  createdBy: string
}

type InviteResult = { error?: string; userId?: string }

async function emailAlreadyRegistered(
  email: string
): Promise<string | null> {
  const admin = createAdminClient()
  const normalized = email.trim().toLowerCase()

  const [{ data: customer }, { data: manager }] = await Promise.all([
    admin
      .from("customers")
      .select("id")
      .ilike("email", normalized)
      .maybeSingle(),
    admin
      .from("managers")
      .select("id")
      .ilike("email", normalized)
      .maybeSingle(),
  ])

  if (customer) return "A customer account already exists with this email."
  if (manager) return "A manager account already exists with this email."

  for (let page = 1; page <= 5; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    })
    if (error) break
    const match = data.users.find(
      (u) => (u.email ?? "").toLowerCase() === normalized
    )
    if (match) {
      return "An auth account already exists with this email."
    }
    if (data.users.length < 200) break
  }

  return null
}

/**
 * Invites a user by email (verification via Accept invite link), sets role
 * metadata, and creates an active customers/managers profile row.
 */
export async function inviteUserWithProfile(
  input: InviteInput
): Promise<InviteResult> {
  const email = input.email.trim().toLowerCase()

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address." }
  }

  const existing = await emailAlreadyRegistered(email)
  if (existing) return { error: existing }

  const admin = createAdminClient()

  // redirectTo is used if the email falls back to {{ .ConfirmationURL }}.
  // Our Invite template uses /auth/confirm?token_hash=...&next=/set-password.
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${SITE_URL}/auth/confirm?next=/set-password`,
    data: {
      full_name: input.fullName.trim(),
      phone: input.phone?.trim() || null,
      company_name: input.companyName?.trim() || null,
    },
  })

  if (error || !data.user) {
    return { error: error?.message ?? "Could not send invite email." }
  }

  const userId = data.user.id

  const { error: roleError } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: { role: input.role },
  })
  if (roleError) {
    return { error: roleError.message }
  }

  if (input.role === "customer") {
    const { error: rowError } = await admin.from("customers").upsert(
      {
        id: userId,
        email,
        full_name: input.fullName.trim(),
        phone: input.phone?.trim() || null,
        company_name: input.companyName?.trim() || null,
        status: "active",
        created_by: input.createdBy,
      },
      { onConflict: "id" }
    )
    if (rowError) return { error: rowError.message }
  } else {
    const { error: rowError } = await admin.from("managers").upsert(
      {
        id: userId,
        email,
        full_name: input.fullName.trim(),
        phone: input.phone?.trim() || null,
        status: "active",
        created_by: input.createdBy,
      },
      { onConflict: "id" }
    )
    if (rowError) return { error: rowError.message }
  }

  return { userId }
}
