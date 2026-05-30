import SettingPage from "@/modules/setting/presentation/ui/pages/list";
import { auth } from "@/shared/lib/auth";
import { redirect } from "next/navigation";
import { can } from "@/modules/auth/domain/policies";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const currentUser = { id: session.user.id, role: session.user.role };

  // RBAC validation
  if (!can(currentUser, "settings:read")) {
    redirect("/d");
  }

  return <SettingPage />;
}
