import { ProductTable } from "../components/table"
import { Button } from "@/shared/components/ui/button"
import Link from "next/link"
import { ProductEntity } from "../../../domain/entities/product.entity"
import { AuthUser } from "@/modules/auth/domain/types"
import { PermissionGate } from "@/modules/auth/presentation/ui/components/permission-gate"
import Wrapper from "@/shared/components/layout/wrapper"
import { routes } from "@/shared/config/routes"
import { Card, CardContent } from "@/shared/components/ui/card"

export function ProductListPage({
  products,
  currentUser,
}: {
  products: ProductEntity[]
  currentUser: AuthUser | null | undefined
}) {
  return (
    <Wrapper>
      <div className="page-shell">
        <div className="page-header">
          <h1 className="page-title">Products</h1>
          <PermissionGate action="products:create" user={currentUser}>
            <Button asChild>
              <Link href={routes.dashboard.products.create} data-testid="create-product-button">Create Product</Link>
            </Button>
          </PermissionGate>
        </div>

        <Card>
          <CardContent>
            <ProductTable data={products} currentUser={currentUser} />
          </CardContent>
        </Card>
      </div>
    </Wrapper>
  )
}
