export const dynamic = "force-dynamic"

import { UserListPage } from "@/modules/users/presentation/ui/pages/list"
import { UsersService } from "@/modules/users/application/services"

export default async function UsersPage() {
  const users = await UsersService.getUsers()
  return <UserListPage users={users} />
}
