export const dynamic = "force-dynamic"

import { AccountListPage } from "@/modules/users/presentation/ui/pages/account-list"
import { DrizzleUserRepository } from "@/modules/users/infrastructure/database/repositories/drizzle-user.repository"
import { GetUsersHandler } from "@/modules/users/application/use-cases/get-users/get-users.handler"
import { auth } from "@/shared/lib/auth"
import { redirect } from "next/navigation"
import { can } from "@/modules/auth/domain/policies"

const userRepo = new DrizzleUserRepository()
const getUsersUC = new GetUsersHandler(userRepo)

export default async function AccountsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  if (!can(session.user, "users:read")) {
    redirect("/d")
  }

  const users = await getUsersUC.execute({ currentUser: session.user })
  
  return <AccountListPage users={users} currentUser={session.user} />
}
