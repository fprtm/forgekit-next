import { UserProfilePage } from "@/modules/users/presentation/ui/pages/profile"
import { auth } from "@/shared/lib/auth"
import { getUserProfileAction } from "@/modules/users/presentation/http/actions/user.actions"
import { redirect } from "next/navigation"

export default async function ProfileRoute() {
  const session = await auth()
  if (!session?.user?.email) {
    redirect("/login")
  }

  const result = await getUserProfileAction()
  if (!result.success || !result.data) {
    redirect("/login")
  }

  return <UserProfilePage user={result.data} />
}
