export const dynamic = "force-dynamic"

import { AdminListPage } from "@/modules/users/presentation/ui/pages/admin-list"
import { getUsersAction } from "@/modules/users/presentation/http/actions/user.actions"
import { auth } from "@/shared/lib/auth"
import { redirect } from "next/navigation"
import { can } from "@/modules/auth/domain/policies"
import { routes } from "@/shared/config/routes"

export default async function AdminsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  if (!can(session.user, "users:read")) {
    redirect(routes.dashboard.root)
  }

  const result = await getUsersAction({ role: "admin" })
  const admins = result.success ? result.data : []

  return <AdminListPage users={admins} currentUser={session.user} />
}
