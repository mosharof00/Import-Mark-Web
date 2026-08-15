import "server-only"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { computeImportTotals, roundMoney } from "@/lib/imports/landed-cost"
import { nextShipmentRef } from "@/lib/imports/next-shipment-ref"
import type { CreateImportInput } from "@/lib/validations/import"

type ActionResult = { error?: string; shipmentId?: string }

function revalidateImportPaths(shipmentId?: string, productIds?: string[]) {
  revalidatePath("/admin")
  revalidatePath("/admin/imports")
  revalidatePath("/admin/inventory")
  revalidatePath("/admin/reports")
  revalidatePath("/admin/notifications")
  revalidatePath("/manager")
  revalidatePath("/manager/imports")
  revalidatePath("/manager/inventory")
  revalidatePath("/manager/reports")
  revalidatePath("/manager/notifications")
  if (shipmentId) {
    revalidatePath(`/admin/imports/${shipmentId}`)
    revalidatePath(`/manager/imports/${shipmentId}`)
  }
  for (const productId of productIds ?? []) {
    revalidatePath(`/admin/products/${productId}`)
    revalidatePath(`/manager/products/${productId}`)
  }
}

function mergeItems(items: CreateImportInput["items"]) {
  const merged = new Map<string, CreateImportInput["items"][number]>()
  for (const item of items) {
    const key = `${item.productId}::${item.batchNumber ?? ""}`
    const existing = merged.get(key)
    if (existing) {
      existing.quantity += item.quantity
    } else {
      merged.set(key, { ...item })
    }
  }
  return [...merged.values()]
}

export async function createImportCore(
  data: CreateImportInput,
  actorId: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const items = mergeItems(data.items)

  const { data: supplier, error: supplierError } = await supabase
    .from("suppliers")
    .select("id, name, is_active")
    .eq("id", data.supplierId)
    .maybeSingle()

  if (supplierError || !supplier) {
    return { error: "Supplier not found." }
  }
  if (!supplier.is_active) {
    return { error: "Imports can only be recorded for active suppliers." }
  }

  const productIds = [...new Set(items.map((i) => i.productId))]
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, status")
    .in("id", productIds)

  if (productsError || !products?.length) {
    return { error: "One or more products could not be found." }
  }
  if (products.length !== productIds.length) {
    return { error: "One or more products could not be found." }
  }
  if (products.some((p) => p.status === "rejected")) {
    return { error: "Rejected products cannot be imported." }
  }

  const totals = computeImportTotals({
    items: items.map((i) => ({
      quantity: i.quantity,
      costPerUnitForeign: i.costPerUnitForeign,
    })),
    exchangeRate: data.exchangeRate,
    freightCost: data.freightCost,
    customDuty: data.customDuty,
    portCharges: data.portCharges,
    otherCharges: data.otherCharges,
  })

  const shipmentRef = await nextShipmentRef(supabase)

  const { data: shipment, error: insertError } = await supabase
    .from("import_shipments")
    .insert({
      supplier_id: data.supplierId,
      shipment_ref: shipmentRef,
      invoice_number: data.invoiceNumber ?? null,
      lc_number: data.lcNumber ?? null,
      bl_number: data.blNumber ?? null,
      shipment_date: data.shipmentDate,
      currency: data.currency,
      exchange_rate: data.exchangeRate,
      total_invoice_cost: totals.totalInvoiceCost,
      total_invoice_bdt: totals.totalInvoiceBdt,
      freight_cost: data.freightCost,
      custom_duty: data.customDuty,
      port_charges: data.portCharges,
      other_charges: data.otherCharges,
      // total_landed_cost is GENERATED ALWAYS in Postgres — do not insert it.
      notes: data.notes ?? null,
      status: "in_transit",
      created_by: actorId,
    })
    .select("id, shipment_ref")
    .single()

  if (insertError || !shipment) {
    return { error: insertError?.message ?? "Could not create the shipment." }
  }

  const { error: itemsError } = await supabase.from("import_shipment_items").insert(
    items.map((item) => ({
      shipment_id: shipment.id,
      product_id: item.productId,
      quantity_imported: item.quantity,
      cost_per_unit_foreign: roundMoney(item.costPerUnitForeign, 4),
      cost_per_unit_bdt: roundMoney(item.costPerUnitForeign * data.exchangeRate, 4),
      batch_number: item.batchNumber ?? null,
      expiry_date: item.expiryDate ?? null,
    }))
  )

  if (itemsError) {
    await supabase.from("import_shipments").delete().eq("id", shipment.id)
    return { error: itemsError.message }
  }

  revalidateImportPaths(shipment.id, productIds)
  return { shipmentId: shipment.id }
}

export { revalidateImportPaths }
