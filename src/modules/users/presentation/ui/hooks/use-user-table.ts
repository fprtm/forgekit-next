import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { deleteUserAction } from "../../http/actions/user.actions"

export function useUserTable() {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = React.useState(false)

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this user?")) {
      setIsDeleting(true)
      const res = await deleteUserAction(id)
      if (res.success) {
        toast.success("User deleted successfully")
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
