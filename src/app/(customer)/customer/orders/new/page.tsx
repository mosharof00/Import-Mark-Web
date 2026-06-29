import { notFound, redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { getAuthedUser } from "@/lib/auth/get-user"
import { getAppSettings } from "@/lib/settings/get-settings"
import { PageHeader } from "@/components/shared/page-header"

import { CustomerPlaceOrderWizard } from "./_components/customer-place-order-wizard"
import type {
  CategoryOption,
  WizardAddress,
  WizardGateway,
  WizardProduct,
} from "@/app/(manager)/manager/orders/new/_components/types"

export const dynamic = "force-dynamic"

export default async function CustomerPlaceOrderPage() {
  const { user, role } = await getAuthedUser()
  if (!user || role !== "customer") notFound()

  const settings = await getAppSettings()
  if (!settings.customer_can_place_orders) {
    redirect("/customer/orders")
  }

  const supabase = await createClient()

  const { data: customer } = await supabase
    .from("customers")
    .select("id, full_name, company_name, phone, status")
    .eq("id", user.id)
    .single()

  if (!customer || customer.status !== "active") {
    redirect("/customer")
  }

  const [productsRes, categoriesRes, addressesRes, gatewaysRes] =
    await Promise.all([
      supabase
        .from("products")
        .select(
          "id, name, sell_price, unit, status, category_id, categories(name), brands(name), stock(quantity_available)"
        )
        .eq("status", "active")
        .order("name"),
      supabase.from("categories").select("id, name").order("name"),
      supabase
        .from("customer_addresses")
        .select("*")
        .eq("customer_id", user.id)
        .order("label"),
      supabase
        .from("payment_gateways")
        .select("*")
        .eq("status", "active")
        .order("sort_order"),
    ])

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
      avgCost: null,
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
        description="Build your order — it will be sent for approval before fulfillment."
      />
      <CustomerPlaceOrderWizard
        customerId={customer.id}
        customerName={customer.full_name}
        companyName={customer.company_name}
        phone={customer.phone}
        products={products}
        categories={categories}
        addresses={addresses}
        gateways={gateways}
        requireAdvancePayment={settings.require_advance_payment}
        minAdvancePercent={settings.min_advance_payment_percent}
      />
    </div>
  )
}
