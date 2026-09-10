import { UserEditPage } from "@/modules/users/presentation/ui/pages/edit"
import { getUserAction } from "@/modules/users/presentation/http/actions/user.actions"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/shared/lib/auth"
import { can } from "@/modules/auth/domain/policies"
import { routes } from "@/shared/config/routes"

export default async function EditUserRoute({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ profile?: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  if (!can(session.user, "users:read")) {
    redirect(routes.dashboard.root)
  }

  const { id } = await params
  const result = await getUserAction(id)

  if (!result.success || !result.data) return notFound()

  const user = result.data
  const { profile } = await searchParams
  const isProfile = profile === "true"
  const backHref = isProfile
    ? (user.role === "admin" || user.role === "super_admin" ? routes.dashboard.users.admins : routes.dashboard.users.users)
    : routes.dashboard.users.accounts
  return <UserEditPage user={user} isProfile={isProfile} backHref={backHref} />
}
