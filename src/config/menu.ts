import {
  LayoutDashboard,
  ShoppingBag,
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
  { href: "/d", label: "Dashboard", icon: LayoutDashboard },
  { href: "/d/products", label: "Products", icon: ShoppingBag },
  {
    href: "/d/users",
    label: "Users",
    icon: Users,
    requiredRole: "admin", // Only accessible by admin role
    children: [
      { href: "/d/users", label: "List Users" },
      { href: "/d/users/create", label: "Create User" },
    ],
  },
  { href: "/d/settings", label: "Settings", icon: Settings },
];
