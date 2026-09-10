import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { deleteUserAction, resetPasswordAction } from "../../http/actions/user.actions"

export function useUserTable() {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [isResetting, setIsResetting] = React.useState(false)
  const [resetResult, setResetResult] = React.useState<{ email: string; newPassword: string } | null>(null)
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
    const res = await deleteUserAction(id)
    if (res.success) {
      toast.success("User deleted successfully")
      router.refresh()
    } else {
      toast.error(res.error)
    }
    setIsDeleting(false)
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
    pendingDeleteId,
    openConfirm,
    cancelDelete,
    confirmDelete,
    isResetting,
    resetResult,
    handleResetPassword,
    closeResetResult,
  }
}
