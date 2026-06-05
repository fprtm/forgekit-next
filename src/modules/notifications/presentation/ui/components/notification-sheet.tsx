"use client"

import React, { useEffect, useState, useRef, useCallback, startTransition } from "react"
import { useRouter } from "next/navigation"
import { Bell, CheckCheck, ShieldAlert, ShoppingBag, Info, Megaphone, Settings, AlertTriangle, AlertCircle, AlertOctagon } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet"
import { format } from "date-fns"
import { getNotificationsAction, getUnreadCountAction, markAsReadAction, markAllAsReadAction } from "../../http/actions/notification.actions"
import type { NotificationEntity, NotificationType, NotificationPriority } from "../../../domain/entities/notification.entity"

const typeConfig: Record<NotificationType, { icon: React.ElementType; label: string; color: string }> = {
  system: { icon: Settings, label: "System", color: "text-zinc-500" },
  security: { icon: ShieldAlert, label: "Security", color: "text-red-500" },
  marketing: { icon: Megaphone, label: "Marketing", color: "text-purple-500" },
  product: { icon: ShoppingBag, label: "Product", color: "text-blue-500" },
  general: { icon: Info, label: "General", color: "text-zinc-400" },
}

const priorityIcon: Record<NotificationPriority, { icon: React.ElementType; color: string }> = {
  low: { icon: AlertCircle, color: "text-zinc-400" },
  medium: { icon: AlertTriangle, color: "text-yellow-500" },
  high: { icon: AlertTriangle, color: "text-orange-500" },
  critical: { icon: AlertOctagon, color: "text-red-600" },
}

const PAGE_SIZE = 20

export function NotificationSheet() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<NotificationEntity[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const loadNotifications = useCallback(async (pageOffset: number, append = false) => {
    setLoading(true)
    const res = await getNotificationsAction(PAGE_SIZE, pageOffset)
    setLoading(false)

    if (!res.success) return

    if (res.data.length > PAGE_SIZE) {
      setHasMore(true)
      if (append) {
        setNotifications((prev) => [...prev, ...res.data.slice(0, PAGE_SIZE)])
      } else {
        setNotifications(res.data.slice(0, PAGE_SIZE))
      }
    } else {
      setHasMore(false)
      if (append) {
        setNotifications((prev) => [...prev, ...res.data])
      } else {
        setNotifications(res.data)
      }
    }
  }, [])

  useEffect(() => {
    const fetchCount = async () => {
      const countRes = await getUnreadCountAction()
      if (countRes.success) setUnreadCount(countRes.data)
    }
    fetchCount()
  }, [])

  useEffect(() => {
    if (!open) return

    startTransition(() => {
      setInitialLoading(true)
      setNotifications([])
    })

    const fetch = async () => {
      await loadNotifications(0, false)
      const countRes = await getUnreadCountAction()
      if (countRes.success) setUnreadCount(countRes.data)
      startTransition(() => setInitialLoading(false))
    }
    fetch()
  }, [open, loadNotifications])

  useEffect(() => {
    if (!open || !hasMore || loading) return

    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const nextOffset = notifications.length
          loadNotifications(nextOffset, true)
        }
      },
      { rootMargin: "200px" },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [open, hasMore, loading, notifications.length, loadNotifications])

  async function handleMarkAsRead(id: string) {
    await markAsReadAction(id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    )
    const countRes = await getUnreadCountAction()
    if (countRes.success) setUnreadCount(countRes.data)
    router.refresh()
  }

  async function handleMarkAllAsRead() {
    await markAllAsReadAction()
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
    router.refresh()
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] font-bold rounded-full"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-bold">Notifications</SheetTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs gap-1.5 text-blue-600 hover:text-blue-700"
                onClick={handleMarkAllAsRead}
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "No unread notifications"}
          </p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {initialLoading ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm font-medium text-muted-foreground">
                No notifications yet
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Notifications will appear here when something happens
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {notifications.map((notification) => {
                const TypeIcon = typeConfig[notification.type]?.icon ?? Info
                const PriorityIcon = priorityIcon[notification.priority]?.icon ?? AlertCircle
                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                    disabled={notification.read}
                    className={`w-full text-left px-6 py-4 transition-colors ${
                      notification.read
                        ? "bg-background hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30"
                        : "bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/30 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1.5 shrink-0">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            notification.read
                              ? "bg-zinc-300 dark:bg-zinc-600"
                              : "bg-blue-600"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <TypeIcon className={`h-3.5 w-3.5 shrink-0 ${typeConfig[notification.type]?.color ?? "text-zinc-400"}`} />
                            <span
                              className={`text-sm truncate ${
                                notification.read
                                  ? "text-muted-foreground"
                                  : "font-semibold text-foreground"
                              }`}
                            >
                              {notification.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <PriorityIcon className={`h-3 w-3 ${priorityIcon[notification.priority]?.color ?? "text-zinc-400"}`} />
                            <span className="text-[10px] text-muted-foreground">
                              {format(new Date(notification.createdAt), "MMM d, HH:mm")}
                            </span>
                          </div>
                        </div>
                        <p
                          className={`text-xs mt-0.5 line-clamp-2 ${
                            notification.read
                              ? "text-muted-foreground/60"
                              : "text-muted-foreground"
                          }`}
                        >
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
          {loading && (
            <div className="py-4 text-center text-sm text-muted-foreground">
              Loading more...
            </div>
          )}
          <div ref={sentinelRef} className="h-4" />
        </div>
      </SheetContent>
    </Sheet>
  )
}
