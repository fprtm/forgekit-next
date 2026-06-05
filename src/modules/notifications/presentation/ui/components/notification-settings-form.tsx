"use client"

import React, { useEffect, useState } from "react"
import { toast } from "sonner"
import { Bell, Mail, Smartphone, BadgeCheck, Loader2, ShieldCheck, Lock, Tag, Layers } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Switch } from "@/shared/components/ui/switch"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { getNotificationSettingsAction, updateNotificationSettingsAction } from "../../http/actions/notification.actions"
import type { NotificationType } from "../../../domain/entities/notification.entity"

interface SubscriptionsState {
  system: boolean;
  security: boolean;
  marketing: boolean;
  product: boolean;
  general: boolean;
}

const SUBSCRIPTION_ITEMS: { key: NotificationType; label: string; description: string; icon: React.ReactNode; mandatory: boolean }[] = [
  { key: "system", label: "System Notifications", description: "Platform updates and system announcements", icon: <Layers className="h-4 w-4 text-amber-600 dark:text-amber-400" />, mandatory: true },
  { key: "security", label: "Security Notifications", description: "Login alerts and security warnings", icon: <Lock className="h-4 w-4 text-red-600 dark:text-red-400" />, mandatory: true },
  { key: "marketing", label: "Marketing Notifications", description: "Promotions and offers", icon: <Tag className="h-4 w-4 text-pink-600 dark:text-pink-400" />, mandatory: false },
  { key: "product", label: "Product Notifications", description: "Product updates and inventory alerts", icon: <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />, mandatory: false },
  { key: "general", label: "General Notifications", description: "Other miscellaneous notifications", icon: <Bell className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />, mandatory: false },
]

export function NotificationSettingsForm() {
  const [email, setEmail] = useState(true)
  const [push, setPush] = useState(true)
  const [whatsapp, setWhatsapp] = useState(true)
  const [subscriptions, setSubscriptions] = useState<SubscriptionsState>({
    system: true,
    security: true,
    marketing: true,
    product: true,
    general: true,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const res = await getNotificationSettingsAction()
      if (res.success && res.data) {
        setEmail(res.data.email)
        setPush(res.data.push)
        setWhatsapp(res.data.whatsapp)
        setSubscriptions({
          system: res.data.system,
          security: res.data.security,
          marketing: res.data.marketing,
          product: res.data.product,
          general: res.data.general,
        })
      }
      setIsLoading(false)
    }
    load()
  }, [])

  function toggleSubscription(key: NotificationType) {
    setSubscriptions((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    try {
      const res = await updateNotificationSettingsAction({
        email,
        push,
        whatsapp,
        subscriptions: {
          marketing: subscriptions.marketing,
          product: subscriptions.product,
          general: subscriptions.general,
        },
      })
      if (res.success) {
        toast.success("Notification preferences updated")
      } else {
        toast.error(res.error || "Failed to update preferences")
      }
    } catch {
      toast.error("Failed to save notification preferences")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="border border-zinc-200/80 dark:border-zinc-800/80 shadow-md">
        <CardHeader>
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSave}>
      <Card className="border border-zinc-200/80 dark:border-zinc-800/80 shadow-md mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <Mail className="h-5 w-5 text-blue-500" />
            Delivery Channels
          </CardTitle>
          <CardDescription>
            Choose which channels you want to receive notifications on.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-semibold">Email Notifications</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Receive notifications via email
                </p>
              </div>
            </div>
            <Switch
              id="notif-email"
              checked={email}
              onCheckedChange={setEmail}
              disabled={isSaving}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/30">
                <BadgeCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-semibold">Push Notifications</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Receive in-app notifications inside the dashboard
                </p>
              </div>
            </div>
            <Switch
              id="notif-push"
              checked={push}
              onCheckedChange={setPush}
              disabled={isSaving}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/30">
                <Smartphone className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-semibold">WhatsApp Notifications</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Receive notifications via WhatsApp messages
                </p>
              </div>
            </div>
            <Switch
              id="notif-whatsapp"
              checked={whatsapp}
              onCheckedChange={setWhatsapp}
              disabled={isSaving}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-zinc-200/80 dark:border-zinc-800/80 shadow-md mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <Layers className="h-5 w-5 text-zinc-500" />
            Module Subscriptions
          </CardTitle>
          <CardDescription>
            Choose which types of notifications you want to receive.
            <span className="block text-xs text-muted-foreground mt-1">
              System and Security notifications are mandatory and cannot be disabled.
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {SUBSCRIPTION_ITEMS.map((item) => (
            <div key={item.key} className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.description}
                    {item.mandatory && <span className="ml-1 text-xs text-amber-500">(Required)</span>}
                  </p>
                </div>
              </div>
              <Switch
                id={`notif-sub-${item.key}`}
                checked={subscriptions[item.key]}
                onCheckedChange={() => toggleSubscription(item.key)}
                disabled={isSaving || item.mandatory}
              />
            </div>
          ))}
        </CardContent>
        <CardFooter className="border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/20 py-4">
          <Button
            type="submit"
            id="notif-settings-save-btn"
            disabled={isSaving}
            className="rounded-xl px-5 h-10 gap-2 cursor-pointer transition-all active:scale-[0.98] ml-auto"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Bell className="h-4 w-4" />
            )}
            <span>Save preferences</span>
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
