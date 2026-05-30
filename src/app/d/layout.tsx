import { redirect } from "next/navigation"
import { auth } from "@/shared/lib/auth"
import DashboardLayout from "@/shared/components/layout/dashboard.layout"

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/login")

  return <DashboardLayout session={session}>{children}</DashboardLayout>
}