"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { getAuthedUser } from "@/lib/auth/get-user"
import { ROLE_HOME, type UserRole } from "@/lib/auth/roles"
import {
  deleteStorageUrls,
  storageUrlsAdded,
  storageUrlsToDelete,
} from "@/lib/storage/cleanup"
import {
  changePasswordWithOtpSchema,
  type ChangePasswordWithOtpInput,
} from "@/lib/validations/auth"
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from "@/lib/validations/profile"

type ActionResult = { error?: string; success?: string } | void

function profilePaths(role: UserRole) {
  const base = ROLE_HOME[role]
  return [base, `${base}/profile`, `${base}/notifications`, `${base}/settings`]
}

function revalidateProfile(role: UserRole) {
  for (const path of profilePaths(role)) {
    revalidatePath(path)
  }
}

async function requireAuthedRole() {
  const { user, role } = await getAuthedUser()
  if (!user || !role) {
    return { error: "You are not authorized to perform this action." as const }
  }
  return { user, role }
}

export async function updateProfile(
  values: UpdateProfileInput
): Promise<ActionResult> {
  const auth = await requireAuthedRole()
  if ("error" in auth) return auth

  const parsed = updateProfileSchema.safeParse(values)
  if (!parsed.success) {
    return { error: "Please check the form and try again." }
  }

  const { user, role } = auth
  const data = parsed.data
  const supabase = await createClient()
  const phone = data.phone?.trim() || null
  const nextAvatarUrl = data.avatarUrl?.trim() || null

  let previousAvatarUrl: string | null = null

  if (role === "admin") {
    const { data: row } = await supabase
      .from("admins")
      .select("avatar_url")
      .eq("id", user.id)
      .single()
    previousAvatarUrl = row?.avatar_url ?? null
  } else if (role === "manager") {
    const { data: row } = await supabase
      .from("managers")
      .select("avatar_url")
      .eq("id", user.id)
      .single()
    previousAvatarUrl = row?.avatar_url ?? null
  } else {
    const { data: row } = await supabase
      .from("customers")
      .select("avatar_url")
      .eq("id", user.id)
      .single()
    previousAvatarUrl = row?.avatar_url ?? null
  }

  const added = storageUrlsAdded(previousAvatarUrl, nextAvatarUrl)

  if (role === "admin") {
    const { error } = await supabase
      .from("admins")
      .update({
        full_name: data.fullName.trim(),
        phone,
        avatar_url: nextAvatarUrl,
      })
      .eq("id", user.id)

    if (error) {
      await deleteStorageUrls(added)
      return { error: error.message }
    }
  } else if (role === "manager") {
    const { error } = await supabase
      .from("managers")
      .update({
        full_name: data.fullName.trim(),
        phone,
        avatar_url: nextAvatarUrl,
      })
      .eq("id", user.id)

    if (error) {
      await deleteStorageUrls(added)
      return { error: error.message }
    }
  } else {
    const { error } = await supabase
      .from("customers")
      .update({
        full_name: data.fullName.trim(),
        phone,
        avatar_url: nextAvatarUrl,
        company_name: data.companyName?.trim() || null,
        address: data.address?.trim() || null,
        area: data.area?.trim() || null,
        city: data.city?.trim() || null,
      })
      .eq("id", user.id)

    if (error) {
      await deleteStorageUrls(added)
      return { error: error.message }
    }
  }

  await deleteStorageUrls(storageUrlsToDelete(previousAvatarUrl, nextAvatarUrl))

  await supabase.auth.updateUser({
    data: { full_name: data.fullName.trim(), phone },
  })

  revalidateProfile(role)
  return { success: "Profile updated successfully." }
}

export async function requestChangePasswordOtp(): Promise<ActionResult> {
  const auth = await requireAuthedRole()
  if ("error" in auth) return auth

  const email = auth.user.email
  if (!email) return { error: "Your account has no email address." }

  const supabase = await createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/confirm?next=/reset-password`,
  })

  if (error) return { error: error.message }
  return { success: "Verification code sent to your email." }
}

export async function changePassword(
  values: ChangePasswordWithOtpInput
): Promise<ActionResult> {
  const auth = await requireAuthedRole()
  if ("error" in auth) return auth

  const parsed = changePasswordWithOtpSchema.safeParse(values)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." }
  }

  const email = auth.user.email
  if (!email) return { error: "Your account has no email address." }

  const supabase = await createClient()
  const { data, error: otpError } = await supabase.auth.verifyOtp({
    email,
    token: parsed.data.token,
    type: "recovery",
  })

  if (otpError || !data.user) {
    return { error: otpError?.message ?? "Invalid or expired verification code." }
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })

  if (error) return { error: error.message }

  revalidateProfile(auth.role)
  return { success: "Password updated successfully." }
}

export async function markNotificationRead(
  notificationId: string
): Promise<ActionResult> {
  const auth = await requireAuthedRole()
  if ("error" in auth) return auth

  const supabase = await createClient()
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", auth.user.id)

  if (error) return { error: error.message }

  revalidateProfile(auth.role)
}

export async function markNotificationReadAction(
  formData: FormData
): Promise<void> {
  const id = formData.get("id")
  if (typeof id !== "string" || !id) return
  await markNotificationRead(id)
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  const auth = await requireAuthedRole()
  if ("error" in auth) return auth

  const supabase = await createClient()
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", auth.user.id)
    .eq("is_read", false)

  if (error) return { error: error.message }

  revalidateProfile(auth.role)
  return { success: "All notifications marked as read." }
}

export async function markAllNotificationsReadAction(): Promise<void> {
  await markAllNotificationsRead()
}
