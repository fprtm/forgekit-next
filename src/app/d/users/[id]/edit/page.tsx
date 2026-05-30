import { UserEditPage } from "@/modules/users/presentation/ui/pages/edit"
import { DrizzleUserRepository } from "@/modules/users/infrastructure/database/repositories/drizzle-user.repository"
import { GetUserProfileHandler } from "@/modules/users/application/use-cases/get-user-profile/get-user-profile.handler"
import { notFound } from "next/navigation"
import { UserEntity } from "@/modules/users/domain/entities/user.entity"

const userRepo = new DrizzleUserRepository()
const getUserProfileUC = new GetUserProfileHandler(userRepo)

export default async function EditUserRoute({ params }: { params: Promise<{ id: string }> }) {
  let user: UserEntity | null = null;
  try {
    const { id } = await params;
    user = await getUserProfileUC.execute({ id })
  } catch (error) {
    console.error("Error fetching user:", error);
    return notFound()
  }

  if (!user) return notFound()
  return <UserEditPage user={user} />
}
