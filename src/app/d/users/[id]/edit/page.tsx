import { UserEditPage } from "@/modules/users/presentation/ui/pages/edit"
import { UsersService } from "@/modules/users/application/services"
import { notFound } from "next/navigation"

export default async function EditUserRoute({ params }: { params: Promise<{ id: string }> }) {
  let user;
  try {
    const { id } = await params;
    user = await UsersService.getUserProfile(id)
  } catch (error) {
    return notFound()
  }

  if (!user) return notFound()
  return <UserEditPage user={user} />
}
