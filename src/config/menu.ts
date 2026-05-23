import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface SidebarSubMenuItem {
  href: string;
  label: string;
  icon?: LucideIcon;
  requiredRole?: "user" | "admin";
}

export interface SidebarMenuItem {
  href: string;
  label: string;
  icon: LucideIcon;
  requiredRole?: "user" | "admin";
  children?: SidebarSubMenuItem[];
}

export const sidebarMenuItems: SidebarMenuItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: ShoppingBag },
  { href: "/orders", label: "Orders", icon: CreditCard },
  {
    href: "/users",
    label: "Users",
    icon: Users,
    requiredRole: "admin", // Only accessible by admin role
    children: [
      { href: "/users", label: "List Users" },
      { href: "/users/create", label: "Create User" },
    ],
  },
  { href: "/settings", label: "Settings", icon: Settings },
];
