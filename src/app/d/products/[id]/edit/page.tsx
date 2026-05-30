import { ProductEditPage } from "@/modules/products/presentation/ui/pages/edit"
import { DrizzleProductRepository } from "@/modules/products/infrastructure/database/repositories/drizzle-product.repository"
import { GetProductHandler } from "@/modules/products/application/use-cases/get-product/get-product.handler"
import { notFound } from "next/navigation"
import { ProductEntity } from "@/modules/products/domain/entities/product.entity"

const productRepo = new DrizzleProductRepository()
const getProductUC = new GetProductHandler(productRepo)

export default async function EditProductRoute({ params }: { params: Promise<{ id: string }> }) {
  let product: ProductEntity | null = null;
  try {
    const { id } = await params;
    product = await getProductUC.execute({ id })
  } catch (error) {
    console.error("Error fetching product:", error);
    return notFound()
  }

  if (!product) return notFound()
  return <ProductEditPage product={product} />
}
