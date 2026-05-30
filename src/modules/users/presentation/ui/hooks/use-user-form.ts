import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createUserSchema, updateUserSchema } from "../../../application/validations"
import { updateUser, createUserAction } from "../../http/actions/user.actions"
import { UserEntity, UserRole } from "../../../domain/entities/user.entity"

export interface UserFormValues {
  name: string
  email?: string
  role: UserRole
}

export function useUserForm(initialData?: UserEntity) {
  const router = useRouter()
  const isEditing = !!initialData

  const form = useForm<UserFormValues>({
    resolver: zodResolver(isEditing ? updateUserSchema : createUserSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      role: initialData?.role || "user",
    },
  })

  async function onSubmit(data: UserFormValues) {
    const res = isEditing && initialData
      ? await updateUser({ name: data.name, role: data.role }, initialData.id)
      : await createUserAction({ name: data.name, email: data.email!, role: data.role })

    if (res.success) {
      toast.success(isEditing ? "User updated successfully!" : "User created successfully!")
      router.push("/users")
    } else {
      toast.error(res.error)
    }
  }

  return {
    form,
    onSubmit,
    isEditing,
  }
}
