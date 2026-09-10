"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { sidebarMenuItems } from "@/shared/config/menu";
import { can } from "@/modules/auth/domain/policies";
import { AuthUser } from "@/modules/auth/domain/types";
import { UserRole } from "@/shared/config/roles";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/shared/components/ui/dropdown-menu";

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
} from "@/shared/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/shared/components/ui/collapsible";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface UserData {
  id?: string;
  role?: string | null;
  name?: string | null;
  email?: string | null;
}

export interface MenuSubItem {
  label: string;
  href: string;
  requiredAction?: string;
}

export interface MenuItem {
  label: string;
  href: string;
  icon: React.ElementType;
  requiredAction?: string;
  children?: MenuSubItem[];
}

interface AppSidebarMenuProps {
  user?: UserData;
}

interface StandardMenuItemProps {
  item: MenuItem;
  isActive: boolean;
}

interface MenuWithChildrenProps {
  item: MenuItem;
  isActive: boolean;
  allowedChildren: MenuSubItem[];
  pathname: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Converts a menu label into a URL-safe, test-id-safe slug.
 *
 * @param label - The human readable menu label (e.g. "Dashboard").
 * @returns A lowercase, hyphenated slug (e.g. "dashboard").
 */
const slugify = (label: string): string =>
  label.toLowerCase().trim().replace(/\s+/g, "-");

/**
 * Validates whether the current user has the required permission to view a specific menu item.
 *
 * @param item - The menu item or sub-item containing the optional requiredAction.
 * @param user - The current authenticated user.
 * @returns boolean - True if the user is allowed to see the item, false otherwise.
 */
const isUserAllowed = (
  item: MenuItem | MenuSubItem,
  user?: UserData,
): boolean => {
  if (item.requiredAction) {
    const authUser: AuthUser | null = user
      ? { id: user.id || "", role: (user.role as UserRole) || "user" }
      : null;
    return can(authUser, item.requiredAction);
  }
  return true;
};

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Renders a standard, standalone menu item (without children).
 */
const StandardMenuItem = ({ item, isActive }: StandardMenuItemProps) => {
  const Icon = item.icon;

  return (
    <SuiItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.label}
        className={cn(
          "group/btn flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
            : "text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-white",
        )}
      >
        <Link
          href={item.href}
          data-testid={`nav-${slugify(item.label)}-link`}
        >
          <Icon
            className={cn(
              "h-4 w-4 shrink-0 transition-transform duration-200 group-hover/btn:scale-110",
              isActive
                ? "text-inherit"
                : "text-zinc-400 group-hover/btn:text-zinc-900 dark:group-hover/btn:text-white",
            )}
          />
          <span className="group-data-[collapsible=icon]:hidden">
            {item.label}
          </span>
        </Link>
      </SidebarMenuButton>
    </SuiItem>
  );
};

/**
 * Renders a flyout dropdown menu for items with children.
 * This is strictly used when the sidebar is in a "collapsed" (icon-only) state
 * to prevent layout overflow and UI distortion.
 */
const CollapsedDropdownMenu = ({
  item,
  isActive,
  allowedChildren,
  pathname,
}: MenuWithChildrenProps) => {
  const Icon = item.icon;

  return (
    <SuiItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            isActive={isActive}
            tooltip={item.label}
            data-testid={`nav-${slugify(item.label)}-link`}
            className={cn(
              "group/btn flex w-full items-center justify-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                : "text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-white",
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 shrink-0 transition-transform duration-200 group-hover/btn:scale-110",
                isActive
                  ? "text-inherit"
                  : "text-zinc-400 group-hover/btn:text-zinc-900 dark:group-hover/btn:text-white",
              )}
            />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="right"
          align="start"
          sideOffset={16}
          className="w-52 rounded-xl"
        >
          <DropdownMenuLabel className="font-semibold">
            <div className="flex items-center gap-2">
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform duration-200 group-hover/btn:scale-110",
                  isActive
                    ? "text-inherit"
                    : "text-zinc-400 group-hover/btn:text-zinc-900 dark:group-hover/btn:text-white",
                )}
              />
              {item.label}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {allowedChildren.map((subItem) => {
            const isSubActive = pathname === subItem.href;
            return (
              <DropdownMenuItem key={subItem.href} asChild>
                <Link
                  href={subItem.href}
                  data-testid={`nav-${slugify(item.label)}-${slugify(subItem.label)}-link`}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 cursor-pointer my-1",
                    isSubActive && "bg-zinc-100 dark:bg-zinc-800",
                  )}
                >
                  {subItem.label}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </SuiItem>
  );
};

/**
 * Renders an accordion-style collapsible menu for items with children.
 * This is used when the sidebar is fully expanded.
 */
const ExpandedCollapsibleMenu = ({
  item,
  isActive,
  allowedChildren,
  pathname,
}: MenuWithChildrenProps) => {
  const Icon = item.icon;

  return (
    <Collapsible asChild defaultOpen={isActive} className="group/collapsible">
      <SuiItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            isActive={isActive}
            tooltip={item.label}
            data-testid={`nav-${slugify(item.label)}-link`}
            className={cn(
              "group/btn flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                : "text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-white",
            )}
          >
            <div className="flex items-center gap-3">
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform duration-200 group-hover/btn:scale-110",
                  isActive
                    ? "text-inherit"
                    : "text-zinc-400 group-hover/btn:text-zinc-900 dark:group-hover/btn:text-white",
                )}
              />
              <span>{item.label}</span>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 text-zinc-400" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className="py-1.5">
          <SidebarMenuSub>
            {allowedChildren.map((subItem) => {
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
                        : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white",
                    )}
                  >
                    <Link
                      href={subItem.href}
                      data-testid={`nav-${slugify(item.label)}-${slugify(subItem.label)}-link`}
                    >
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
};

// ============================================================================
// Main Component
// ============================================================================

/**
 * AppSidebarMenu Component
 *
 * Orchestrates the rendering of the sidebar navigation menu based on user permissions
 * and the current sidebar state (collapsed vs expanded).
 */
export function AppSidebarMenu({ user }: AppSidebarMenuProps) {
  const pathname = usePathname();
  const { state } = useSidebar();

  // Cast the imported configuration to our strictly defined MenuItem array
  const rawMenuItems = sidebarMenuItems as MenuItem[];

  // Filter top-level menu items based on user authorization
  const allowedItems = rawMenuItems.filter((item) => isUserAllowed(item, user));

  return (
    <SidebarContent className="py-4">
      <SidebarGroup>
        <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden px-4 text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
          Overview
        </SidebarGroupLabel>

        <SidebarGroupContent>
          <SidebarMenu className="px-2 space-y-1">
            {allowedItems.map((item) => {
              // Determine active states
              const hasActiveChild =
                item.children?.some((child) => pathname === child.href) ??
                false;
              const isActive = pathname === item.href || hasActiveChild;

              // Handle items that have children (Sub-menus)
              if (item.children && item.children.length > 0) {
                // Filter sub-items based on user authorization
                const allowedChildren = item.children.filter((sub) =>
                  isUserAllowed(sub, user),
                );

                // Render Flyout Menu if Sidebar is Collapsed
                if (state === "collapsed") {
                  return (
                    <CollapsedDropdownMenu
                      key={item.href}
                      item={item}
                      isActive={isActive}
                      allowedChildren={allowedChildren}
                      pathname={pathname}
                    />
                  );
                }

                // Render Accordion Menu if Sidebar is Expanded
                return (
                  <ExpandedCollapsibleMenu
                    key={item.href}
                    item={item}
                    isActive={isActive}
                    allowedChildren={allowedChildren}
                    pathname={pathname}
                  />
                );
              }

              // Handle Standard single items (No children)
              return (
                <StandardMenuItem
                  key={item.href}
                  item={item}
                  isActive={isActive}
                />
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}
