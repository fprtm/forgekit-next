import { UserProfilePage } from "@/modules/users/presentation/ui/pages/profile"
import { auth } from "@/shared/lib/auth"
import { DrizzleUserRepository } from "@/modules/users/infrastructure/database/repositories/drizzle-user.repository"
import { redirect } from "next/navigation"

export default async function ProfileRoute() {
  const session = await auth()
  if (!session?.user?.email) {
    redirect("/login")
  }

  const userRepo = new DrizzleUserRepository()
  const currentUser = await userRepo.findByEmail(session.user.email)
  if (!currentUser) {
    redirect("/login")
  }

  return <UserProfilePage user={currentUser} />
}
