"use client";

import React from "react";
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
import { useLoginForm } from "./use-login-form";
import { env } from "@/shared/config/env";

export function LoginForm() {
  const { form, onSubmit, handleGoogleSignIn, isLoading, isGoogleLoading } = useLoginForm();
  const showOAuth = env.NEXT_PUBLIC_ENABLE_OAUTH === "true";

  return (
    <div className="space-y-5">
      {showOAuth && (
        <>
          {/* Continue with Google */}
          <Button
            type="button"
            variant="outline"
            disabled={isLoading || isGoogleLoading}
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 h-11 rounded-2xl border-zinc-200/80 hover:bg-zinc-100 hover:text-zinc-900 active:scale-[0.98] transition-all duration-200 dark:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:text-white shadow-sm font-medium"
          >
            {isGoogleLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-transparent" />
            ) : (
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </Button>

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-zinc-200/60 dark:border-zinc-800/60"></div>
            <span className="flex-shrink mx-4 text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-semibold">
              or use email
            </span>
            <div className="flex-grow border-t border-zinc-200/60 dark:border-zinc-800/60"></div>
          </div>
        </>
      )}

      {/* Credentials Form */}
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-4">
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
                    disabled={isLoading || isGoogleLoading}
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="text-zinc-700 dark:text-zinc-300 text-sm font-medium">Password</FormLabel>
                  <a href="#" className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    Forgot password?
                  </a>
                </div>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    disabled={isLoading || isGoogleLoading}
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
            disabled={isLoading || isGoogleLoading}
            className="w-full h-11 rounded-2xl bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.98] transition-all duration-200 dark:bg-white dark:text-black dark:hover:bg-zinc-100 shadow-md font-semibold mt-2"
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-black" />
            ) : (
              "Sign In with Email"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
