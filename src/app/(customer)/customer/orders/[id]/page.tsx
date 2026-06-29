import { notFound } from "next/navigation"

import { OrderDetail } from "./_components/order-detail"

export const dynamic = "force-dynamic"

export default async function CustomerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <OrderDetail orderId={id} />
}
