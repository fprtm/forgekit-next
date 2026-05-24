import * as React from "react"
import { ProductTable } from "../components/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ProductEntity } from "../../../domain/types"
import { AuthUser } from "@/modules/auth/domain/types"
import { PermissionGate } from "@/modules/auth/presentation/ui/components/permission-gate"

export function ProductListPage({
  products,
  currentUser,
}: {
  products: ProductEntity[]
  currentUser: AuthUser | null | undefined
}) {
  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <PermissionGate action="products:create" user={currentUser}>
          <Button asChild>
            <Link href="/products/create">Create Product</Link>
          </Button>
        </PermissionGate>
      </div>
      
      <div className="bg-white p-6 border rounded-lg shadow-sm">
        <ProductTable data={products} currentUser={currentUser} />
      </div>
    </div>
  )
}
