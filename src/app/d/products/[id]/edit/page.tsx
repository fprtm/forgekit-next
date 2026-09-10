import { ProductEditPage } from "@/modules/products/presentation/ui/pages/edit"
import { getProductAction } from "@/modules/products/presentation/http/actions/product.actions"
import { notFound } from "next/navigation"

export default async function EditProductRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await getProductAction(id)

  if (!result.success || !result.data) return notFound()

  return <ProductEditPage product={result.data} />
}
