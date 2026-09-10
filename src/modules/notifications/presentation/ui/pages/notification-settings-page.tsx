import * as React from "react"
import Wrapper from "@/shared/components/layout/wrapper"
import { Bell } from "lucide-react"
import { NotificationSettingsForm } from "../components/notification-settings-form"

export function NotificationSettingsPage() {
  return (
    <Wrapper>
      <div className="page-shell">
        <div className="page-header">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-black">
                <Bell className="icon-md" />
              </div>
              <h1 className="page-title">Notification Settings</h1>
            </div>
            <p className="page-description">
              Manage your notification channel preferences
            </p>
          </div>
        </div>

        <div className="w-full md:max-w-3xl mx-auto content-stack">
          <NotificationSettingsForm />
        </div>
      </div>
    </Wrapper>
  )
}
