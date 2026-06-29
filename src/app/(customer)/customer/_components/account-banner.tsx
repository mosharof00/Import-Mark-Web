import { AlertCircle } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { getAuthedUser } from "@/lib/auth/get-user"
import type { UserStatus } from "@/types"

const MESSAGE: Record<Exclude<UserStatus, "active">, string> = {
  pending:
    "Your account is pending activation. You can browse products, but order placement may be limited until an admin approves your account.",
  inactive:
    "Your account is inactive. Contact support if you believe this is a mistake.",
}

export async function AccountBanner() {
  const { user } = await getAuthedUser()
  if (!user) return null

  const supabase = await createClient()
  const { data: customer } = await supabase
    .from("customers")
    .select("status")
    .eq("id", user.id)
    .maybeSingle()

  const status = customer?.status as UserStatus | undefined
  if (!status || status === "active") return null

  const message =
    MESSAGE[status as Exclude<UserStatus, "active">] ??
    "Your account is not fully active yet."

  return (
    <div className="border-amber-200 bg-amber-50/70 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <p>{message}</p>
    </div>
  )
}
