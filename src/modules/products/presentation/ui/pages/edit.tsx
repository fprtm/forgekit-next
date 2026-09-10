import { ProductForm } from "../components/form"
import { Button } from "@/shared/components/ui/button"
import Link from "next/link"
import { ProductEntity } from "../../../domain/entities/product.entity"
import Wrapper from "@/shared/components/layout/wrapper"
import { routes } from "@/shared/config/routes"
import { Card, CardContent } from "@/shared/components/ui/card"

export function ProductEditPage({ product }: { product: ProductEntity }) {
  return (
    <Wrapper>
      <div className="page-shell">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={routes.dashboard.products.list} data-testid="back-button">← Back</Link>
          </Button>
          <h1 className="page-title">Edit Product</h1>
        </div>

        <Card>
          <CardContent>
            <ProductForm initialData={product} />
          </CardContent>
        </Card>
      </div>
    </Wrapper>
  )
}
