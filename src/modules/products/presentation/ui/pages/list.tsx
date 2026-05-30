import { ProductTable } from "../components/table"
import { Button } from "@/shared/components/ui/button"
import Link from "next/link"
import { ProductEntity } from "../../../domain/entities/product.entity"
import { AuthUser } from "@/modules/auth/domain/types"
import { PermissionGate } from "@/modules/auth/presentation/ui/components/permission-gate"
import Wrapper from "@/shared/components/layout/wrapper"

export function ProductListPage({
  products,
  currentUser,
}: {
  products: ProductEntity[]
  currentUser: AuthUser | null | undefined
}) {
  return (
    <Wrapper>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <PermissionGate action="products:create" user={currentUser}>
          <Button asChild>
            <Link href="/d/products/create">Create Product</Link>
          </Button>
        </PermissionGate>
      </div>
      
      <div className="bg-white p-6 border rounded shadow-sm">
        <ProductTable data={products} currentUser={currentUser} />
      </div>
    </Wrapper>
  )
}
