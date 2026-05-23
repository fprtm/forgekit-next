import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { updateUserSchema, UpdateUserInput } from "../../../../application/validations"
import { updateUser } from "../../actions"
import { UserEntity } from "../../../../domain/types"

export function useUserForm(initialData?: UserEntity) {
  const router = useRouter()

  const form = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: initialData?.name || "",
      role: initialData?.role || "user",
    },
  })

  async function onSubmit(data: UpdateUserInput) {
    const res = await updateUser(data, initialData?.id)
    if (res.success) {
      toast.success("User updated successfully!")
      router.push("/users")
    } else {
      toast.error(res.error)
    }
  }

  return {
    form,
    onSubmit,
  }
}
