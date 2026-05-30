"use client";

import React from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { User, Settings, LogOut, ChevronUp } from "lucide-react";

import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/shared/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";

interface AppSidebarFooterProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  };
}

export function AppSidebarFooter({ user }: AppSidebarFooterProps) {
  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <SidebarFooter className="p-3 border-t border-zinc-200/50 dark:border-zinc-800/50">
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="w-full flex items-center justify-center rounded-xl p-2 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="h-8 w-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    {user?.image && (
                      <AvatarImage
                        src={user.image}
                        alt={user.name || "User image"}
                      />
                    )}
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
                <Link
                  href="/d/profile"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/50 cursor-pointer"
                >
                  <User className="h-4 w-4" />
                  <span>My Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/d/settings"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/50 cursor-pointer"
                >
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
  );
}
