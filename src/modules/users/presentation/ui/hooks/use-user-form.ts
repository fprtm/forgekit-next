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
  bio?: string
  phoneNumber?: string
  dateOfBirth?: string
  gender?: string
  preferredPronouns?: string
  address?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
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
      bio: initialData?.profile?.bio || "",
      phoneNumber: initialData?.profile?.phoneNumber || "",
      dateOfBirth: initialData?.profile?.dateOfBirth || "",
      gender: initialData?.profile?.gender || "",
      preferredPronouns: initialData?.profile?.preferredPronouns || "",
      address: initialData?.profile?.address || "",
      city: initialData?.profile?.city || "",
      state: initialData?.profile?.state || "",
      country: initialData?.profile?.country || "",
      postalCode: initialData?.profile?.postalCode || "",
    },
  })

  async function onSubmit(data: UserFormValues) {
    const res = isEditing && initialData
      ? await updateUser({
          name: data.name,
          role: data.role,
          bio: data.bio,
          phoneNumber: data.phoneNumber,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          preferredPronouns: data.preferredPronouns,
          address: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
          postalCode: data.postalCode,
        }, initialData.id)
      : await createUserAction({ name: data.name, email: data.email!, role: data.role })

    if (res.success) {
      toast.success(isEditing ? "User updated successfully!" : "User created successfully!")

      const redirectMap: Record<UserRole, string> = {
        super_admin: "/d/users/admins",
        admin: "/d/users/admins",
        user: "/d/users/users",
      }

      const redirectPath = redirectMap[data.role]
      router.push(redirectPath)
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
