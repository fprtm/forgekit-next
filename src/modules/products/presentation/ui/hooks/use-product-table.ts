import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { deleteProductAction } from "../../http/actions/product.actions"

export function useProductTable() {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = React.useState(false)

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this product?")) {
      setIsDeleting(true)
      const res = await deleteProductAction(id)
      if (res.success) {
        toast.success("Product deleted successfully")
        router.refresh()
      } else {
        toast.error(res.error)
      }
      setIsDeleting(false)
    }
  }

  return {
    isDeleting,
    handleDelete,
  }
}
