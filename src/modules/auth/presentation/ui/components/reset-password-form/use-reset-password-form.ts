import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { resetPasswordSchema, ResetPasswordInput } from "../../../../domain/validations";
import { confirmPasswordResetAction } from "../../../http/actions/password-reset.actions";
import { routes } from "@/shared/config/routes";

export function useResetPasswordForm(token: string) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  async function onSubmit(data: ResetPasswordInput) {
    setIsLoading(true);
    try {
      const result = await confirmPasswordResetAction(token, data.newPassword);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Password reset successfully. Please sign in with your new password.");
      router.push(routes.auth.login);
    } catch (error) {
      toast.error("An unexpected error occurred.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isLoading,
  };
}
