export const dynamic = "force-dynamic"

import { AccountListPage } from "@/modules/users/presentation/ui/pages/account-list"
import { getUsersAction } from "@/modules/users/presentation/http/actions/user.actions"
import { auth } from "@/shared/lib/auth"
import { redirect } from "next/navigation"
import { can } from "@/modules/auth/domain/policies"
import { routes } from "@/shared/config/routes"

export default async function AccountsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  if (!can(session.user, "users:read")) {
    redirect(routes.dashboard.root)
  }

  const result = await getUsersAction({ role: "all" })
  const users = result.success ? result.data : []

  return <AccountListPage users={users} currentUser={session.user} />
}
