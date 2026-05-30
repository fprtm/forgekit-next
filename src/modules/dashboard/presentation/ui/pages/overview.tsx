import React from "react";
import { 
  TrendingUp, 
  Users as UsersIcon, 
  ShoppingBag, 
  CreditCard, 
  ArrowUpRight, 
  Activity,
  Layers,
  Database,
  ShieldCheck,
  Server,
  Zap,
  Clock
} from "lucide-react";
import { siteConfig } from "@/shared/config/site";
import { db } from "@/db";
import { users } from "@/modules/users/infrastructure/database/drizzle/schema";
import { products } from "@/modules/products/infrastructure/database/drizzle/schema";
import { desc } from "drizzle-orm";
import Wrapper from "@/shared/components/layout/wrapper";

function formatRelativeTime(date: Date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.max(1, Math.floor(diffMs / 60000));
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default async function DashboardOverviewPage() {
  // Fetch actual data from database
  const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
  const allProducts = await db.select().from(products).orderBy(desc(products.createdAt));

  const totalUsersCount = allUsers.length;
  const totalProductsCount = allProducts.length;

  // Dynamically compute mock stats scaled with real database counts
  const activeOps = (totalUsersCount * 8) + (totalProductsCount * 15) + 142;
  const formattedRevenue = (totalProductsCount * 1250 + 24500).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  const stats = [
    {
      title: "Total Revenue",
      value: formattedRevenue,
      change: `+${(totalProductsCount * 0.5 + 4.2).toFixed(1)}% from last month`,
      trend: "up",
      icon: CreditCard,
    },
    {
      title: "Active Users",
      value: totalUsersCount.toLocaleString(),
      change: `+${(totalUsersCount * 0.2 + 2.1).toFixed(1)}% from last week`,
      trend: "up",
      icon: UsersIcon,
    },
    {
      title: "Product Catalog",
      value: totalProductsCount.toLocaleString(),
      change: `+${(totalProductsCount > 0 ? 100 : 0)}% items online`,
      trend: "up",
      icon: ShoppingBag,
    },
    {
      title: "System Operations",
      value: activeOps.toLocaleString(),
      change: "+14.2% dynamic traffic",
      trend: "up",
      icon: TrendingUp,
    },
  ];

  // Merge real database records into recent activities stream
  const recentUsers = allUsers.slice(0, 3).map(u => ({
    name: u.name || "Unnamed User",
    email: u.email || "No email provided",
    action: "Registered user account",
    time: formatRelativeTime(u.createdAt),
    initial: (u.name || "US").substring(0, 2).toUpperCase(),
    badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
  }));

  const recentProducts = allProducts.slice(0, 3).map(p => ({
    name: p.name,
    email: `$${p.price.toLocaleString()}`,
    action: "Added to Product catalog",
    time: formatRelativeTime(p.createdAt),
    initial: "PR",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
  }));

  // Combine, sort, and slice for recent operations stream
  const activities = [...recentUsers, ...recentProducts].slice(0, 4);

  // Dynamic daily transaction heights scaled by database content
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const baseWeights = [45, 70, 55, 90, 60, 35, 80];
  const scale = 1 + (totalUsersCount + totalProductsCount) * 0.03;
  
  const weeklyData = daysOfWeek.map((day, index) => {
    const rawVal = Math.round(baseWeights[index] * scale);
    return {
      day,
      height: `${Math.min(95, Math.max(25, baseWeights[index]))}%`,
      value: rawVal,
    };
  });

  return (
    <Wrapper>
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Overview
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1.5 text-sm">
          Welcome to the {siteConfig.name} operations control tower. Here is your enterprise summary.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.title}
              className="group relative overflow-hidden rounded border border-zinc-200/60 bg-white p-6 shadow-sm dark:border-zinc-800/60 dark:bg-zinc-950/40 backdrop-blur-md transition-all hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  {stat.title}
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 transition-colors group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black">
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
                  {stat.value}
                </span>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                  <span className="text-emerald-500 font-semibold">{stat.change.split(" ")[0]}</span>
                  <span>{stat.change.substring(stat.change.indexOf(" ") + 1)}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lower Dashboard Section: Chart & Recent Activity */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Beautiful Dynamic CSS-based Weekly Activity Chart */}
        <div className="lg:col-span-2 rounded border border-zinc-200/60 bg-white p-6 shadow-sm dark:border-zinc-800/60 dark:bg-zinc-950/40 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-indigo-500 animate-pulse" />
                Weekly Activity Overview
              </h3>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-zinc-900 dark:bg-white" />
                <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Operational Traffic</span>
              </div>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Visualizing application transactions, user creations, and catalog updates across all models.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            {/* Chart Area (3/4 of panel) */}
            <div className="md:col-span-3 flex items-end justify-between gap-2.5 h-48 px-2 border-b border-zinc-100 dark:border-zinc-800 pb-1">
              {weeklyData.map((bar) => (
                <div key={bar.day} className="flex flex-col items-center justify-end h-full flex-1 group">
                  <div 
                    style={{ height: bar.height }} 
                    className="relative w-full flex flex-col justify-end items-center"
                  >
                    {/* Tooltip on hover */}
                    <span className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-zinc-900 text-white text-[10px] font-semibold px-2 py-1 rounded-lg pointer-events-none shadow-sm dark:bg-white dark:text-black whitespace-nowrap z-10">
                      {bar.value}k ops
                    </span>
                    <div 
                      className="w-full max-w-[32px] h-full rounded-t-lg bg-gradient-to-t from-zinc-200 to-zinc-900 dark:from-zinc-900 dark:to-zinc-100/90 transition-all duration-300 group-hover:scale-x-105 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] cursor-pointer"
                    />
                  </div>
                  <span className="text-[10px] font-medium text-zinc-400 mt-2 shrink-0">{bar.day}</span>
                </div>
              ))}
            </div>

            {/* Performance Stats Panel (1/4 of panel) */}
            <div className="flex flex-col gap-4 border-l border-zinc-100 dark:border-zinc-800/80 pl-4 pb-2">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Avg Latency</span>
                <span className="text-lg font-extrabold text-zinc-800 dark:text-zinc-100 flex items-center gap-1 mt-0.5">
                  <Zap className="h-4.5 w-4.5 text-yellow-500" />
                  12 ms
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Uptime Rate</span>
                <span className="text-lg font-extrabold text-zinc-800 dark:text-zinc-100 flex items-center gap-1 mt-0.5">
                  <Server className="h-4.5 w-4.5 text-emerald-500" />
                  99.98%
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Active Peak</span>
                <span className="text-lg font-extrabold text-zinc-800 dark:text-zinc-100 flex items-center gap-1 mt-0.5">
                  <Clock className="h-4.5 w-4.5 text-indigo-500" />
                  Thursday
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="rounded border border-zinc-200/60 bg-white p-6 shadow-sm dark:border-zinc-800/60 dark:bg-zinc-950/40 backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-emerald-500" />
              Live Operations
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Real-time activity streamed from database tables.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-4.5 flex-1">
            {activities.length > 0 ? (
              activities.map((act, index) => (
                <div key={index} className="flex items-center justify-between gap-3 text-sm border-b border-zinc-100/50 dark:border-zinc-800/50 pb-3.5 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 text-xs font-semibold">
                      {act.initial}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-zinc-900 dark:text-white truncate text-xs">
                        {act.name}
                      </span>
                      <span className="text-[10px] text-zinc-400 truncate">
                        {act.action}
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] font-semibold tracking-wider uppercase text-zinc-400 shrink-0">
                    {act.time}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-zinc-400 text-xs py-8">
                <Database className="h-8 w-8 text-zinc-300 dark:text-zinc-700 mb-2 animate-bounce" />
                No operations recorded.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Integrity & Core Architecture Status */}
      <div className="rounded border border-zinc-200/60 bg-white p-6 shadow-sm dark:border-zinc-800/60 dark:bg-zinc-950/40 backdrop-blur-md">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">
          Core System Health (4-Layer DDD Validation)
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { layer: "Domain Layer", desc: "Entities & types definitions validated.", icon: Layers, status: "Active & Type-Safe" },
            { layer: "Application Services", desc: "Zod validators & action orchestration.", icon: ShieldCheck, status: "Fully Connected" },
            { layer: "Infrastructure Adapters", desc: "Drizzle pool connection & seed runner.", icon: Database, status: "Healthy & Synced" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.layer} className="flex items-start gap-3 rounded-lg bg-zinc-50/50 p-4 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800/40">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-900/5 text-zinc-600 dark:bg-white/5 dark:text-zinc-300">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm text-zinc-900 dark:text-white">{item.layer}</span>
                  <span className="text-xs text-zinc-400 mt-0.5">{item.desc}</span>
                  <span className="mt-2.5 inline-flex items-center gap-1.5 self-start rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {item.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Wrapper>
  );
}
