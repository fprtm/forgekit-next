import React from "react";
import {
  Users as UsersIcon,
  ShoppingBag,
  FileText,
  ArrowUpRight,
  Database,
} from "lucide-react";
import { siteConfig } from "@/shared/config/site";
import Wrapper from "@/shared/components/layout/wrapper";
import { getDashboardStatsAction } from "../../http/actions/dashboard.actions";

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
  const statsResult = await getDashboardStatsAction();
  const totalUsersCount = statsResult.success ? statsResult.data.totalUsers : 0;
  const totalProductsCount = statsResult.success ? statsResult.data.totalProducts : 0;
  const totalAuditLogsCount = statsResult.success ? statsResult.data.totalAuditLogs : 0;
  const recentLogs = statsResult.success ? statsResult.data.recentLogs : [];

  const stats = [
    {
      title: "Total Users",
      value: totalUsersCount.toLocaleString(),
      icon: UsersIcon,
    },
    {
      title: "Total Products",
      value: totalProductsCount.toLocaleString(),
      icon: ShoppingBag,
    },
    {
      title: "Total Audit Logs",
      value: totalAuditLogsCount.toLocaleString(),
      icon: FileText,
    },
  ];

  const activities = recentLogs.slice(0, 5).map((log) => ({
    name: `${log.entityName}:${log.action}`,
    action: log.action,
    time: formatRelativeTime(log.createdAt),
    initial: log.entityName.substring(0, 2).toUpperCase(),
  }));

  return (
    <Wrapper>
      <div>
        <h1 className="page-title">Overview</h1>
        <p className="page-description mt-1.5">
          Welcome to the {siteConfig.name} operations control tower. Here is your summary.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
                  <Icon className="icon-sm" />
                </span>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
                  {stat.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded border border-zinc-200/60 bg-white p-6 shadow-sm dark:border-zinc-800/60 dark:bg-zinc-950/40 backdrop-blur-md">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <ArrowUpRight className="icon-md text-emerald-500" />
          Recent Activity
        </h3>
        <p className="text-xs text-zinc-400 mt-1">
          Latest audit log entries recorded in the database.
        </p>

        <div className="mt-6 flex flex-col gap-4.5">
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
            <div className="flex flex-col items-center justify-center text-zinc-400 text-xs py-8">
              <Database className="h-8 w-8 text-zinc-300 dark:text-zinc-700 mb-2" />
              No operations recorded.
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  );
}
