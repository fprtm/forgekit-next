"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { LoginForm } from "../components/login-form";
import { env } from "@/shared/config/env";

export function LoginPage() {
  const isDemoMode = env.NEXT_PUBLIC_DEMO_MODE === "true";

  return (
    <Card className="w-full border border-zinc-200/50 bg-white/70 backdrop-blur-xl shadow-2xl dark:border-zinc-800/40 dark:bg-zinc-950/75 rounded-3xl overflow-hidden transition-all duration-300">
      <CardHeader className="space-y-2 text-center pt-8 pb-4 px-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-black shadow-lg shadow-zinc-900/10 dark:shadow-white/10 mb-2 transition-transform duration-300 hover:scale-105">
          <span className="text-xl font-bold font-sans">F</span>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Welcome back
        </CardTitle>
        <CardDescription className="text-zinc-500 dark:text-zinc-400 text-sm">
          Enter your details to access your dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-8 space-y-5">
        {isDemoMode && (
          <div
            className="rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
            data-testid="demo-credentials-hint"
          >
            <p className="font-semibold mb-1">This is a public demo — sign-up is disabled.</p>
            <p>
              Log in with{" "}
              <code className="font-mono font-semibold">superadmin@forgekit.test</code> /{" "}
              <code className="font-mono font-semibold">00superadmin@forgekit.test</code>
            </p>
          </div>
        )}
        <LoginForm />
      </CardContent>
    </Card>
  );
}
