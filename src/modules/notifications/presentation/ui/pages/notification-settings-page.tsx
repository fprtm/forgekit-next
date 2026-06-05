import * as React from "react"
import Wrapper from "@/shared/components/layout/wrapper"
import { Bell } from "lucide-react"
import { NotificationSettingsForm } from "../components/notification-settings-form"

export function NotificationSettingsPage() {
  return (
    <Wrapper>
      <div className="flex flex-col gap-8 w-full mx-auto py-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-black">
                <Bell className="h-5 w-5" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                Notification Settings
              </h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Manage your notification channel preferences
            </p>
          </div>
        </div>

        <div className="w-full md:max-w-3xl mx-auto space-y-8">
          <NotificationSettingsForm />
        </div>
      </div>
    </Wrapper>
  )
}
