import { ProductForm } from "../components/form"
import { Button } from "@/shared/components/ui/button"
import Link from "next/link"
import Wrapper from "@/shared/components/layout/wrapper"

export function ProductCreatePage() {
  return (
    <Wrapper>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/d/products">← Back</Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Create Product</h1>
      </div>
      
      <div className="bg-white p-6 border rounded-lg shadow-sm">
        <ProductForm />
      </div>
    </Wrapper>
  )
}
