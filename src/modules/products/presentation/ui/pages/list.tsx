import * as React from "react"
import { ProductTable } from "../components/table"
import { ProductForm } from "../components/form"

export function ProductListPage() {
  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Products Management</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 bg-white p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Add Product</h2>
          <ProductForm />
        </div>
        
        <div className="md:col-span-2 bg-white p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Products List</h2>
          <ProductTable />
        </div>
      </div>
    </div>
  )
}
