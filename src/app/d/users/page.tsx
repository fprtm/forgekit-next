import { redirect } from "next/navigation"
import { routes } from "@/shared/config/routes"

export default function UsersPage() {
  redirect(routes.dashboard.users.accounts)
}
