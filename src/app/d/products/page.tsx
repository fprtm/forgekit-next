export const dynamic = "force-dynamic"

import { ProductListPage } from "@/modules/products/presentation/ui/pages/list"
import { DrizzleProductRepository } from "@/modules/products/infrastructure/database/repositories/drizzle-product.repository"
import { GetProductsHandler } from "@/modules/products/application/use-cases/get-products/get-products.handler"
import { auth } from "@/shared/lib/auth"

const productRepo = new DrizzleProductRepository()
const getProductsUC = new GetProductsHandler(productRepo)

export default async function ProductsPage() {
  const session = await auth()
  const products = await getProductsUC.execute({ search: "", limit: 100, user: session?.user })
  
  return <ProductListPage products={products} currentUser={session?.user} />
}
