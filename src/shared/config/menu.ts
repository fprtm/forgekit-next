import { Action } from "@/modules/auth/domain/types";
import { routes } from "@/shared/config/routes";
import {
  LayoutDashboard,
  ShoppingBag,
  Settings,
  Users,
  UserCircle,
  Bell,
  type LucideIcon,
} from "lucide-react";

export interface SidebarSubMenuItem {
  href: string;
  label: string;
  icon?: LucideIcon;
  requiredAction?: Action;
}

export interface SidebarMenuItem {
  href: string;
  label: string;
  icon: LucideIcon;
  requiredAction?: Action;
  children?: SidebarSubMenuItem[];
}

export const sidebarMenuItems: SidebarMenuItem[] = [
  {
    href: routes.dashboard.root,
    label: "Dashboard",
    icon: LayoutDashboard
  },
  {
    href: routes.dashboard.products.list,
    label: "Products",
    icon: ShoppingBag,
    requiredAction: "products:read"
  },
  {
    href: routes.dashboard.users.root,
    label: "Users",
    icon: Users,
    requiredAction: "users:read",
    children: [
      {
        href: routes.dashboard.users.accounts,
        label: "Accounts",
        requiredAction: "users:read"
      },
      {
        href: routes.dashboard.users.admins,
        label: "Admins",
        requiredAction: "users:read"
      },
      {
        href: routes.dashboard.users.users,
        label: "Users",
        requiredAction: "users:read"
      },
    ],
  },
  {
    href: routes.dashboard.settings.root,
    label: "Settings",
    icon: Settings,
    children: [
      {
        href: routes.dashboard.settings.root,
        label: "General",
        icon: Settings,
      },
      {
        href: routes.dashboard.settings.notifications,
        label: "Notifications",
        icon: Bell,
      },
    ],
  }
];
