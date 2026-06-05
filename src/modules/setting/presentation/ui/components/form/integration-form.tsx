"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  KeyRound,
  Save,
  Loader2,
  RotateCcw,
  Link2,
  Smartphone,
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
  const [midtransClientKey, setMidtransClientKey] = useState<string>(
    initialMidtransClientKey,
  );
  const [midtransServerKey, setMidtransServerKey] = useState<string>(
    initialMidtransServerKey,
  );
  const [midtransIsProduction, setMidtransIsProduction] = useState<boolean>(
    initialMidtransIsProduction,
  );

  const [fonnteApiToken, setFonnteApiToken] = useState<string>(
    initialFonnteApiToken,
  );
  const [fonnteDeviceId, setFonnteDeviceId] = useState<string>(
    initialFonnteDeviceId,
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSaving(true);
    try {
      const resMidtrans = await updateSettingAction("midtrans_credentials", {
        clientKey: midtransClientKey,
        serverKey: midtransServerKey,
        isProduction: midtransIsProduction,
      });

      const resFonnte = await updateSettingAction("fonnte_credentials", {
        apiToken: fonnteApiToken,
        deviceId: fonnteDeviceId || undefined,
      });

      if (resMidtrans.success && resFonnte.success) {
        toast.success("API Integrations updated successfully");
      } else {
        toast.error(
          resMidtrans.error ||
            resFonnte.error ||
            "Failed to update integration settings",
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error("Failed to save integration settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (
      !confirm(
        "Are you sure you want to delete and reset your custom API configurations?",
      )
    ) {
      return;
    }
    setIsResetting(true);
    try {
      const resMidtrans = await deleteSettingAction("midtrans_credentials");
      const resFonnte = await deleteSettingAction("fonnte_credentials");
      if (resMidtrans.success && resFonnte.success) {
        setMidtransClientKey("");
        setMidtransServerKey("");
        setMidtransIsProduction(false);
        setFonnteApiToken("");
        setFonnteDeviceId("");
        toast.success("API credentials removed successfully");
      } else {
        toast.error(
          resMidtrans.error ||
            resFonnte.error ||
            "Failed to delete integration settings",
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error("Failed to delete integration settings");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <form onSubmit={handleSave}>
      <Card className="border border-zinc-200/80 dark:border-zinc-800/80 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <Link2 className="h-5 w-5 text-zinc-500" />
            External API Integrations
          </CardTitle>
          <CardDescription>
            Configure authentication credentials for automated payments and
            real-time WhatsApp notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Section 1: Midtrans Gateway */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Midtrans Payment Gateway
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="setting-midtrans-client"
                  className="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  Client Key
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
                  <Input
                    id="setting-midtrans-client"
                    type="text"
                    value={midtransClientKey}
                    onChange={(e) => setMidtransClientKey(e.target.value)}
                    placeholder="SB-Mid-client-..."
                    className="pl-10 h-11 font-mono text-xs"
                    disabled={isSaving || isResetting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="setting-midtrans-server"
                  className="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  Server Key
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
                  <Input
                    id="setting-midtrans-server"
                    type="password"
                    value={midtransServerKey}
                    onChange={(e) => setMidtransServerKey(e.target.value)}
                    placeholder="SB-Mid-server-..."
                    className="pl-10 h-11 font-mono text-xs"
                    disabled={isSaving || isResetting}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="setting-midtrans-env"
                className="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Gateway Environment
              </Label>
              <div className="relative">
                <select
                  id="setting-midtrans-env"
                  value={midtransIsProduction ? "production" : "sandbox"}
                  onChange={(e) =>
                    setMidtransIsProduction(e.target.value === "production")
                  }
                  className="w-full px-4 h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white transition-all appearance-none cursor-pointer"
                  disabled={isSaving || isResetting}
                >
                  <option
                    value="sandbox"
                    className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  >
                    Sandbox Mode (Development & Testing)
                  </option>
                  <option
                    value="production"
                    className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  >
                    Production Mode (Live Operations & Active Charges)
                  </option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400">
                  ▼
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-100 dark:border-zinc-800 my-4" />

          {/* Section 2: Fonnte WhatsApp Notifications */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Fonnte WhatsApp Notifications
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="setting-fonnte-token"
                  className="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  API Token
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
                  <Input
                    id="setting-fonnte-token"
                    type="password"
                    value={fonnteApiToken}
                    onChange={(e) => setFonnteApiToken(e.target.value)}
                    placeholder="Your Fonnte Auth Token..."
                    className="pl-10 h-11 font-mono text-xs"
                    disabled={isSaving || isResetting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="setting-fonnte-device"
                  className="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  Device ID (Optional)
                </Label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
                  <Input
                    id="setting-fonnte-device"
                    type="text"
                    value={fonnteDeviceId}
                    onChange={(e) => setFonnteDeviceId(e.target.value)}
                    placeholder="e.g. 123456"
                    className="pl-10 h-11 text-xs"
                    disabled={isSaving || isResetting}
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Required to dispatch automated booking confirmations and schedule
              reminders directly to patient contact numbers.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/20 py-4">
          <Button
            type="button"
            variant="outline"
            id="setting-integration-reset-btn"
            onClick={handleReset}
            disabled={isSaving || isResetting}
            className="rounded-xl px-4 h-10 gap-2 text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 cursor-pointer active:scale-[0.98]"
          >
            {isResetting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
            <span>Reset credentials</span>
          </Button>
          <Button
            type="submit"
            id="setting-integration-save-btn"
            disabled={isSaving || isResetting}
            className="rounded-xl px-5 h-10 gap-2 cursor-pointer transition-all active:scale-[0.98]"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>Save configurations</span>
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
