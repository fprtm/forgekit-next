import { ProductEditPage } from "@/modules/products/presentation/ui/pages/edit"
import { ProductsService } from "@/modules/products/application/services"
import { notFound } from "next/navigation"

export default async function EditProductRoute({ params }: { params: { id: string } }) {
  let product;
  try {
    product = await ProductsService.getProductById(params.id)
  } catch (error) {
    return notFound()
  }

  if (!product) return notFound()
  return <ProductEditPage product={product} />
}
