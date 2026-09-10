"use client";

import React from "react";
import {
  Building2,
  Clock,
  Loader2,
  Save,
  RotateCcw,
  Type,
  AlignLeft,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
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
import { useBusinessForm } from "../../hooks/use-business-form";

const TIMEZONES = [
  { value: "Asia/Jakarta", label: "WIB - Asia/Jakarta (GMT+7)" },
  { value: "Asia/Makassar", label: "WITA - Asia/Makassar (GMT+8)" },
  { value: "Asia/Jayapura", label: "WIT - Asia/Jayapura (GMT+9)" },
  { value: "Asia/Singapore", label: "SGT - Asia/Singapore (GMT+8)" },
  { value: "UTC", label: "UTC - Coordinated Universal Time" },
  { value: "America/New_York", label: "EST - America/New_York (GMT-5)" },
  { value: "Europe/London", label: "GMT - Europe/London (GMT+0)" },
];

interface BusinessFormProps {
  initialName: string;
  initialShortName: string;
  initialDescription: string;
  initialTimezone: string;
}

export function BusinessForm({
  initialName,
  initialShortName,
  initialDescription,
  initialTimezone,
}: BusinessFormProps) {
  const { form, onSubmit, onReset, isResetting } = useBusinessForm({
    initialName,
    initialShortName,
    initialDescription,
    initialTimezone,
  });
  const isSaving = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form method="post" onSubmit={form.handleSubmit(onSubmit)} data-testid="business-form">
        <Card className="border border-zinc-200/80 dark:border-zinc-800/80 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Building2 className="icon-md text-zinc-500" />
              Business Profile Settings
            </CardTitle>
            <CardDescription>
              Manage your public business identity and operational timezone
              configuration.
            </CardDescription>
          </CardHeader>
          <CardContent className="form-stack">
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Business Name
                  </FormLabel>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 icon-sm text-zinc-400" />
                    <FormControl>
                      <Input
                        data-testid="business-name-input"
                        placeholder="e.g. ForgeKit Demo Business"
                        className="pl-10 h-11"
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
              name="shortName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Short Name (for Sidebar & Logo)
                  </FormLabel>
                  <div className="relative">
                    <Type className="absolute left-3 top-3 icon-sm text-zinc-400" />
                    <FormControl>
                      <Input
                        data-testid="business-short-name-input"
                        placeholder="e.g. FK"
                        className="pl-10 h-11"
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Description / Tagline (Splash Screen Intro)
                  </FormLabel>
                  <div className="relative">
                    <AlignLeft className="absolute left-3 top-3 icon-sm text-zinc-400 font-semibold" />
                    <FormControl>
                      <Textarea
                        data-testid="business-description-input"
                        placeholder="e.g. A short tagline describing your business..."
                        className="pl-10 min-h-[80px] pt-2"
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
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Operating Timezone
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSaving || isResetting}
                  >
                    <FormControl>
                      <SelectTrigger
                        data-testid="timezone-select"
                        className="w-full h-11"
                      >
                        <Clock className="icon-sm text-zinc-400" />
                        <SelectValue placeholder="Select a timezone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between items-center border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/20 py-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  id="setting-business-reset-btn"
                  data-testid="reset-defaults-button"
                  disabled={isSaving || isResetting}
                >
                  {isResetting ? (
                    <Loader2 className="icon-sm animate-spin" />
                  ) : (
                    <RotateCcw className="icon-sm" />
                  )}
                  <span>Reset Defaults</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent data-testid="reset-defaults-confirm-dialog">
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset business settings?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to reset your business settings to
                    default? This action cannot be undone.
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
              id="setting-business-save-btn"
              data-testid="save-business-settings-button"
              disabled={isSaving || isResetting}
            >
              {isSaving ? (
                <Loader2 className="icon-sm animate-spin" />
              ) : (
                <Save className="icon-sm" />
              )}
              <span>Save Changes</span>
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
