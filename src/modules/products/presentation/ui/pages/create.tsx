import { ProductForm } from "../components/form"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function ProductCreatePage() {
  return (
    <div className="p-8 space-y-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/products">← Back</Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Create Product</h1>
      </div>
      
      <div className="bg-white p-6 border rounded-lg shadow-sm">
        <ProductForm />
      </div>
    </div>
  )
}
