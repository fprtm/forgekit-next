"use client";

import React from "react";
import { Sidebar } from "@/shared/components/ui/sidebar";
import { AppSidebarHeader } from "./header";
import { AppSidebarMenu } from "./menu";
import { AppSidebarFooter } from "./footer";

import { BusinessSetting } from "@/modules/setting/domain/entities/setting.entity";

interface AppSidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  };
  dynamicBusiness?: BusinessSetting | null;
}

export function AppSidebar({ user, dynamicBusiness }: AppSidebarProps) {
  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-zinc-200/50 bg-zinc-50/80 backdrop-blur-md dark:border-zinc-800/50 dark:bg-zinc-950/80"
    >
      {/* Header Branding Logo */}
      <AppSidebarHeader dynamicBusiness={dynamicBusiness} />

      {/* Main Navigation Menu */}
      <AppSidebarMenu user={user} />

      {/* Footer Profile Dropdown */}
      <AppSidebarFooter user={user} />
    </Sidebar>
  );
}
