"use client";

import React from "react";
import {
  Coins,
  Save,
  Percent,
  Loader2,
  RotateCcw,
  CreditCard,
  Landmark,
  FileText,
  User,
  Phone,
  Hash,
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
import { usePaymentForm } from "../../hooks/use-payment-form";

interface PaymentFormProps {
  initialType: "flat" | "percentage";
  initialAmount: number;
  initialPaymentMode?: "midtrans" | "manual" | "both";
  initialManualInstructions?: string;
  initialBankName?: string;
  initialAccountNumber?: string;
  initialAccountHolder?: string;
  initialConfirmationPhone?: string;
}

export function PaymentForm({
  initialType,
  initialAmount,
  initialPaymentMode = "midtrans",
  initialManualInstructions = "",
  initialBankName = "",
  initialAccountNumber = "",
  initialAccountHolder = "",
  initialConfirmationPhone = "",
}: PaymentFormProps) {
  const { form, onSubmit, onReset, isResetting, handlePhoneChange } = usePaymentForm({
    initialType,
    initialAmount,
    initialPaymentMode,
    initialManualInstructions,
    initialBankName,
    initialAccountNumber,
    initialAccountHolder,
    initialConfirmationPhone,
  });
  const isSaving = form.formState.isSubmitting;
  const depositType = form.watch("depositType");
  const paymentMode = form.watch("paymentMode");

  return (
    <Form {...form}>
      <form method="post" onSubmit={form.handleSubmit(onSubmit)} data-testid="payment-form">
        <Card className="border border-zinc-200/80 dark:border-zinc-800/80 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Coins className="icon-md text-zinc-500" />
              Payment & Deposit Configuration
            </CardTitle>
            <CardDescription>
              Configure deposit rules and select the preferred payment method for
              customer bookings.
            </CardDescription>
          </CardHeader>
          <CardContent className="form-stack">
            {/* Section 1: Deposit Configuration */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                Deposit Rules
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="depositType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        Deposit Type
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue("depositAmount", 0);
                        }}
                        value={field.value}
                        disabled={isSaving || isResetting}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="deposit-type-select" className="w-full h-11">
                            <Coins className="icon-sm text-zinc-400" />
                            <SelectValue placeholder="Select deposit type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="flat">Flat Rate (IDR)</SelectItem>
                          <SelectItem value="percentage">Percentage (%)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="depositAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        Deposit Value
                      </FormLabel>
                      <div className="relative">
                        {depositType === "flat" ? (
                          <div className="absolute left-3.5 top-2.5 text-sm font-bold text-zinc-400">
                            Rp
                          </div>
                        ) : (
                          <Percent className="absolute left-3.5 top-3.5 icon-sm text-zinc-400" />
                        )}
                        <FormControl>
                          <Input
                            data-testid="deposit-amount-input"
                            type="number"
                            min="0"
                            max={depositType === "percentage" ? 100 : undefined}
                            step={depositType === "flat" ? 1000 : 1}
                            placeholder={depositType === "flat" ? "e.g. 50000" : "e.g. 25"}
                            className="pl-10 h-11"
                            disabled={isSaving || isResetting}
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {depositType === "flat"
                  ? "Set to 0 to disable booking deposits (allow customers to book without advance payment)."
                  : "Define the percentage of the service charge that must be paid during checkout."}
              </p>
            </div>

            <div className="border-t border-zinc-100 dark:border-zinc-800 my-4" />

            {/* Section 2: Payment Provider Selection */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                Payment Methods
              </h3>

              <FormField
                control={form.control}
                name="paymentMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      Preferred Provider
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isSaving || isResetting}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="payment-mode-select" className="w-full h-11">
                          <CreditCard className="icon-sm text-zinc-400" />
                          <SelectValue placeholder="Select a payment provider" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="midtrans">
                          Midtrans Payment Gateway (Automated Online Payment)
                        </SelectItem>
                        <SelectItem value="manual">
                          Manual Bank Transfer (TF Manual & Confirm to Admin)
                        </SelectItem>
                        <SelectItem value="both">
                          Both (Enable Midtrans & Manual Transfer for checkout selection)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {paymentMode !== "midtrans" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="border-t border-zinc-100 dark:border-zinc-850 my-4 pt-2" />
                  <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <Landmark className="h-4.5 w-4.5 text-indigo-500" />
                    Manual Transfer Bank Details
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            Bank Name
                          </FormLabel>
                          <div className="relative">
                            <Landmark className="absolute left-3 top-3.5 icon-sm text-zinc-400" />
                            <FormControl>
                              <Input
                                data-testid="bank-name-input"
                                placeholder="e.g. BCA, Mandiri, BNI"
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
                      name="accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            Account Number (No. Rekening)
                          </FormLabel>
                          <div className="relative">
                            <Hash className="absolute left-3 top-3.5 icon-sm text-zinc-400" />
                            <FormControl>
                              <Input
                                data-testid="account-number-input"
                                placeholder="e.g. 1234567890"
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
                      name="accountHolder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            Account Holder Name (Nama Pemilik)
                          </FormLabel>
                          <div className="relative">
                            <User className="absolute left-3 top-3.5 icon-sm text-zinc-400" />
                            <FormControl>
                              <Input
                                data-testid="account-holder-input"
                                placeholder="e.g. PT ForgeKit Indonesia"
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
                      name="confirmationPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                            <span>WhatsApp Admin for Confirmation</span>
                            <span className="text-[10px] text-zinc-400 font-normal">(format: 628...)</span>
                          </FormLabel>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3.5 icon-sm text-zinc-400" />
                            <FormControl>
                              <Input
                                data-testid="confirmation-phone-input"
                                placeholder="e.g. 628123456789"
                                className="pl-10 h-11"
                                disabled={isSaving || isResetting}
                                value={field.value}
                                onChange={(e) => handlePhoneChange(e.target.value)}
                                onBlur={field.onBlur}
                                name={field.name}
                                ref={field.ref}
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="manualInstructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-zinc-750 dark:text-zinc-200 flex items-center gap-1.5">
                          <FileText className="icon-sm text-zinc-500" />
                          Additional Instructions / Notes (Optional)
                        </FormLabel>
                        <div className="relative">
                          <FileText className="absolute left-3 top-3 icon-sm text-zinc-400" />
                          <FormControl>
                            <Textarea
                              data-testid="manual-instructions-input"
                              placeholder="e.g. Sesi booking akan otomatis hangus jika konfirmasi pembayaran tidak dilakukan dalam 1 jam."
                              rows={3}
                              className="pl-10 pr-4 py-3 resize-y min-h-[80px]"
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
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/20 py-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  id="setting-payment-reset-btn"
                  data-testid="reset-defaults-button"
                  disabled={isSaving || isResetting}
                >
                  {isResetting ? (
                    <Loader2 className="icon-sm animate-spin" />
                  ) : (
                    <RotateCcw className="icon-sm" />
                  )}
                  <span>Reset Settings</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent data-testid="reset-defaults-confirm-dialog">
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset payment settings?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to disable and delete your custom
                    payment configurations? This action cannot be undone.
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
              id="setting-payment-save-btn"
              data-testid="save-payment-settings-button"
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
