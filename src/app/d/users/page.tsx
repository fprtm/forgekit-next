export const dynamic = "force-dynamic"

import { UserListPage } from "@/modules/users/presentation/ui/pages/list"
import { UsersService } from "@/modules/users/application/services"
import { auth } from "@/lib/auth"

export default async function UsersPage() {
  const session = await auth()
  const users = await UsersService.getUsers(session?.user)
  
  return <UserListPage users={users} currentUser={session?.user} />
}
