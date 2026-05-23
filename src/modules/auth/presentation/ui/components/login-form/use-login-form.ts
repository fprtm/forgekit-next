import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { loginSchema, LoginInput } from "../../../../domain/validations";

export function useLoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginInput) {
    setIsLoading(true);
    try {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (res?.error) {
        toast.error("Invalid credentials, please try again.");
      } else {
        toast.success("Welcome back! Logging in...");
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      toast.error("Google sign in failed.");
      console.error(error);
    } finally {
      setIsGoogleLoading(false);
    }
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    handleGoogleSignIn,
    isLoading,
    isGoogleLoading,
  };
}
