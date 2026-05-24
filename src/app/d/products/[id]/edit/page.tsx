import { ProductEditPage } from "@/modules/products/presentation/ui/pages/edit"
import { ProductsService } from "@/modules/products/application/services"
import { notFound } from "next/navigation"
import { ProductEntity } from "@/modules/products/domain/types"

export default async function EditProductRoute({ params }: { params: Promise<{ id: string }> }) {
  let product: ProductEntity | null = null;
  try {
    const { id } = await params;
    product = await ProductsService.getProductById(id)
  } catch (error) {
    console.error("Error fetching product:", error);
    return notFound()
  }

  if (!product) return notFound()
  return <ProductEditPage product={product} />
}
