import { ProductListPage } from "@/modules/products/presentation/ui/pages/list"
import { ProductsService } from "@/modules/products/application/services"

export default async function ProductsPage() {
  const products = await ProductsService.getProducts("", 100)
  return <ProductListPage products={products} />
}
