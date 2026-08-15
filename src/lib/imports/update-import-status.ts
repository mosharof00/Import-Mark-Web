import "server-only"

import { createClient } from "@/lib/supabase/server"
import { applyClearedStock } from "@/lib/imports/apply-cleared-stock"
import { revalidateImportPaths } from "@/lib/imports/create-import"
import {
  canCancelShipment,
  getNextShipmentStatus,
} from "@/lib/imports/status-flow"
import {
  insertNotifications,
  listActiveAdminIds,
  listManagerIds,
} from "@/lib/notifications/create-notifications"
import type { ShipmentStatus } from "@/types"

type ActionResult = { error?: string } | void

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

function appendNote(
  existing: string | null,
  status: ShipmentStatus,
  note?: string
): string | null {
  const stamp = `[${todayIsoDate()} ${status}]${note ? ` ${note}` : ""}`
  const current = existing?.trim()
  return current ? `${current}\n${stamp}` : stamp
}

async function notifyShipmentUpdate(input: {
  actorId: string
  shipmentId: string
  title: string
  message: string
}) {
  const [adminIds, managerIds] = await Promise.all([
    listActiveAdminIds(input.actorId),
    listManagerIds(input.actorId),
  ])
  await insertNotifications(
    [...new Set([...adminIds, ...managerIds])].map((userId) => ({
      user_id: userId,
      type: "shipment_arrived",
      title: input.title,
      message: input.message,
      ref_id: input.shipmentId,
      ref_table: "import_shipments",
    }))
  )
}

export async function advanceImportStatusCore(
  shipmentId: string,
  actorId: string,
  eventDate?: string,
  note?: string
): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: shipment, error } = await supabase
    .from("import_shipments")
    .select("id, status, notes, shipment_ref, arrival_date, clearance_date, suppliers(name)")
    .eq("id", shipmentId)
    .single()

  if (error || !shipment) return { error: "Shipment not found." }

  const current = shipment.status as ShipmentStatus
  const next = getNextShipmentStatus(current)
  if (!next) {
    return { error: "This shipment cannot be advanced further." }
  }

  const date = eventDate || todayIsoDate()
  const patch: {
    status: ShipmentStatus
    notes: string | null
    arrival_date?: string
    clearance_date?: string
  } = {
    status: next,
    notes: appendNote(shipment.notes, next, note),
  }

  if (next === "arrived" && !shipment.arrival_date) {
    patch.arrival_date = date
  }
  if (next === "cleared") {
    patch.clearance_date = shipment.clearance_date ?? date
    if (!shipment.arrival_date) patch.arrival_date = date
  }

  const { error: updateError } = await supabase
    .from("import_shipments")
    .update(patch)
    .eq("id", shipmentId)
    .eq("status", current)

  if (updateError) return { error: updateError.message }

  if (next === "cleared") {
    const stockResult = await applyClearedStock(
      shipmentId,
      actorId,
      shipment.shipment_ref
    )
    if (stockResult.error) {
      await supabase
        .from("import_shipments")
        .update({
          status: current,
          clearance_date: shipment.clearance_date,
          notes: shipment.notes,
        })
        .eq("id", shipmentId)
      return { error: stockResult.error }
    }
  }

  const supplierName = shipment.suppliers?.name ?? "supplier"
  const ref = shipment.shipment_ref ?? "Shipment"
  if (next === "arrived") {
    await notifyShipmentUpdate({
      actorId,
      shipmentId,
      title: "Shipment arrived",
      message: `${ref} from ${supplierName} has arrived at port.`,
    })
  } else if (next === "cleared") {
    await notifyShipmentUpdate({
      actorId,
      shipmentId,
      title: "Import cleared",
      message: `${ref} from ${supplierName} is cleared. Stock has been updated.`,
    })
  }

  const { data: items } = await supabase
    .from("import_shipment_items")
    .select("product_id")
    .eq("shipment_id", shipmentId)

  revalidateImportPaths(
    shipmentId,
    (items ?? []).map((i) => i.product_id)
  )
}

export async function cancelImportCore(
  shipmentId: string,
  _actorId: string,
  note?: string
): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: shipment, error } = await supabase
    .from("import_shipments")
    .select("id, status, notes, shipment_ref")
    .eq("id", shipmentId)
    .single()

  if (error || !shipment) return { error: "Shipment not found." }

  const current = shipment.status as ShipmentStatus
  if (!canCancelShipment(current)) {
    return { error: "Cleared shipments cannot be cancelled." }
  }

  const { error: updateError } = await supabase
    .from("import_shipments")
    .update({
      status: "cancelled",
      notes: appendNote(shipment.notes, "cancelled", note),
    })
    .eq("id", shipmentId)
    .eq("status", current)

  if (updateError) return { error: updateError.message }

  revalidateImportPaths(shipmentId)
}
