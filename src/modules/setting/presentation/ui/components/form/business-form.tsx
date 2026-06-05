"use client";

import React, { useState } from "react";
import { toast } from "sonner";
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
  const [businessName, setBusinessName] = useState(initialName);
  const [shortName, setShortName] = useState(initialShortName);
  const [description, setDescription] = useState(initialDescription);
  const [timezone, setTimezone] = useState(initialTimezone);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      toast.error("Business name cannot be empty");
      return;
    }
    setIsSaving(true);
    try {
      const nameRes = await updateSettingAction("business_name", {
        name: businessName.trim(),
        shortName: shortName.trim(),
        description: description.trim(),
      });
      const tzRes = await updateSettingAction("timezone", {
        value: timezone,
      });

      if (nameRes.success && tzRes.success) {
        toast.success(
          "Business profile updated successfully! Please refresh the page to apply branding & layout updates globally.",
        );
      } else {
        toast.error(
          nameRes.error || tzRes.error || "Failed to update business profile",
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error("Failed to save business settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (
      !confirm(
        "Are you sure you want to reset your business settings to default?",
      )
    ) {
      return;
    }
    setIsResetting(true);
    try {
      const nameRes = await deleteSettingAction("business_name");
      const tzRes = await deleteSettingAction("timezone");

      if (nameRes.success && tzRes.success) {
        setBusinessName("");
        setShortName("");
        setDescription("");
        setTimezone("Asia/Jakarta");
        toast.success(
          "Business settings reset to system defaults! Please refresh the page to apply changes.",
        );
      } else {
        toast.error(nameRes.error || tzRes.error || "Failed to reset settings");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error("Failed to reset settings");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <form onSubmit={handleSave}>
      <Card className="border border-zinc-200/80 dark:border-zinc-800/80 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <Building2 className="h-5 w-5 text-zinc-500" />
            Business Profile Settings
          </CardTitle>
          <CardDescription>
            Manage public clinic identity and operational timezone
            configurations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="setting-business-name"
              className="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Clinic / Business Name
            </Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <Input
                id="setting-business-name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. PsyCare Healing Center"
                className="pl-10 h-11"
                required
                disabled={isSaving || isResetting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="setting-business-short-name"
              className="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Clinic Short Name (for Sidebar & Logo)
            </Label>
            <div className="relative">
              <Type className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <Input
                id="setting-business-short-name"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                placeholder="e.g. Psy"
                className="pl-10 h-11"
                disabled={isSaving || isResetting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="setting-business-description"
              className="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Clinic Description / Tagline (Splash Screen Intro)
            </Label>
            <div className="relative">
              <AlignLeft className="absolute left-3 top-3 h-4 w-4 text-zinc-400 font-semibold" />
              <Textarea
                id="setting-business-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Your dedicated platform for seamless psychological consultation..."
                className="pl-10 min-h-[80px] pt-2"
                disabled={isSaving || isResetting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="setting-timezone"
              className="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Operating Timezone
            </Label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <select
                id="setting-timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full pl-10 pr-4 h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white transition-all appearance-none cursor-pointer"
                disabled={isSaving || isResetting}
              >
                {TIMEZONES.map((tz) => (
                  <option
                    key={tz.value}
                    value={tz.value}
                    className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  >
                    {tz.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400">
                ▼
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/20 py-4">
          <Button
            type="button"
            variant="outline"
            id="setting-business-reset-btn"
            onClick={handleReset}
            disabled={isSaving || isResetting}
            className="rounded-xl px-4 h-10 gap-2 text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 cursor-pointer active:scale-[0.98]"
          >
            {isResetting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
            <span>Reset Defaults</span>
          </Button>
          <Button
            type="submit"
            id="setting-business-save-btn"
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
