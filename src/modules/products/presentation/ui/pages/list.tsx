import * as React from "react"
import { ProductTable } from "../components/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ProductEntity } from "../../../domain/types"

export function ProductListPage({ products }: { products: ProductEntity[] }) {
  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <Button asChild>
          <Link href="/products/create">Create Product</Link>
        </Button>
      </div>
      
      <div className="bg-white p-6 border rounded-lg shadow-sm">
        <ProductTable data={products} />
      </div>
    </div>
  )
}
