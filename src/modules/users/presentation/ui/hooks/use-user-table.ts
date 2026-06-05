import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { deleteUserAction, resetPasswordAction } from "../../http/actions/user.actions"

export function useUserTable() {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [isResetting, setIsResetting] = React.useState(false)
  const [resetResult, setResetResult] = React.useState<{ email: string; newPassword: string } | null>(null)

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

  async function handleResetPassword(userId: string) {
    setIsResetting(true)
    const res = await resetPasswordAction({ userId })
    if (res.success) {
      setResetResult(res.data)
    } else {
      toast.error(res.error)
    }
    setIsResetting(false)
  }

  function closeResetResult() {
    setResetResult(null)
    router.refresh()
  }

  return {
    isDeleting,
    handleDelete,
    isResetting,
    resetResult,
    handleResetPassword,
    closeResetResult,
  }
}
