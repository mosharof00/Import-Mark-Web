import "server-only"

import type { createClient } from "@/lib/supabase/server"

export async function nextShipmentRef(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `IMP-${year}-`

  const { data } = await supabase
    .from("import_shipments")
    .select("shipment_ref")
    .like("shipment_ref", `${prefix}%`)
    .order("shipment_ref", { ascending: false })
    .limit(20)

  let max = 0
  for (const row of data ?? []) {
    const match = row.shipment_ref?.match(/IMP-\d{4}-(\d+)$/)
    if (match) max = Math.max(max, Number.parseInt(match[1], 10))
  }

  return `${prefix}${String(max + 1).padStart(3, "0")}`
}
