"use client";

import React from "react";
import {
  ShieldCheck,
  Save,
  Percent,
  Info,
  Loader2,
  RotateCcw,
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
import { usePolicyForm } from "../../hooks/use-policy-form";

interface PolicyFormProps {
  initialMode: "strict" | "flexible";
  initialRefundPercent: number;
}

export function PolicyForm({
  initialMode,
  initialRefundPercent,
}: PolicyFormProps) {
  const { form, onSubmit, onReset, isResetting } = usePolicyForm({
    initialMode,
    initialRefundPercent,
  });
  const isSaving = form.formState.isSubmitting;
  const cancellationMode = form.watch("cancellationMode");
  const refundPercent = form.watch("refundPercent");

  return (
    <Form {...form}>
      <form method="post" onSubmit={form.handleSubmit(onSubmit)} data-testid="policy-form">
        <Card className="border border-zinc-200/80 dark:border-zinc-800/80 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <ShieldCheck className="icon-md text-zinc-500" />
              Booking Cancellation Policy
            </CardTitle>
            <CardDescription>
              Define rules and cancellation guidelines presented to customers
              during checkout.
            </CardDescription>
          </CardHeader>
          <CardContent className="form-stack">
            <FormField
              control={form.control}
              name="cancellationMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Cancellation Policy Mode
                  </FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("refundPercent", value === "flexible" ? 100 : 50);
                    }}
                    value={field.value}
                    disabled={isSaving || isResetting}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="cancellation-mode-select" className="w-full h-11">
                        <ShieldCheck className="icon-sm text-zinc-400" />
                        <SelectValue placeholder="Select a cancellation mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="flexible">
                        Flexible - Free cancellation (Full Refund)
                      </SelectItem>
                      <SelectItem value="strict">
                        Strict - Restricted terms (Partial / No Refund)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {cancellationMode === "strict" && (
              <FormField
                control={form.control}
                name="refundPercent"
                render={({ field }) => (
                  <FormItem className="animate-fadeIn">
                    <FormLabel className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      Refund Percentage (%)
                    </FormLabel>
                    <div className="relative">
                      <Percent className="absolute left-3.5 top-3.5 icon-sm text-zinc-400" />
                      <FormControl>
                        <Input
                          data-testid="refund-percent-input"
                          type="number"
                          min="0"
                          max="100"
                          placeholder="e.g. 50"
                          className="pl-10 h-11"
                          disabled={isSaving || isResetting}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Define the percentage of the deposit/booking fee that will be
                      returned upon strict cancellation.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex gap-3 items-start p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
              <Info className="icon-md text-zinc-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Cancellation Rule Summary
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {cancellationMode === "flexible"
                    ? "Under Flexible mode, customers are allowed to cancel bookings up to the scheduled start time for a 100% full refund."
                    : `Under Strict mode, customers who cancel their booking will only receive a partial refund of ${refundPercent}% of the paid amount.`}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/20 py-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  id="setting-policy-reset-btn"
                  data-testid="reset-defaults-button"
                  disabled={isSaving || isResetting}
                >
                  {isResetting ? (
                    <Loader2 className="icon-sm animate-spin" />
                  ) : (
                    <RotateCcw className="icon-sm" />
                  )}
                  <span>Delete Policy</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent data-testid="reset-defaults-confirm-dialog">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete cancellation policy?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to remove this custom cancellation
                    policy? This action cannot be undone.
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
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              type="submit"
              id="setting-cancellation-save-btn"
              data-testid="save-policy-settings-button"
              disabled={isSaving || isResetting}
            >
              {isSaving ? (
                <Loader2 className="icon-sm animate-spin" />
              ) : (
                <Save className="icon-sm" />
              )}
              <span>Save Policies</span>
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
