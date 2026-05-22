"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  Settings,
  User,
  LogOut,
  ChevronUp,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AppSidebarProps {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string | null
  }
}

const menuItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: ShoppingBag },
  { href: "/orders", label: "Orders", icon: CreditCard },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname()
  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U"

  return (
    <Sidebar collapsible="icon" className="border-r border-zinc-200/50 bg-zinc-50/80 backdrop-blur-md dark:border-zinc-800/50 dark:bg-zinc-950/80">
      {/* Header Branding */}
      <SidebarHeader className="flex h-16 items-center px-4 justify-between border-b border-zinc-200/50 dark:border-zinc-800/50">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight text-zinc-900 dark:text-white group-data-[collapsible=icon]:justify-center">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black font-semibold shadow-sm transition-all group-hover:scale-105">
            F
          </span>
          <span className="group-data-[collapsible=icon]:hidden transition-opacity duration-200">
            ForgeKit
          </span>
        </Link>
      </SidebarHeader>

      {/* Main Navigation Content */}
      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden px-4 text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
            Overview
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      className={cn(
                        "group/btn flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-black"
                          : "text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-white"
                      )}
                    >
                      <Link href={item.href}>
                        <Icon className={cn(
                          "h-4 w-4 shrink-0 transition-transform duration-200 group-hover/btn:scale-110",
                          isActive ? "text-inherit" : "text-zinc-400 group-hover/btn:text-zinc-900 dark:group-hover/btn:text-white"
                        )} />
                        <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer Profile Dropdown */}
      <SidebarFooter className="p-3 border-t border-zinc-200/50 dark:border-zinc-800/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton 
                  size="lg"
                  className="w-full flex items-center justify-between rounded-xl p-2 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar className="h-8 w-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                      {user?.image && <AvatarImage src={user.image} alt={user.name || "User image"} />}
                      <AvatarFallback className="bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 text-xs font-semibold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-left min-w-0 group-data-[collapsible=icon]:hidden">
                      <span className="text-sm font-semibold truncate text-zinc-900 dark:text-white">
                        {user?.name || "User"}
                      </span>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500 truncate">
                        {user?.email || "user@example.com"}
                      </span>
                    </div>
                  </div>
                  <ChevronUp className="h-4 w-4 text-zinc-400 group-data-[collapsible=icon]:hidden shrink-0" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="end"
                className="w-56 rounded-xl border border-zinc-200/50 bg-white/95 backdrop-blur-md p-1.5 shadow-lg dark:border-zinc-800/50 dark:bg-zinc-950/95"
              >
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/50 cursor-pointer">
                    <User className="h-4 w-4" />
                    <span>My Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/50 cursor-pointer">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <div className="my-1.5 h-px bg-zinc-200/50 dark:bg-zinc-800/50" />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
