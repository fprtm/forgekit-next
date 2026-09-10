"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { useForgotPasswordForm } from "./use-forgot-password-form";
import { routes } from "@/shared/config/routes";

export function ForgotPasswordForm() {
  const { form, onSubmit, isLoading, submitted } = useForgotPasswordForm();

  if (submitted) {
    return (
      <div className="space-y-5 text-center" data-testid="forgot-password-success">
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          If an account with that email exists, we&apos;ve sent a password reset link to it. Check your inbox (and the
          server console in dev).
        </p>
        <Link
          href={routes.auth.login}
          data-testid="forgot-password-to-login-link"
          className="inline-block font-medium text-sm text-zinc-900 hover:underline dark:text-white"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="form-stack">
      <Form {...form}>
        <form method="post" onSubmit={onSubmit} className="form-stack" data-testid="forgot-password-form">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-700 dark:text-zinc-300 text-sm font-medium">Email Address</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    disabled={isLoading}
                    data-testid="forgot-password-email-input"
                    className="h-11 rounded-2xl border-zinc-200/80 bg-zinc-50/50 focus-visible:ring-zinc-900 focus-visible:ring-offset-0 dark:border-zinc-800 dark:bg-zinc-900/30 dark:focus-visible:ring-white transition-all"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isLoading}
            data-testid="forgot-password-submit-button"
            className="w-full h-11 rounded-2xl bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.98] transition-all duration-200 dark:bg-white dark:text-black dark:hover:bg-zinc-100 shadow-md font-semibold mt-2"
          >
            {isLoading ? (
              <div className="icon-sm animate-spin rounded-full border-2 border-white border-t-transparent dark:border-black" />
            ) : (
              "Send Reset Link"
            )}
          </Button>

          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            Remembered your password?{" "}
            <Link
              href={routes.auth.login}
              data-testid="forgot-password-to-login-link"
              className="font-medium text-zinc-900 hover:underline dark:text-white"
            >
              Sign in
            </Link>
          </p>
        </form>
      </Form>
    </div>
  );
}
