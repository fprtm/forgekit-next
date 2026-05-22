import { UserEditPage } from "@/modules/users/presentation/ui/pages/edit"
import { UsersService } from "@/modules/users/application/services"
import { notFound } from "next/navigation"

export default async function EditUserRoute({ params }: { params: { id: string } }) {
  let user;
  try {
    user = await UsersService.getUserProfile(params.id)
  } catch (error) {
    return notFound()
  }

  if (!user) return notFound()
  return <UserEditPage user={user} />
}
