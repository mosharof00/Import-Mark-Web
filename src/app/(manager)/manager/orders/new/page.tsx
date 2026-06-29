import { notFound } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { getAuthedUser } from "@/lib/auth/get-user"
import { PageHeader } from "@/components/shared/page-header"

import { PlaceOrderWizard } from "./_components/place-order-wizard"
import type {
  CategoryOption,
  WizardAddress,
  WizardCustomer,
  WizardGateway,
  WizardProduct,
} from "./_components/types"

export const dynamic = "force-dynamic"

export default async function PlaceOrderPage() {
  const { user, role } = await getAuthedUser()
  if (!user || role !== "manager") notFound()

  const supabase = await createClient()

  const [
    customersRes,
    ledgerRes,
    productsRes,
    profitabilityRes,
    categoriesRes,
    addressesRes,
    gatewaysRes,
  ] = await Promise.all([
    supabase
      .from("customers")
      .select("id, full_name, company_name, phone, city, status")
      .eq("status", "active")
      .order("full_name"),
    supabase.from("customer_ledger").select("customer_id, total_due"),
    supabase
      .from("products")
      .select(
        "id, name, sell_price, unit, status, category_id, categories(name), brands(name), stock(quantity_available)"
      )
      .eq("status", "active")
      .order("name"),
    supabase
      .from("product_profitability")
      .select("product_id, avg_cost_per_unit_bdt"),
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("customer_addresses").select("*").order("label"),
    supabase
      .from("payment_gateways")
      .select("*")
      .eq("status", "active")
      .order("sort_order"),
  ])

  const dueMap = new Map(
    (ledgerRes.data ?? []).map((row) => [
      row.customer_id ?? "",
      row.total_due ?? 0,
    ])
  )

  const costMap = new Map(
    (profitabilityRes.data ?? []).map((row) => [
      row.product_id ?? "",
      row.avg_cost_per_unit_bdt,
    ])
  )

  const customers: WizardCustomer[] = (customersRes.data ?? []).map((c) => ({
    id: c.id,
    fullName: c.full_name,
    companyName: c.company_name,
    phone: c.phone,
    city: c.city,
    totalDue: dueMap.get(c.id) ?? 0,
  }))

  const products: WizardProduct[] = (productsRes.data ?? []).map((p) => {
    const stock = Array.isArray(p.stock) ? p.stock[0] : p.stock
    return {
      id: p.id,
      name: p.name,
      brandName: p.brands?.name ?? null,
      categoryName: p.categories?.name ?? "Uncategorized",
      categoryId: p.category_id,
      unit: p.unit,
      sellPrice: p.sell_price,
      stockAvailable: stock?.quantity_available ?? 0,
      avgCost: costMap.get(p.id) ?? null,
    }
  })

  const categories: CategoryOption[] = (categoriesRes.data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
  }))

  const addresses: WizardAddress[] = (addressesRes.data ?? []).map((a) => ({
    id: a.id,
    customerId: a.customer_id,
    label: a.label,
    recipientName: a.recipient_name,
    recipientPhone: a.recipient_phone,
    addressLine1: a.address_line_1,
    addressLine2: a.address_line_2,
    city: a.city,
    stateProvince: a.state_province,
    postalCode: a.postal_code,
    country: a.country,
    isDefault: a.is_default,
  }))

  const gateways: WizardGateway[] = (gatewaysRes.data ?? []).map((g) => ({
    id: g.id,
    name: g.name,
    type: g.type,
    accountName: g.account_name,
    accountNumber: g.account_number,
    bankName: g.bank_name,
    branchName: g.branch_name,
    routingNumber: g.routing_number,
    instructions: g.instructions,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Place Order"
        description="Create a new sales order for a customer — it will be sent to admin for approval."
      />
      <PlaceOrderWizard
        customers={customers}
        products={products}
        categories={categories}
        addresses={addresses}
        gateways={gateways}
      />
    </div>
  )
}
