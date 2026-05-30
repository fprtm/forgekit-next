"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Building2, Coins, ShieldCheck, Settings, Link2 } from "lucide-react";
import Wrapper from "@/shared/components/layout/wrapper";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { getSettingsAction } from "../../http/actions/setting.actions";
import { BusinessForm } from "../components/form/business-form";
import { PaymentForm } from "../components/form/payment-form";
import { PolicyForm } from "../components/form/policy-form";
import { IntegrationForm } from "../components/form/integration-form";
import {
  BusinessSetting,
  CancellationSetting,
  DepositSetting,
  MidtransCredentialsSetting,
  FonnteCredentialsSetting,
} from "../../../domain/entities/setting.entity";

export default function SettingPage() {
  const [activeTab, setActiveTab] = useState<
    "business" | "payment" | "policy" | "integrations"
  >("business");
  const [isLoading, setIsLoading] = useState(true);

  // Loaded Settings
  const [businessName, setBusinessName] = useState("");
  const [businessShortName, setBusinessShortName] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [timezone, setTimezone] = useState("Asia/Jakarta");
  const [depositType, setDepositType] = useState<"flat" | "percentage">("flat");
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<"midtrans" | "manual" | "both">(
    "midtrans",
  );
  const [manualInstructions, setManualInstructions] = useState<string>("");
  const [bankName, setBankName] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [accountHolder, setAccountHolder] = useState<string>("");
  const [confirmationPhone, setConfirmationPhone] = useState<string>("");
  const [cancellationMode, setCancellationMode] = useState<
    "strict" | "flexible"
  >("flexible");
  const [refundPercent, setRefundPercent] = useState<number>(0);

  // Integrations settings state
  const [midtransClientKey, setMidtransClientKey] = useState("");
  const [midtransServerKey, setMidtransServerKey] = useState("");
  const [midtransIsProduction, setMidtransIsProduction] = useState(false);
  const [fonnteApiToken, setFonnteApiToken] = useState("");
  const [fonnteDeviceId, setFonnteDeviceId] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await getSettingsAction();
        if (res.success && res.data) {
          res.data.forEach((item) => {
            if (item.key === "business_name") {
              const val = item.value as BusinessSetting;
              setBusinessName(val?.name || "");
              setBusinessShortName(val?.shortName || "");
              setBusinessDescription(val?.description || "");
            } else if (item.key === "timezone") {
              const val = item.value as { value: string };
              setTimezone(val?.value || "Asia/Jakarta");
            } else if (item.key === "deposit") {
              const val = item.value as DepositSetting;
              setDepositType(val?.type || "flat");
              setDepositAmount(val?.amount || 0);
            } else if (item.key === "payment_method") {
              const val = item.value as {
                mode: "midtrans" | "manual" | "both";
                manualInstructions?: string;
                bankName?: string;
                accountNumber?: string;
                accountHolder?: string;
                confirmationPhone?: string;
              };
              setPaymentMode(val?.mode || "midtrans");
              setManualInstructions(val?.manualInstructions || "");
              setBankName(val?.bankName || "");
              setAccountNumber(val?.accountNumber || "");
              setAccountHolder(val?.accountHolder || "");
              setConfirmationPhone(val?.confirmationPhone || "");
            } else if (item.key === "cancellation") {
              const val = item.value as CancellationSetting;
              setCancellationMode(val?.mode || "flexible");
              setRefundPercent(val?.refundPercent || 0);
            } else if (item.key === "midtrans_credentials") {
              const val = item.value as MidtransCredentialsSetting;
              setMidtransClientKey(val?.clientKey || "");
              setMidtransServerKey(val?.serverKey || "");
              setMidtransIsProduction(val?.isProduction || false);
            } else if (item.key === "fonnte_credentials") {
              const val = item.value as FonnteCredentialsSetting;
              setFonnteApiToken(val?.apiToken || "");
              setFonnteDeviceId(val?.deviceId || "");
            }
          });
        } else if (res.error) {
          toast.error(`Failed to load settings: ${res.error}`);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        toast.error("An unexpected error occurred while loading settings.");
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  if (isLoading) {
    return (
      <Wrapper>
        <div className="flex flex-col gap-8 w-full max-w-3xl mx-auto py-6">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-5 w-80" />
          </div>
          <div className="flex gap-2 dark:border-zinc-800 pb-px">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-28" />
            </CardFooter>
          </Card>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <div className="flex flex-col gap-8 w-full mx-auto py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-black">
                <Settings className="h-5 w-5" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                System Settings
              </h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Configure clinic profile, payment parameters, and client
              cancellation policies.
            </p>
          </div>
        </div>

        <div className="w-full md:max-w-3xl mx-auto space-y-8">
          {/* Tab Navigation */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-800 space-x-1.5 p-1 bg-zinc-100 dark:bg-zinc-900/50 rounded w-full">
            <button
              id="setting-tab-business"
              type="button"
              onClick={() => setActiveTab("business")}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded transition-all duration-300 w-full cursor-pointer ${
                activeTab === "business"
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-black/5"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Profile</span>
            </button>
            <button
              id="setting-tab-payment"
              type="button"
              onClick={() => setActiveTab("payment")}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded transition-all duration-300 w-full cursor-pointer ${
                activeTab === "payment"
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-black/5"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <Coins className="h-4 w-4" />
              <span>Payments</span>
            </button>
            <button
              id="setting-tab-policy"
              type="button"
              onClick={() => setActiveTab("policy")}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded transition-all duration-300 w-full cursor-pointer ${
                activeTab === "policy"
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-black/5"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Policies</span>
            </button>
            <button
              id="setting-tab-integrations"
              type="button"
              onClick={() => setActiveTab("integrations")}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded transition-all duration-300 w-full cursor-pointer ${
                activeTab === "integrations"
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-black/5"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <Link2 className="h-4 w-4" />
              <span>Integrations</span>
            </button>
          </div>

          {/* Tab Contents */}
          <div className="transition-all duration-300 animate-fadeIn">
            {activeTab === "business" && (
              <BusinessForm
                initialName={businessName}
                initialShortName={businessShortName}
                initialDescription={businessDescription}
                initialTimezone={timezone}
              />
            )}

            {activeTab === "payment" && (
              <PaymentForm
                initialType={depositType}
                initialAmount={depositAmount}
                initialPaymentMode={paymentMode}
                initialManualInstructions={manualInstructions}
                initialBankName={bankName}
                initialAccountNumber={accountNumber}
                initialAccountHolder={accountHolder}
                initialConfirmationPhone={confirmationPhone}
              />
            )}

            {activeTab === "policy" && (
              <PolicyForm
                initialMode={cancellationMode}
                initialRefundPercent={refundPercent}
              />
            )}

            {activeTab === "integrations" && (
              <IntegrationForm
                initialMidtransClientKey={midtransClientKey}
                initialMidtransServerKey={midtransServerKey}
                initialMidtransIsProduction={midtransIsProduction}
                initialFonnteApiToken={fonnteApiToken}
                initialFonnteDeviceId={fonnteDeviceId}
              />
            )}
          </div>
        </div>
      </div>
    </Wrapper>
  );
}
