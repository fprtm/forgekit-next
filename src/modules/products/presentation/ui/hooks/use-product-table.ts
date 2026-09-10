import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { deleteProductAction } from "../../http/actions/product.actions"

export function useProductTable() {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [pendingDeleteId, setPendingDeleteId] = React.useState<string | null>(null)

  function openConfirm(id: string) {
    setPendingDeleteId(id)
  }

  function cancelDelete() {
    setPendingDeleteId(null)
  }

  async function confirmDelete() {
    if (!pendingDeleteId) return
    const id = pendingDeleteId
    setPendingDeleteId(null)
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

  return {
    isDeleting,
    pendingDeleteId,
    openConfirm,
    cancelDelete,
    confirmDelete,
  }
}
