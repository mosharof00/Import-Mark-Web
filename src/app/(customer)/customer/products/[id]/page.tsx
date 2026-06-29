import { ProductDetail } from "./_components/product-detail"

export const dynamic = "force-dynamic"

export default async function CustomerProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ProductDetail productId={id} />
}
