export const dynamic = "force-dynamic"

import { ProductListPage } from "@/modules/products/presentation/ui/pages/list"
import { getProductsAction } from "@/modules/products/presentation/http/actions/product.actions"
import { auth } from "@/shared/lib/auth"

export default async function ProductsPage() {
  const session = await auth()
  const result = await getProductsAction("", 100)
  const products = result.success ? result.data : []

  return <ProductListPage products={products} currentUser={session?.user} />
}
