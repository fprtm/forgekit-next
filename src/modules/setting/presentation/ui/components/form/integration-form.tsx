"use client";

import React, { useState } from "react";
import {
  KeyRound,
  Save,
  Loader2,
  RotateCcw,
  Link2,
  Smartphone,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/shared/components/ui/card";
import { useIntegrationForm } from "../../hooks/use-integration-form";

interface IntegrationFormProps {
  initialMidtransClientKey?: string;
  initialMidtransServerKey?: string;
  initialMidtransIsProduction?: boolean;
  initialFonnteApiToken?: string;
  initialFonnteDeviceId?: string;
}

export function IntegrationForm({
  initialMidtransClientKey = "",
  initialMidtransServerKey = "",
  initialMidtransIsProduction = false,
  initialFonnteApiToken = "",
  initialFonnteDeviceId = "",
}: IntegrationFormProps) {
  const { form, onSubmit, onReset, isResetting } = useIntegrationForm({
    initialMidtransClientKey,
    initialMidtransServerKey,
    initialMidtransIsProduction,
    initialFonnteApiToken,
    initialFonnteDeviceId,
  });
  const isSaving = form.formState.isSubmitting;
  const [showMidtransServerKey, setShowMidtransServerKey] = useState(false);
  const [showFonnteApiToken, setShowFonnteApiToken] = useState(false);

  return (
    <Form {...form}>
      <form method="post" onSubmit={form.handleSubmit(onSubmit)} data-testid="integration-form">
        <Card className="border border-zinc-200/80 dark:border-zinc-800/80 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Link2 className="icon-md text-zinc-500" />
              External API Integrations
            </CardTitle>
            <CardDescription>
              Configure authentication credentials for automated payments and
              real-time WhatsApp notifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="form-stack">
            {/* Section 1: Midtrans Gateway */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                Midtrans Payment Gateway
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="midtransClientKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        Client Key
                      </FormLabel>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-3.5 icon-sm text-zinc-400" />
                        <FormControl>
                          <Input
                            data-testid="midtrans-client-key-input"
                            type="text"
                            placeholder="SB-Mid-client-..."
                            className="pl-10 h-11 font-mono text-xs"
                            disabled={isSaving || isResetting}
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="midtransServerKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        Server Key
                      </FormLabel>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-3.5 icon-sm text-zinc-400" />
                        <FormControl>
                          <Input
                            data-testid="midtrans-server-key-input"
                            type={showMidtransServerKey ? "text" : "password"}
                            placeholder="SB-Mid-server-..."
                            className="pl-10 pr-10 h-11 font-mono text-xs"
                            disabled={isSaving || isResetting}
                            {...field}
                          />
                        </FormControl>
                        <button
                          type="button"
                          data-testid="toggle-midtrans-server-key-visibility"
                          onClick={() => setShowMidtransServerKey((prev) => !prev)}
                          className="absolute right-3 top-3.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                          tabIndex={-1}
                        >
                          {showMidtransServerKey ? (
                            <EyeOff className="icon-sm" />
                          ) : (
                            <Eye className="icon-sm" />
                          )}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="midtransIsProduction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      Gateway Environment
                    </FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "production")}
                      value={field.value ? "production" : "sandbox"}
                      disabled={isSaving || isResetting}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="midtrans-environment-select" className="w-full h-11">
                          <SelectValue placeholder="Select environment" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sandbox">
                          Sandbox Mode (Development & Testing)
                        </SelectItem>
                        <SelectItem value="production">
                          Production Mode (Live Operations & Active Charges)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="border-t border-zinc-100 dark:border-zinc-800 my-4" />

            {/* Section 2: Fonnte WhatsApp Notifications */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                Fonnte WhatsApp Notifications
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fonnteApiToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        API Token
                      </FormLabel>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-3.5 icon-sm text-zinc-400" />
                        <FormControl>
                          <Input
                            data-testid="fonnte-api-token-input"
                            type={showFonnteApiToken ? "text" : "password"}
                            placeholder="Your Fonnte Auth Token..."
                            className="pl-10 pr-10 h-11 font-mono text-xs"
                            disabled={isSaving || isResetting}
                            {...field}
                          />
                        </FormControl>
                        <button
                          type="button"
                          data-testid="toggle-fonnte-api-token-visibility"
                          onClick={() => setShowFonnteApiToken((prev) => !prev)}
                          className="absolute right-3 top-3.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                          tabIndex={-1}
                        >
                          {showFonnteApiToken ? (
                            <EyeOff className="icon-sm" />
                          ) : (
                            <Eye className="icon-sm" />
                          )}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fonnteDeviceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        Device ID (Optional)
                      </FormLabel>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-3.5 icon-sm text-zinc-400" />
                        <FormControl>
                          <Input
                            data-testid="fonnte-device-id-input"
                            type="text"
                            placeholder="e.g. 123456"
                            className="pl-10 h-11 text-xs"
                            disabled={isSaving || isResetting}
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Required to dispatch automated booking confirmations and schedule
                reminders directly to customer contact numbers.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/20 py-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  id="setting-integration-reset-btn"
                  data-testid="reset-defaults-button"
                  disabled={isSaving || isResetting}
                >
                  {isResetting ? (
                    <Loader2 className="icon-sm animate-spin" />
                  ) : (
                    <RotateCcw className="icon-sm" />
                  )}
                  <span>Reset credentials</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent data-testid="reset-defaults-confirm-dialog">
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset API credentials?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete and reset your custom API
                    configurations? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-testid="cancel-reset-button">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    data-testid="confirm-reset-button"
                    onClick={onReset}
                  >
                    Reset
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              type="submit"
              id="setting-integration-save-btn"
              data-testid="save-integration-settings-button"
              disabled={isSaving || isResetting}
            >
              {isSaving ? (
                <Loader2 className="icon-sm animate-spin" />
              ) : (
                <Save className="icon-sm" />
              )}
              <span>Save configurations</span>
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
