import { ProductForm } from "../components/form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ProductEntity } from "../../../domain/types"
import Wrapper from "@/components/layout/wrapper"

export function ProductEditPage({ product }: { product: ProductEntity }) {
  return (
    <Wrapper>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/products">← Back</Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
      </div>
      
      <div className="bg-white p-6 border rounded-lg shadow-sm">
        <ProductForm initialData={product} />
      </div>
    </Wrapper>
  )
}
