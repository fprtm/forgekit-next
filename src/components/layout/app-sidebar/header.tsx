"use client";

import React from "react";
import Link from "next/link";
import { SidebarHeader } from "@/components/ui/sidebar";
import { siteConfig } from "@/config/site";

export function AppSidebarHeader() {
  return (
    <SidebarHeader className="flex h-16 items-center px-4 justify-center border-b border-zinc-200/50 dark:border-zinc-800/50">
      <Link
        href="/"
        className="flex items-center gap-2.5 font-bold text-lg tracking-tight text-zinc-900 dark:text-white group-data-[collapsible=icon]:justify-center"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black font-semibold shadow-sm transition-all group-hover:scale-105">
          {siteConfig.shortName || siteConfig.name.charAt(0)}
        </span>
        <span className="group-data-[collapsible=icon]:hidden transition-opacity duration-200">
          {siteConfig.name}
        </span>
      </Link>
    </SidebarHeader>
  );
}
