"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { sidebarMenuItems } from "@/config/menu";
import { can } from "@/modules/auth/domain/policies";
import { AuthUser } from "@/modules/auth/domain/types";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem as SuiItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

interface AppSidebarMenuProps {
  user?: {
    id?: string;
    role?: string | null;
    name?: string | null;
    email?: string | null;
  };
}

export function AppSidebarMenu({ user }: AppSidebarMenuProps) {
  const pathname = usePathname();
  const { state, setOpen } = useSidebar();

  // Filter top-level menu items by user's action permission
  const allowedItems = sidebarMenuItems.filter((item) => {
    if (item.requiredAction) {
      const authUser: AuthUser | null = user 
        ? { id: user.id || "", role: user.role || "" } 
        : null;
      return can(authUser, item.requiredAction);
    }
    return true;
  });

  return (
    <SidebarContent className="py-4">
      <SidebarGroup>
        <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden px-4 text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
          Overview
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="px-2">
            {allowedItems.map((item) => {
              const Icon = item.icon;

              // Check if parent or any of its children are currently active
              const hasActiveChild =
                item.children?.some((child) => pathname === child.href) ??
                false;
              const isActive = pathname === item.href || hasActiveChild;

              if (item.children && item.children.length > 0) {
                return (
                  <Collapsible
                    key={item.href}
                    asChild
                    defaultOpen={isActive}
                    className="group/collapsible"
                  >
                    <SuiItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          isActive={isActive}
                          tooltip={item.label}
                          onClick={(e) => {
                            if (state === "collapsed") {
                              e.preventDefault();
                              setOpen(true);
                            }
                          }}
                          className={cn(
                            "group/btn flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
                            isActive
                              ? "bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-black"
                              : "text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-white"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Icon
                              className={cn(
                                "h-4 w-4 shrink-0 transition-transform duration-200 group-hover/btn:scale-110",
                                isActive
                                  ? "text-inherit"
                                  : "text-zinc-400 group-hover/btn:text-zinc-900 dark:group-hover/btn:text-white"
                              )}
                            />
                            <span className="group-data-[collapsible=icon]:hidden">
                              {item.label}
                            </span>
                          </div>
                          <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden text-zinc-400" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.children
                            .filter((sub) => {
                              if (sub.requiredAction) {
                                const authUser: AuthUser | null = user
                                  ? { id: user.id || "", role: user.role || "" }
                                  : null;
                                return can(authUser, sub.requiredAction);
                              }
                              return true;
                            })
                            .map((subItem) => {
                              const isSubActive = pathname === subItem.href;
                              return (
                                <SidebarMenuSubItem key={subItem.href}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={isSubActive}
                                    className={cn(
                                      "flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                                      isSubActive
                                        ? "bg-zinc-200/70 text-zinc-900 dark:bg-zinc-800 dark:text-white"
                                        : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
                                    )}
                                  >
                                    <Link href={subItem.href}>
                                      <span>{subItem.label}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SuiItem>
                  </Collapsible>
                );
              }

              // Render standard single sidebar menu item
              return (
                <SuiItem key={item.href}>
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
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-transform duration-200 group-hover/btn:scale-110",
                          isActive
                            ? "text-inherit"
                            : "text-zinc-400 group-hover/btn:text-zinc-900 dark:group-hover/btn:text-white"
                        )}
                      />
                      <span className="group-data-[collapsible=icon]:hidden">
                        {item.label}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SuiItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}
