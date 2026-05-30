"use client";

import React, { useState } from "react";
import { toast } from "sonner";
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

interface PolicyFormProps {
  initialMode: "strict" | "flexible";
  initialRefundPercent: number;
}

export function PolicyForm({
  initialMode,
  initialRefundPercent,
}: PolicyFormProps) {
  const [cancellationMode, setCancellationMode] = useState<
    "strict" | "flexible"
  >(initialMode);
  const [refundPercent, setRefundPercent] =
    useState<number>(initialRefundPercent);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (refundPercent < 0 || refundPercent > 100) {
      toast.error("Refund percentage must be between 0 and 100");
      return;
    }
    setIsSaving(true);
    try {
      const res = await updateSettingAction("cancellation", {
        mode: cancellationMode,
        refundPercent:
          cancellationMode === "strict" ? refundPercent : undefined,
      });
      if (res.success) {
        toast.success("Cancellation policies saved successfully");
      } else {
        toast.error(res.error || "Failed to save policies");
      }
    } catch (err) {
      toast.error("Failed to save policies");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (
      !confirm(
        "Are you sure you want to remove this custom cancellation policy?",
      )
    ) {
      return;
    }
    setIsResetting(true);
    try {
      const res = await deleteSettingAction("cancellation");
      if (res.success) {
        setCancellationMode("flexible");
        setRefundPercent(100);
        toast.success("Cancellation policy removed successfully");
      } else {
        toast.error(res.error || "Failed to delete policy settings");
      }
    } catch (err) {
      toast.error("Failed to delete policy settings");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <form onSubmit={handleSave}>
      <Card className="border border-zinc-200/80 dark:border-zinc-800/80 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <ShieldCheck className="h-5 w-5 text-zinc-500" />
            Appointment Cancellation Policy Guidelines
          </CardTitle>
          <CardDescription>
            Define rules and cancellation guidelines presented to patients
            during appointment checkout.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="setting-cancellation-mode"
              className="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Cancellation Policy Mode
            </Label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <select
                id="setting-cancellation-mode"
                value={cancellationMode}
                onChange={(e) => {
                  setCancellationMode(e.target.value as "strict" | "flexible");
                  if (e.target.value === "flexible") {
                    setRefundPercent(100);
                  } else {
                    setRefundPercent(50);
                  }
                }}
                className="w-full pl-10 pr-4 h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white transition-all appearance-none cursor-pointer"
                disabled={isSaving || isResetting}
              >
                <option
                  value="flexible"
                  className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                >
                  Flexible - Free cancellation (Full Refund)
                </option>
                <option
                  value="strict"
                  className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                >
                  Strict - Restricted terms (Partial / No Refund)
                </option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400">
                ▼
              </div>
            </div>
          </div>

          {cancellationMode === "strict" && (
            <div className="space-y-2 animate-fadeIn">
              <Label
                htmlFor="setting-refund-percent"
                className="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Refund Percentage (%)
              </Label>
              <div className="relative">
                <Percent className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
                <Input
                  id="setting-refund-percent"
                  type="number"
                  min="0"
                  max="100"
                  value={refundPercent}
                  onChange={(e) => setRefundPercent(Number(e.target.value))}
                  placeholder="e.g. 50"
                  className="pl-10 h-11"
                  required
                  disabled={isSaving || isResetting}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Define the percentage of the deposit/booking fee that will be
                returned upon strict cancellation.
              </p>
            </div>
          )}

          <div className="flex gap-3 items-start p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
            <Info className="h-5 w-5 text-zinc-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Cancellation Rule Summary
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {cancellationMode === "flexible"
                  ? "Under Flexible mode, patients are allowed to cancel bookings up to the session start time for a 100% full refund."
                  : `Under Strict mode, patients who cancel their scheduled session will only receive a partial refund of ${refundPercent}% of the paid amount.`}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/20 py-4">
          <Button
            type="button"
            variant="outline"
            id="setting-policy-reset-btn"
            onClick={handleReset}
            disabled={isSaving || isResetting}
            className="rounded-xl px-4 h-10 gap-2 text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 cursor-pointer active:scale-[0.98]"
          >
            {isResetting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
            <span>Delete Policy</span>
          </Button>
          <Button
            type="submit"
            id="setting-cancellation-save-btn"
            disabled={isSaving || isResetting}
            className="rounded-xl px-5 h-10 gap-2 cursor-pointer transition-all active:scale-[0.98]"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>Save Policies</span>
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
