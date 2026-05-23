"use client";

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
  ShieldCheck
} from "lucide-react";
import { siteConfig } from "@/config/site";

export default function DashboardOverviewPage() {
  const stats = [
    {
      title: "Total Revenue",
      value: "$48,256.00",
      change: "+12.5% from last month",
      trend: "up",
      icon: CreditCard,
    },
    {
      title: "Active Users",
      value: "1,284",
      change: "+8.2% from last week",
      trend: "up",
      icon: UsersIcon,
    },
    {
      title: "Product Sales",
      value: "384",
      change: "+23.1% from yesterday",
      trend: "up",
      icon: ShoppingBag,
    },
    {
      title: "Active Subscriptions",
      value: "92",
      change: "+4.3% from last month",
      trend: "up",
      icon: TrendingUp,
    },
  ];

  const recentActivities = [
    { name: "Alice Vance", email: "alice.vance@example.com", action: "Created User profile", time: "2 hours ago", initial: "AV" },
    { name: "John Doe", email: "john.doe@example.com", action: "Updated Product stock", time: "4 hours ago", initial: "JD" },
    { name: "Sarah Connor", email: "sarah.c@example.com", action: "Configured Settings", time: "1 day ago", initial: "SC" },
  ];

  return (
    <div className="flex flex-col gap-8 w-full select-none max-w-7xl mx-auto">
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
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.title}
              className="group relative overflow-hidden rounded-2xl border border-zinc-200/60 bg-white p-6 shadow-sm dark:border-zinc-800/60 dark:bg-zinc-950/40 backdrop-blur-md transition-all hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  {stat.title}
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 transition-colors group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black">
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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Beautiful Dynamic CSS-based Weekly Activity Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200/60 bg-white p-6 shadow-sm dark:border-zinc-800/60 dark:bg-zinc-950/40 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-indigo-500" />
                Weekly Activity Overview
              </h3>
              <span className="text-xs text-zinc-400">7 Days Activity</span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Visualizing application transactions and operational metrics.
            </p>
          </div>

          {/* CSS Chart Rendering */}
          <div className="mt-8 flex items-end justify-between gap-2 h-48 px-2 border-b border-zinc-100 dark:border-zinc-800 pb-1">
            {[
              { day: "Mon", height: "45%", value: 12 },
              { day: "Tue", height: "70%", value: 18 },
              { day: "Wed", height: "55%", value: 15 },
              { day: "Thu", height: "90%", value: 24 },
              { day: "Fri", height: "60%", value: 16 },
              { day: "Sat", height: "35%", value: 9 },
              { day: "Sun", height: "80%", value: 21 },
            ].map((bar) => (
              <div key={bar.day} className="flex flex-col items-center flex-1 group">
                <div className="relative w-full flex justify-center">
                  {/* Tooltip on hover */}
                  <span className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-zinc-900 text-white text-[10px] font-semibold px-2 py-1 rounded-md pointer-events-none shadow-sm dark:bg-white dark:text-black">
                    {bar.value}k ops
                  </span>
                  <div 
                    style={{ height: bar.height }} 
                    className="w-8 rounded-t-lg bg-gradient-to-t from-zinc-200 to-zinc-900 dark:from-zinc-900 dark:to-zinc-200 transition-all duration-300 group-hover:scale-x-105 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] cursor-pointer"
                  />
                </div>
                <span className="text-[10px] font-medium text-zinc-400 mt-2">{bar.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="rounded-2xl border border-zinc-200/60 bg-white p-6 shadow-sm dark:border-zinc-800/60 dark:bg-zinc-950/40 backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-emerald-500 animate-pulse" />
              Recent Operations
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Live updates of actions within all modules.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-4 flex-1">
            {recentActivities.map((act, index) => (
              <div key={index} className="flex items-center justify-between gap-3 text-sm border-b border-zinc-100/50 dark:border-zinc-800/50 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 text-xs font-semibold">
                    {act.initial}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-zinc-900 dark:text-white truncate">
                      {act.name}
                    </span>
                    <span className="text-[10px] text-zinc-400 truncate">
                      {act.action}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-zinc-400 shrink-0">
                  {act.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Integrity & Core Architecture Status */}
      <div className="rounded-2xl border border-zinc-200/60 bg-white p-6 shadow-sm dark:border-zinc-800/60 dark:bg-zinc-950/40 backdrop-blur-md">
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
              <div key={item.layer} className="flex items-start gap-3 rounded-xl bg-zinc-50/50 p-4 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800/40">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900/5 text-zinc-600 dark:bg-white/5 dark:text-zinc-300">
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
    </div>
  );
}
