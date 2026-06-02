import { NotificationSettingsPage } from "@/modules/notifications/presentation/ui/pages/notification-settings-page"
import { auth } from "@/shared/lib/auth"
import { redirect } from "next/navigation"

export default async function NotificationsSettingsRoute() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  return <NotificationSettingsPage />
}
