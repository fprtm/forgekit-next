export const dynamic = "force-dynamic"

import { AdminListPage } from "@/modules/users/presentation/ui/pages/admin-list"
import { DrizzleUserRepository } from "@/modules/users/infrastructure/database/repositories/drizzle-user.repository"
import { GetUsersHandler } from "@/modules/users/application/use-cases/get-users/get-users.handler"
import { auth } from "@/shared/lib/auth"
import { redirect } from "next/navigation"
import { can } from "@/modules/auth/domain/policies"

const userRepo = new DrizzleUserRepository()
const getUsersUC = new GetUsersHandler(userRepo)

export default async function AdminsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  if (!can(session.user, "users:read")) {
    redirect("/d")
  }

  const users = await getUsersUC.execute({ currentUser: session.user })
  const admins = users.filter((u) => u.role === "admin" || u.role === "super_admin")
  
  return <AdminListPage users={admins} currentUser={session.user} />
}
