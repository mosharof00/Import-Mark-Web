import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { UserRole } from "@/lib/auth/roles"
import type { UserStatus } from "@/types"

export type UserProfile = {
  id: string
  fullName: string
  email: string
  phone: string | null
  avatarUrl: string | null
  createdAt: string
  role: UserRole
  companyName?: string | null
  address?: string | null
  area?: string | null
  city?: string | null
  status?: UserStatus
  isActive?: boolean
}

export async function getCurrentProfile(
  userId: string,
  role: UserRole
): Promise<UserProfile | null> {
  const supabase = await createClient()

  if (role === "admin") {
    const { data } = await supabase
      .from("admins")
      .select("id, full_name, email, phone, avatar_url, created_at, is_active")
      .eq("id", userId)
      .maybeSingle()

    if (!data) return null

    return {
      id: data.id,
      fullName: data.full_name,
      email: data.email,
      phone: data.phone,
      avatarUrl: data.avatar_url,
      createdAt: data.created_at,
      role,
      isActive: data.is_active,
    }
  }

  if (role === "manager") {
    const { data } = await supabase
      .from("managers")
      .select("id, full_name, email, phone, avatar_url, created_at, status")
      .eq("id", userId)
      .maybeSingle()

    if (!data) return null

    return {
      id: data.id,
      fullName: data.full_name,
      email: data.email,
      phone: data.phone,
      avatarUrl: data.avatar_url,
      createdAt: data.created_at,
      role,
      status: data.status,
    }
  }

  const { data } = await supabase
    .from("customers")
    .select(
      "id, full_name, email, phone, avatar_url, created_at, status, company_name, address, area, city"
    )
    .eq("id", userId)
    .maybeSingle()

  if (!data) return null

  return {
    id: data.id,
    fullName: data.full_name,
    email: data.email,
    phone: data.phone,
    avatarUrl: data.avatar_url,
    createdAt: data.created_at,
    role,
    status: data.status,
    companyName: data.company_name,
    address: data.address,
    area: data.area,
    city: data.city,
  }
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const supabase = await createClient()
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false)

  return count ?? 0
}
