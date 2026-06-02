import { Action } from "@/modules/auth/domain/types";
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
    href: "/d",
    label: "Dashboard",
    icon: LayoutDashboard
  },
  {
    href: "/d/products",
    label: "Products",
    icon: ShoppingBag,
    requiredAction: "products:read"
  },
  {
    href: "/d/users",
    label: "Users",
    icon: Users,
    requiredAction: "users:read",
    children: [
      {
        href: "/d/users/accounts",
        label: "Accounts",
        requiredAction: "users:read"
      },
      {
        href: "/d/users/admins",
        label: "Admins",
        requiredAction: "users:read"
      },
      {
        href: "/d/users/users",
        label: "Users",
        requiredAction: "users:read"
      },
    ],
  },
  {
    href: "/d/settings",
    label: "Settings",
    icon: Settings,
    children: [
      {
        href: "/d/settings/notifications",
        label: "Notifications",
        icon: Bell,
      },
    ],
  }
];
