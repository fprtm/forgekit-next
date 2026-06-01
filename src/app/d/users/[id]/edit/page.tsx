import { UserEditPage } from "@/modules/users/presentation/ui/pages/edit"
import { DrizzleUserRepository } from "@/modules/users/infrastructure/database/repositories/drizzle-user.repository"
import { GetUserProfileHandler } from "@/modules/users/application/use-cases/get-user-profile/get-user-profile.handler"
import { notFound, redirect } from "next/navigation"
import { UserEntity } from "@/modules/users/domain/entities/user.entity"
import { auth } from "@/shared/lib/auth"
import { can } from "@/modules/auth/domain/policies"

const userRepo = new DrizzleUserRepository()
const getUserProfileUC = new GetUserProfileHandler(userRepo)

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
    redirect("/d")
  }

  let user: UserEntity | null = null;
  try {
    const { id } = await params;
    user = await getUserProfileUC.execute({ id, currentUser: session.user })
  } catch (error) {
    console.error("Error fetching user:", error);
    return notFound()
  }

  if (!user) return notFound()
  const { profile } = await searchParams
  const isProfile = profile === "true"
  const backHref = isProfile
    ? `/d/users/${user.role === "admin" || user.role === "super_admin" ? "admins" : "users"}`
    : "/d/users/accounts"
  return <UserEditPage user={user} isProfile={isProfile} backHref={backHref} />
}
