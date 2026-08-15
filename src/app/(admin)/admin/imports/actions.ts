"use server"

import { getAuthedUser } from "@/lib/auth/get-user"
import { createImportCore } from "@/lib/imports/create-import"
import {
  advanceImportStatusCore,
  cancelImportCore,
} from "@/lib/imports/update-import-status"
import {
  advanceImportSchema,
  createImportSchema,
  type AdvanceImportInput,
  type CreateImportInput,
} from "@/lib/validations/import"

type CreateResult = { error?: string; shipmentId?: string }
type ActionResult = { error?: string } | void

async function requireAdmin() {
  const { user, role } = await getAuthedUser()
  if (!user || role !== "admin") {
    return { error: "Only an administrator can manage imports." as const }
  }
  return { user }
}

export async function createImport(
  values: CreateImportInput
): Promise<CreateResult> {
  const auth = await requireAdmin()
  if ("error" in auth) return auth

  const parsed = createImportSchema.safeParse(values)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." }
  }

  return createImportCore(parsed.data, auth.user.id)
}

export async function advanceImportStatus(
  values: AdvanceImportInput
): Promise<ActionResult> {
  const auth = await requireAdmin()
  if ("error" in auth) return auth

  const parsed = advanceImportSchema.safeParse(values)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid request." }
  }

  return advanceImportStatusCore(
    parsed.data.shipmentId,
    auth.user.id,
    parsed.data.eventDate,
    parsed.data.note
  )
}

export async function cancelImport(
  values: AdvanceImportInput
): Promise<ActionResult> {
  const auth = await requireAdmin()
  if ("error" in auth) return auth

  const parsed = advanceImportSchema.safeParse(values)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid request." }
  }

  return cancelImportCore(parsed.data.shipmentId, auth.user.id, parsed.data.note)
}
