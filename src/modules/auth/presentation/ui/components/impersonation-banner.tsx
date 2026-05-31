"use client"

import { useRouter } from "next/navigation";
import { useState } from "react";
import { stopImpersonationAction } from "../../http/actions/impersonate.actions";
import { Button } from "@/shared/components/ui/button";

interface ImpersonationBannerProps {
  currentName?: string | null;
  currentEmail?: string | null;
}

export function ImpersonationBanner({
  currentName,
  currentEmail,
}: ImpersonationBannerProps) {
  const router = useRouter();
  const [isStopping, setIsStopping] = useState(false);

  async function handleStop() {
    setIsStopping(true);
    const result = await stopImpersonationAction();
    if (result.success) {
      router.refresh();
    }
    setIsStopping(false);
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between gap-4 dark:bg-amber-950/30 dark:border-amber-800">
      <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
        </svg>
        <span>
          You are impersonating <strong>{currentName || "Unknown User"}</strong>
          {currentEmail ? <span className="text-amber-600 dark:text-amber-400"> ({currentEmail})</span> : null}
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleStop}
        disabled={isStopping}
        className="shrink-0 border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900"
      >
        {isStopping ? "Stopping..." : "Stop Impersonating"}
      </Button>
    </div>
  );
}
