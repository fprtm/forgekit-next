import { AppSidebar } from "@/shared/components/layout/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/shared/components/ui/sidebar"
import { TooltipProvider } from "@/shared/components/ui/tooltip"
import { Session } from "next-auth"
import React from "react"

export default function DashboardLayout({
  children,
  session
}: {
  children: React.ReactNode
  session: Session
}) {

  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex h-screen w-screen overflow-hidden bg-background">
          <AppSidebar user={session.user} />
          <div className="flex flex-1 flex-col overflow-hidden">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-zinc-200/50 px-4 dark:border-zinc-800/50">
              <SidebarTrigger className="h-9 w-9" />
              <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
              <span className="text-sm font-medium text-zinc-500">Dashboard</span>
            </header>
            <main className="flex-1 overflow-y-auto p-6">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  )
}