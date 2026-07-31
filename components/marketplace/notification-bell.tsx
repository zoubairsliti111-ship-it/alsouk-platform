"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, Check, Loader2, Inbox, ExternalLink } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { type Notification } from "@/lib/domains/notification/types"

const localT = {
  en: {
    title: "Notifications",
    empty: "No notifications yet",
    markAllRead: "Mark all read",
    viewAll: "View All",
    loadMore: "Load more",
    today: "Today",
    yesterday: "Yesterday",
    earlier: "Earlier",
    loading: "Loading..."
  },
  fr: {
    title: "Notifications",
    empty: "Aucune notification pour le moment",
    markAllRead: "Tout marquer lu",
    viewAll: "Tout voir",
    loadMore: "Charger plus",
    today: "Aujourd'hui",
    yesterday: "Hier",
    earlier: "Plus ancien",
    loading: "Chargement..."
  },
  ar: {
    title: "الإشعارات",
    empty: "لا توجد إشعارات بعد",
    markAllRead: "تحديد الكل كمقروء",
    viewAll: "عرض الكل",
    loadMore: "تحميل المزيد",
    today: "اليوم",
    yesterday: "أمس",
    earlier: "سابقاً",
    loading: "جارٍ التحميل..."
  }
}

export function NotificationBell() {
  const { lang, dir } = useLanguage()
  const router = useRouter()
  const dict = localT[lang] || localT.en

  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch unread count and initial page of notifications on mount/open
  useEffect(() => {
    let active = true

    async function loadData() {
      try {
        const countRes = await fetch("/api/notifications/unread-count")
        const countData = await countRes.json()
        if (active && countData.success) {
          setUnreadCount(countData.count)
        }

        if (isOpen) {
          if (active) setLoading(true)
          const listRes = await fetch("/api/notifications?limit=5")
          const listData = await listRes.json()
          if (active && listData.success) {
            setNotifications(listData.data)
            setNextCursor(listData.nextCursor)
          }
          if (active) setLoading(false)
        }
      } catch (err) {
        console.error("Failed to load notifications data:", err)
      }
    }

    loadData()

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/notifications/unread-count")
        const data = await res.json()
        if (active && data.success) {
          setUnreadCount(data.count)
        }
      } catch (err) {
        // ignore background error
      }
    }, 30000)

    return () => {
      active = false
      clearInterval(interval)
    }
  }, [isOpen])

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleToggle = () => {
    setIsOpen((prev) => !prev)
  }

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/notifications/mark-all-read", { method: "POST" })
      const data = await res.json()
      if (data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
        setUnreadCount(0)
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err)
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    // Optimistic update
    if (!notification.isRead) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))

      try {
        await fetch(`/api/notifications/${notification.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isRead: true })
        })
      } catch (err) {
        console.error("Failed to sync read status:", err)
      }
    }

    setIsOpen(false)

    if (notification.actionUrl) {
      startTransition(() => {
        router.push(notification.actionUrl!)
      })
    }
  }

  const handleLoadMore = async () => {
    if (!nextCursor) return
    try {
      const res = await fetch(`/api/notifications?limit=5&cursor=${encodeURIComponent(nextCursor)}`)
      const data = await res.json()
      if (data.success) {
        setNotifications((prev) => [...prev, ...data.data])
        setNextCursor(data.nextCursor)
      }
    } catch (err) {
      console.error("Failed to load more notifications:", err)
    }
  }

  // Group notifications helper
  const getGroupedNotifications = () => {
    const today: Notification[] = []
    const yesterday: Notification[] = []
    const earlier: Notification[] = []

    const todayDate = new Date()
    todayDate.setHours(0, 0, 0, 0)

    const yesterdayDate = new Date()
    yesterdayDate.setDate(yesterdayDate.getDate() - 1)
    yesterdayDate.setHours(0, 0, 0, 0)

    notifications.forEach((n) => {
      const date = new Date(n.createdAt)
      date.setHours(0, 0, 0, 0)

      if (date.getTime() === todayDate.getTime()) {
        today.push(n)
      } else if (date.getTime() === yesterdayDate.getTime()) {
        yesterday.push(n)
      } else {
        earlier.push(n)
      }
    })

    return { today, yesterday, earlier }
  }

  const { today, yesterday, earlier } = getGroupedNotifications()

  return (
    <div className="relative inline-block" ref={dropdownRef} dir={dir}>
      {/* Bell Button */}
      <button
        onClick={handleToggle}
        className="relative inline-flex size-9 items-center justify-center rounded-full border border-border/50 bg-card/50 text-foreground/80 hover:bg-secondary hover:text-primary transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Bell className="size-4" strokeWidth={2.2} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -end-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-primary-foreground ring-2 ring-background animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Card */}
      {isOpen && (
        <div className="absolute end-0 z-50 mt-2 w-80 sm:w-96 overflow-hidden rounded-[20px] border border-border bg-popover/95 backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 bg-secondary/20 px-4 py-3">
            <h3 className="text-xs font-black text-foreground">{dict.title}</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Check className="size-3" />
                <span>{dict.markAllRead}</span>
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-[350px] overflow-y-auto divide-y divide-border/40 scrollbar-none">
            {loading && notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-2">
                <Loader2 className="size-5 animate-spin text-primary" />
                <span className="text-[10px] text-muted-foreground">{dict.loading}</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-muted-foreground mb-3">
                  <Inbox className="size-5" />
                </div>
                <p className="text-xs font-semibold text-foreground">{dict.empty}</p>
              </div>
            ) : (
              <div className="p-1 space-y-3">
                {/* Today */}
                {today.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-black text-muted-foreground uppercase px-3 py-1 tracking-wider">
                      {dict.today}
                    </h4>
                    <div className="space-y-1">
                      {today.map((n) => (
                        <NotificationItem
                          key={n.id}
                          notification={n}
                          onClick={() => handleNotificationClick(n)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Yesterday */}
                {yesterday.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-black text-muted-foreground uppercase px-3 py-1 tracking-wider">
                      {dict.yesterday}
                    </h4>
                    <div className="space-y-1">
                      {yesterday.map((n) => (
                        <NotificationItem
                          key={n.id}
                          notification={n}
                          onClick={() => handleNotificationClick(n)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Earlier */}
                {earlier.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-black text-muted-foreground uppercase px-3 py-1 tracking-wider">
                      {dict.earlier}
                    </h4>
                    <div className="space-y-1">
                      {earlier.map((n) => (
                        <NotificationItem
                          key={n.id}
                          notification={n}
                          onClick={() => handleNotificationClick(n)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer view-all link */}
          <div className="border-t border-border/60 bg-secondary/10 flex items-center justify-between px-4 py-2.5">
            {nextCursor && (
              <button
                onClick={handleLoadMore}
                className="text-[10px] font-black text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {dict.loadMore}
              </button>
            )}
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-[10px] font-black text-primary hover:underline flex items-center gap-1 ms-auto"
            >
              <span>{dict.viewAll}</span>
              <ExternalLink className="size-2.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function NotificationItem({
  notification,
  onClick
}: {
  notification: Notification
  onClick: () => void
}) {
  const isRead = notification.isRead

  return (
    <button
      onClick={onClick}
      className={`w-full text-start flex gap-3 p-3 rounded-xl transition-all cursor-pointer ${
        isRead
          ? "bg-transparent hover:bg-secondary/40 text-muted-foreground"
          : "bg-primary/5 hover:bg-primary/10 text-foreground border-s-2 border-primary"
      }`}
    >
      {notification.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={notification.imageUrl}
          alt=""
          className="size-8 rounded-lg object-cover shrink-0 border border-border"
        />
      ) : (
        <div className="size-8 rounded-lg bg-secondary/80 flex items-center justify-center shrink-0 border border-border text-sm">
          {notification.type === "follower" && "👤"}
          {notification.type === "message" && "✉️"}
          {notification.type === "rfq_received" && "📦"}
          {notification.type === "rfq_reply" && "✉️"}
          {notification.type === "comment" && "💬"}
          {notification.type === "like" && "❤️"}
          {notification.type === "mention" && "🏷️"}
          {notification.type === "live_started" && "🔴"}
          {notification.type === "product_published" && "🚀"}
          {notification.type === "order_status" && "📈"}
          {notification.type === "announcement" && "📢"}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h5 className="text-xs font-bold truncate">{notification.title}</h5>
        <p className="text-[10px] font-medium leading-relaxed mt-0.5 line-clamp-2">
          {notification.body}
        </p>
        <span className="text-[9px] text-muted-foreground block mt-1">
          {new Date(notification.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          })}
        </span>
      </div>
      {!isRead && (
        <span className="size-2 rounded-full bg-primary shrink-0 self-center" />
      )}
    </button>
  )
}
