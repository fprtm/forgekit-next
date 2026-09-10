export const dynamic = "force-dynamic"

import { UserRoleListPage } from "@/modules/users/presentation/ui/pages/user-list"
import { getUsersAction } from "@/modules/users/presentation/http/actions/user.actions"
import { auth } from "@/shared/lib/auth"
import { redirect } from "next/navigation"
import { can } from "@/modules/auth/domain/policies"
import { routes } from "@/shared/config/routes"

export default async function UsersByRolePage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  if (!can(session.user, "users:read")) {
    redirect(routes.dashboard.root)
  }

  const result = await getUsersAction({ role: "user" })
  const filteredUsers = result.success ? result.data : []

  return <UserRoleListPage users={filteredUsers} currentUser={session.user} />
}
