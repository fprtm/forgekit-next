export const dynamic = "force-dynamic"

import { UserListPage } from "@/modules/users/presentation/ui/pages/list"
import { DrizzleUserRepository } from "@/modules/users/infrastructure/database/repositories/drizzle-user.repository"
import { GetUsersHandler } from "@/modules/users/application/use-cases/get-users/get-users.handler"
import { auth } from "@/shared/lib/auth"

const userRepo = new DrizzleUserRepository()
const getUsersUC = new GetUsersHandler(userRepo)

export default async function UsersPage() {
  const session = await auth()
  const users = await getUsersUC.execute({ currentUser: session?.user })
  
  return <UserListPage users={users} currentUser={session?.user} />
}
