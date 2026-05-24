export const dynamic = "force-dynamic"

import { ProductListPage } from "@/modules/products/presentation/ui/pages/list"
import { ProductsService } from "@/modules/products/application/services"
import { auth } from "@/lib/auth"

export default async function ProductsPage() {
  const session = await auth()
  const products = await ProductsService.getProducts("", 100, session?.user)
  
  return <ProductListPage products={products} currentUser={session?.user} />
}
