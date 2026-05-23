import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface SidebarMenuItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const sidebarMenuItems: SidebarMenuItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: ShoppingBag },
  { href: "/orders", label: "Orders", icon: CreditCard },
  { href: "/users", label: "Users", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];
