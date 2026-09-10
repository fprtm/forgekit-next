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
import { useResetPasswordForm } from "./use-reset-password-form";
import { routes } from "@/shared/config/routes";

export function ResetPasswordForm({ token }: { token: string }) {
  const { form, onSubmit, isLoading } = useResetPasswordForm(token);

  if (!token) {
    return (
      <div className="space-y-5 text-center" data-testid="reset-password-invalid-token">
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          This password reset link is missing or invalid. Please request a new one.
        </p>
        <Link
          href={routes.auth.forgotPassword}
          data-testid="reset-password-to-forgot-password-link"
          className="inline-block font-medium text-sm text-zinc-900 hover:underline dark:text-white"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="form-stack">
      <Form {...form}>
        <form method="post" onSubmit={onSubmit} className="form-stack" data-testid="reset-password-form">
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-700 dark:text-zinc-300 text-sm font-medium">New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    disabled={isLoading}
                    data-testid="new-password-input"
                    className="h-11 rounded-2xl border-zinc-200/80 bg-zinc-50/50 focus-visible:ring-zinc-900 focus-visible:ring-offset-0 dark:border-zinc-800 dark:bg-zinc-900/30 dark:focus-visible:ring-white transition-all"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmNewPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-700 dark:text-zinc-300 text-sm font-medium">Confirm New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    disabled={isLoading}
                    data-testid="confirm-new-password-input"
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
            data-testid="reset-password-submit-button"
            className="w-full h-11 rounded-2xl bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.98] transition-all duration-200 dark:bg-white dark:text-black dark:hover:bg-zinc-100 shadow-md font-semibold mt-2"
          >
            {isLoading ? (
              <div className="icon-sm animate-spin rounded-full border-2 border-white border-t-transparent dark:border-black" />
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
