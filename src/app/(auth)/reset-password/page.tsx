import { ResetPasswordPage } from "@/modules/auth/presentation/ui/pages/reset-password";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <ResetPasswordPage token={token ?? ""} />;
}
