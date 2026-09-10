import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { toast } from "sonner"
import { changePasswordSchema, ChangePasswordInput } from "../../../application/validations"
import { changePasswordAction } from "../../http/actions/user.actions"

export function useChangePasswordForm() {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  })

  async function onSubmit(data: ChangePasswordInput) {
    setIsLoading(true)
    try {
      const result = await changePasswordAction(data.currentPassword, data.newPassword)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success("Password changed successfully.")
      form.reset()
    } catch (error) {
      toast.error("An unexpected error occurred.")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isLoading,
  }
}
