"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Building2, Coins, ShieldCheck, Settings, Link2, MoreHorizontal } from "lucide-react";
import Wrapper from "@/shared/components/layout/wrapper";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/components/ui/dropdown-menu";
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

type SettingTab = "business" | "payment" | "policy" | "integrations";

const SETTING_TABS: {
  id: SettingTab;
  label: string;
  icon: typeof Building2;
  testId: string;
}[] = [
  { id: "business", label: "Profile", icon: Building2, testId: "profile-tab" },
  { id: "payment", label: "Payments", icon: Coins, testId: "payments-tab" },
  { id: "policy", label: "Policies", icon: ShieldCheck, testId: "policies-tab" },
  { id: "integrations", label: "Integrations", icon: Link2, testId: "integrations-tab" },
];

// Only this many tabs get their own button on narrow screens — the rest live in the "More" dropdown.
const VISIBLE_ON_MOBILE = 2;

export default function SettingPage() {
  const [activeTab, setActiveTab] = useState<SettingTab>("business");
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
        <div className="page-shell max-w-3xl mx-auto">
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
      <div className="page-shell">
        {/* Page Header */}
        <div className="page-header">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-black">
                <Settings className="icon-md" />
              </div>
              <h1 className="page-title">System Settings</h1>
            </div>
            <p className="page-description">
              Configure your business profile, payment parameters, and
              cancellation policies.
            </p>
          </div>
        </div>

        <div className="w-full md:max-w-3xl mx-auto content-stack">
          {/* Tab Navigation — full bar on md+, "More" overflow dropdown on narrow screens */}
          <div className="hidden md:flex border-b border-zinc-200 dark:border-zinc-800 space-x-1.5 p-1 bg-zinc-100 dark:bg-zinc-900/50 rounded w-full">
            {SETTING_TABS.map((tab) => (
              <button
                key={tab.id}
                id={`setting-tab-${tab.id}`}
                data-testid={tab.testId}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded transition-all duration-300 w-full cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-black/5"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <tab.icon className="icon-sm" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex md:hidden border-b border-zinc-200 dark:border-zinc-800 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900/50 rounded w-full">
            {SETTING_TABS.slice(0, VISIBLE_ON_MOBILE).map((tab) => (
              <button
                key={tab.id}
                id={`setting-tab-${tab.id}`}
                data-testid={tab.testId}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded transition-all duration-300 flex-1 min-w-0 cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-black/5"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <tab.icon className="icon-sm shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            ))}

            {(() => {
              const overflowTabs = SETTING_TABS.slice(VISIBLE_ON_MOBILE);
              const activeOverflowTab = overflowTabs.find((tab) => tab.id === activeTab);
              const TriggerIcon = activeOverflowTab?.icon ?? MoreHorizontal;

              return (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      data-testid="settings-tabs-more-trigger"
                      className={`flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded transition-all duration-300 flex-1 min-w-0 cursor-pointer ${
                        activeOverflowTab
                          ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-black/5"
                          : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                      }`}
                    >
                      <TriggerIcon className="icon-sm shrink-0" />
                      <span className="truncate">{activeOverflowTab?.label ?? "More"}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {overflowTabs.map((tab) => (
                      <DropdownMenuItem
                        key={tab.id}
                        data-testid={tab.testId}
                        onClick={() => setActiveTab(tab.id)}
                      >
                        <tab.icon className="icon-sm" />
                        <span>{tab.label}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })()}
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
