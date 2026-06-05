"use client";

import React, { useState } from "react";
import { toast } from "sonner";
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
import { Label } from "@/shared/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/shared/components/ui/card";
import { updateSettingAction, deleteSettingAction } from "../../../http/actions/setting.actions";

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
  const [depositType, setDepositType] = useState<"flat" | "percentage">(
    initialType,
  );
  const [depositAmount, setDepositAmount] = useState<number>(initialAmount);
  const [paymentMode, setPaymentMode] = useState<"midtrans" | "manual" | "both">(
    initialPaymentMode,
  );
  const [manualInstructions, setManualInstructions] = useState<string>(
    initialManualInstructions,
  );
  const [bankName, setBankName] = useState<string>(initialBankName);
  const [accountNumber, setAccountNumber] = useState<string>(initialAccountNumber);
  const [accountHolder, setAccountHolder] = useState<string>(initialAccountHolder);
  const [confirmationPhone, setConfirmationPhone] = useState<string>(initialConfirmationPhone);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handlePhoneChange = (val: string) => {
    let cleaned = val.replace(/\D/g, "");
    if (cleaned.startsWith("0")) {
      cleaned = "62" + cleaned.substring(1);
    }
    setConfirmationPhone(cleaned);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (depositAmount < 0) {
      toast.error("Deposit value cannot be negative");
      return;
    }
    if (depositType === "percentage" && depositAmount > 100) {
      toast.error("Percentage deposit cannot exceed 100%");
      return;
    }
    if (paymentMode !== "midtrans") {
      if (!bankName.trim()) {
        toast.error("Please provide the Bank Name");
        return;
      }
      if (!accountNumber.trim()) {
        toast.error("Please provide the Bank Account Number");
        return;
      }
      if (!accountHolder.trim()) {
        toast.error("Please provide the Account Holder Name");
        return;
      }
      if (!confirmationPhone.trim()) {
        toast.error("Please provide the WhatsApp Admin number");
        return;
      }
    }

    setIsSaving(true);
    try {
      const resDeposit = await updateSettingAction("deposit", {
        type: depositType,
        amount: depositAmount,
      });

      const resMethod = await updateSettingAction("payment_method", {
        mode: paymentMode,
        manualInstructions:
          paymentMode !== "midtrans" ? manualInstructions : undefined,
        bankName: paymentMode !== "midtrans" ? bankName : undefined,
        accountNumber: paymentMode !== "midtrans" ? accountNumber : undefined,
        accountHolder: paymentMode !== "midtrans" ? accountHolder : undefined,
        confirmationPhone: paymentMode !== "midtrans" ? confirmationPhone : undefined,
      });

      if (resDeposit.success && resMethod.success) {
        toast.success("Payment settings updated successfully");
      } else {
        toast.error(
          resDeposit.error ||
            resMethod.error ||
            "Failed to update payment settings",
        );
      }
    } catch (err) {
      toast.error("Failed to save payment settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (
      !confirm(
        "Are you sure you want to disable and delete your custom payment configurations?",
      )
    ) {
      return;
    }
    setIsResetting(true);
    try {
      const resDeposit = await deleteSettingAction("deposit");
      const resMethod = await deleteSettingAction("payment_method");
      if (resDeposit.success && resMethod.success) {
        setDepositType("flat");
        setDepositAmount(0);
        setPaymentMode("midtrans");
        setManualInstructions("");
        setBankName("");
        setAccountNumber("");
        setAccountHolder("");
        setConfirmationPhone("");
        toast.success("Deposit configurations removed successfully");
      } else {
        toast.error(
          resDeposit.error ||
            resMethod.error ||
            "Failed to delete deposit settings",
        );
      }
    } catch (err) {
      toast.error("Failed to delete deposit settings");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <form onSubmit={handleSave}>
      <Card className="border border-zinc-200/80 dark:border-zinc-800/80 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <Coins className="h-5 w-5 text-zinc-500" />
            Payment & Deposit Configuration
          </CardTitle>
          <CardDescription>
            Configure deposit rules and select the preferred payment method for
            consultation bookings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Section 1: Deposit Configuration */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Deposit Rules
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="setting-deposit-type"
                  className="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  Deposit Type
                </Label>
                <div className="relative">
                  <Coins className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
                  <select
                    id="setting-deposit-type"
                    value={depositType}
                    onChange={(e) => {
                      setDepositType(e.target.value as "flat" | "percentage");
                      setDepositAmount(0);
                    }}
                    className="w-full pl-10 pr-4 h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white transition-all appearance-none cursor-pointer"
                    disabled={isSaving || isResetting}
                  >
                    <option
                      value="flat"
                      className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                    >
                      Flat Rate (IDR)
                    </option>
                    <option
                      value="percentage"
                      className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                    >
                      Percentage (%)
                    </option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400">
                    ▼
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="setting-deposit"
                  className="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  Deposit Value
                </Label>
                <div className="relative">
                  {depositType === "flat" ? (
                    <div className="absolute left-3.5 top-2.5 text-sm font-bold text-zinc-400">
                      Rp
                    </div>
                  ) : (
                    <Percent className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
                  )}
                  <Input
                    id="setting-deposit"
                    type="number"
                    min="0"
                    max={depositType === "percentage" ? 100 : undefined}
                    step={depositType === "flat" ? 1000 : 1}
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    placeholder={
                      depositType === "flat" ? "e.g. 50000" : "e.g. 25"
                    }
                    className="pl-10 h-11"
                    required
                    disabled={isSaving || isResetting}
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {depositType === "flat"
                ? "Set to 0 to disable booking deposits (allow patients to book without advance payment)."
                : "Define the percentage of the service charge that must be paid during checkout."}
            </p>
          </div>

          <div className="border-t border-zinc-100 dark:border-zinc-800 my-4" />

          {/* Section 2: Payment Provider Selection */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Payment Methods
            </h3>

            <div className="space-y-2">
              <Label
                htmlFor="setting-payment-mode"
                className="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Preferred Provider
              </Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
                <select
                  id="setting-payment-mode"
                  value={paymentMode}
                  onChange={(e) => {
                    setPaymentMode(e.target.value as "midtrans" | "manual" | "both");
                  }}
                  className="w-full pl-10 pr-4 h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white transition-all appearance-none cursor-pointer"
                  disabled={isSaving || isResetting}
                >
                  <option
                    value="midtrans"
                    className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  >
                    Midtrans Payment Gateway (Automated Online Payment)
                  </option>
                  <option
                    value="manual"
                    className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  >
                    Manual Bank Transfer (TF Manual & Confirm to Admin)
                  </option>
                  <option
                    value="both"
                    className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  >
                    Both (Enable Midtrans & Manual Transfer for checkout selection)
                  </option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400">
                  ▼
                </div>
              </div>
            </div>

            {paymentMode !== "midtrans" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="border-t border-zinc-100 dark:border-zinc-850 my-4 pt-2" />
                <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Landmark className="h-4.5 w-4.5 text-indigo-500" />
                  Manual Transfer Bank Details
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="setting-bank-name"
                      className="text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                    >
                      Bank Name
                    </Label>
                    <div className="relative">
                      <Landmark className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
                      <Input
                        id="setting-bank-name"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="e.g. BCA, Mandiri, BNI"
                        className="pl-10 h-11"
                        required
                        disabled={isSaving || isResetting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="setting-account-number"
                      className="text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                    >
                      Account Number (No. Rekening)
                    </Label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
                      <Input
                        id="setting-account-number"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="e.g. 1234567890"
                        className="pl-10 h-11"
                        required
                        disabled={isSaving || isResetting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="setting-account-holder"
                      className="text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                    >
                      Account Holder Name (Nama Pemilik)
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
                      <Input
                        id="setting-account-holder"
                        value={accountHolder}
                        onChange={(e) => setAccountHolder(e.target.value)}
                        placeholder="e.g. PT PsyCare Indonesia"
                        className="pl-10 h-11"
                        required
                        disabled={isSaving || isResetting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="setting-confirmation-phone"
                      className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1"
                    >
                      <span>WhatsApp Admin for Confirmation</span>
                      <span className="text-[10px] text-zinc-400 font-normal">(format: 628...)</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
                      <Input
                        id="setting-confirmation-phone"
                        value={confirmationPhone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="e.g. 628123456789"
                        className="pl-10 h-11"
                        required
                        disabled={isSaving || isResetting}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="setting-manual-instructions"
                    className="text-xs font-semibold text-zinc-750 dark:text-zinc-200 flex items-center gap-1.5"
                  >
                    <FileText className="h-4 w-4 text-zinc-500" />
                    Additional Instructions / Notes (Optional)
                  </Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <textarea
                      id="setting-manual-instructions"
                      value={manualInstructions}
                      onChange={(e) => setManualInstructions(e.target.value)}
                      placeholder="e.g. Sesi booking akan otomatis hangus jika konfirmasi pembayaran tidak dilakukan dalam 1 jam."
                      rows={3}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white transition-all resize-y min-h-[80px]"
                      disabled={isSaving || isResetting}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/20 py-4">
          <Button
            type="button"
            variant="outline"
            id="setting-payment-reset-btn"
            onClick={handleReset}
            disabled={isSaving || isResetting}
            className="rounded-xl px-4 h-10 gap-2 text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 cursor-pointer active:scale-[0.98]"
          >
            {isResetting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
            <span>Reset Settings</span>
          </Button>
          <Button
            type="submit"
            id="setting-payment-save-btn"
            disabled={isSaving || isResetting}
            className="rounded-xl px-5 h-10 gap-2 cursor-pointer transition-all active:scale-[0.98]"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>Save Changes</span>
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
