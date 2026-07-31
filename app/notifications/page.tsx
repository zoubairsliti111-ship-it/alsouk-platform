"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Bell,
  Check,
  Trash2,
  Search,
  Filter,
  Loader2,
  Inbox,
  ArrowLeft,
  Eye,
  Settings,
  X,
  MessageSquare,
  FileText,
  Heart,
  Share2,
  Tv
} from "lucide-react"
import { MarketplaceShell } from "@/components/marketplace/shell"
import { useLanguage } from "@/components/language-provider"
import { type Notification, type NotificationType } from "@/lib/domains/notification/types"

const localT = {
  en: {
    back: "Back",
    title: "Notifications Center",
    subtitle: "Stay updated with your latest B2B requests, messages, and followers on ALSOUK.",
    searchPlaceholder: "Search notifications by title or message...",
    all: "All Notifications",
    unread: "Unread Only",
    markAllRead: "Mark All as Read",
    deleteAll: "Clear All Notifications",
    emptyTitle: "Your Inbox is Empty",
    emptyDesc: "You don't have any notifications at the moment. When buyers interact with your products or send RFQs, they'll show up here.",
    loadMore: "Load More Notifications",
    noResults: "No matching notifications",
    noResultsDesc: "Try adjusting your filters or search terms.",
    delete: "Delete",
    loading: "Loading notifications...",
    filterByType: "Filter by type",
    types: {
      all: "All Types",
      messages: "Messages",
      rfqs: "RFQs Received",
      engagement: "Likes & Comments",
      social: "Followers",
      others: "System & Updates"
    }
  },
  fr: {
    back: "Retour",
    title: "Centre de Notifications",
    subtitle: "Restez informé des dernières demandes B2B, messages et abonnés sur ALSOUK.",
    searchPlaceholder: "Rechercher des notifications...",
    all: "Toutes les notifications",
    unread: "Non lues uniquement",
    markAllRead: "Tout marquer comme lu",
    deleteAll: "Vider toutes les notifications",
    emptyTitle: "Votre boîte de réception est vide",
    emptyDesc: "Vous n'avez pas de notifications pour le moment. Lorsque les acheteurs interagissent avec vos produits ou envoient des RFQ, ils s'afficheront ici.",
    loadMore: "Charger plus de notifications",
    noResults: "Aucune notification correspondante",
    noResultsDesc: "Essayez de modifier vos filtres ou termes de recherche.",
    delete: "Supprimer",
    loading: "Chargement des notifications...",
    filterByType: "Filtrer par type",
    types: {
      all: "Tous les types",
      messages: "Messages",
      rfqs: "RFQ reçues",
      engagement: "Mentions j'aime & Commentaires",
      social: "Abonnés",
      others: "Système & Mises à jour"
    }
  },
  ar: {
    back: "عودة",
    title: "مركز الإشعارات",
    subtitle: "تابع أحدث طلبات B2B والرسائل والمتابعين الجدد على منصة ألسوق.",
    searchPlaceholder: "البحث في الإشعارات بالعنوان أو النص...",
    all: "كل الإشعارات",
    unread: "غير المقروءة فقط",
    markAllRead: "تحديد الكل كمقروء",
    deleteAll: "مسح جميع الإشعارات",
    emptyTitle: "علبة الوارد فارغة",
    emptyDesc: "لا توجد لديك أي إشعارات حالياً. عندما يتفاعل المشترون مع منتجاتك أو يرسلون طلبات عروض أسعار، ستظهر هنا.",
    loadMore: "تحميل المزيد من الإشعارات",
    noResults: "لا توجد نتائج مطابقة",
    noResultsDesc: "يرجى تعديل الفلاتر أو عبارة البحث والمحاولة مرة أخرى.",
    delete: "حذف",
    loading: "جاري تحميل الإشعارات...",
    filterByType: "تصفية حسب النوع",
    types: {
      all: "جميع الأنواع",
      messages: "الرسائل",
      rfqs: "طلب عروض الأسعار",
      engagement: "التفاعلات والتعليقات",
      social: "المتابعون",
      others: "النظام والتحديثات"
    }
  }
}

function NotificationsScreen() {
  const { lang, dir } = useLanguage()
  const router = useRouter()
  const dict = localT[lang] || localT.en

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<"all" | "messages" | "rfqs" | "engagement" | "social" | "others">("all")
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Fetch notifications
  useEffect(() => {
    let active = true
    async function fetchInitialNotifications() {
      try {
        const res = await fetch("/api/notifications?limit=20")
        const data = await res.json()
        if (active && data.success) {
          setNotifications(data.data)
          setNextCursor(data.nextCursor)
        }
      } catch (err) {
        console.error("Failed to load notifications:", err)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }
    fetchInitialNotifications()
    return () => {
      active = false
    }
  }, [])

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/notifications/mark-all-read", { method: "POST" })
      const data = await res.json()
      if (data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err)
    }
  }

  const handleDeleteAll = async () => {
    if (!confirm("Are you sure you want to clear all notifications? This action cannot be undone.")) return
    try {
      const res = await fetch("/api/notifications", { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        setNotifications([])
        setNextCursor(null)
      }
    } catch (err) {
      console.error("Failed to clear notifications:", err)
    }
  }

  const handleMarkRead = async (id: string, currentRead: boolean) => {
    if (currentRead) return
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true })
      })
    } catch (err) {
      console.error("Failed to update read status:", err)
    }
  }

  const handleDelete = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    try {
      await fetch(`/api/notifications/${id}`, { method: "DELETE" })
    } catch (err) {
      console.error("Failed to delete notification:", err)
    }
  }

  const handleLoadMore = async () => {
    if (!nextCursor) return
    try {
      const res = await fetch(`/api/notifications?limit=20&cursor=${encodeURIComponent(nextCursor)}`)
      const data = await res.json()
      if (data.success) {
        setNotifications((prev) => [...prev, ...data.data])
        setNextCursor(data.nextCursor)
      }
    } catch (err) {
      console.error("Failed to load more notifications:", err)
    }
  }

  // Filter & Search Logic
  const filteredNotifications = notifications.filter((n) => {
    // 1. Unread Only filter
    if (unreadOnly && n.isRead) return false

    // 2. Type filter
    if (selectedTypeFilter === "messages") {
      if (n.type !== "message") return false
    } else if (selectedTypeFilter === "rfqs") {
      if (n.type !== "rfq_received" && n.type !== "rfq_reply") return false
    } else if (selectedTypeFilter === "engagement") {
      if (n.type !== "like" && n.type !== "comment" && n.type !== "mention") return false
    } else if (selectedTypeFilter === "social") {
      if (n.type !== "follower") return false
    } else if (selectedTypeFilter === "others") {
      if (["message", "rfq_received", "rfq_reply", "like", "comment", "mention", "follower"].includes(n.type)) return false
    }

    // 3. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const titleMatch = n.title.toLowerCase().includes(q)
      const bodyMatch = n.body.toLowerCase().includes(q)
      return titleMatch || bodyMatch
    }

    return true
  })

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6" dir={dir}>
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-xs font-black text-muted-foreground hover:text-foreground transition-all cursor-pointer"
      >
        <ArrowLeft className="size-4 rtl:rotate-180" />
        <span>{dict.back}</span>
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            {dict.title}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
            {dict.subtitle}
          </p>
        </div>
        {notifications.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/15 border border-primary/20 text-xs font-black text-primary transition-all shadow-xs cursor-pointer"
            >
              <Check className="size-4" />
              <span>{dict.markAllRead}</span>
            </button>
            <button
              onClick={handleDeleteAll}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-destructive/10 hover:bg-destructive/15 border border-destructive/20 text-xs font-black text-destructive transition-all shadow-xs cursor-pointer"
            >
              <Trash2 className="size-4" />
              <span>{dict.deleteAll}</span>
            </button>
          </div>
        )}
      </div>

      {/* Filters and Search Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Search bar */}
        <div className="relative md:col-span-2">
          <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={dict.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full ps-10 pe-4 py-3 text-xs font-semibold rounded-xl border border-border bg-card focus:border-primary focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute end-3 top-1/2 -translate-y-1/2 size-5 rounded-md hover:bg-secondary flex items-center justify-center text-muted-foreground cursor-pointer"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        {/* Toggle Unread filter */}
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setUnreadOnly((prev) => !prev)}
            className={`w-full md:w-auto flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              unreadOnly
                ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/10"
                : "border-border bg-card hover:bg-secondary/40 text-foreground"
            }`}
          >
            <Filter className="size-3.5" />
            <span>{dict.unread}</span>
          </button>
        </div>
      </div>

      {/* Type Filter Rails */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1 border-b border-border/30">
        {[
          { id: "all", label: dict.types.all },
          { id: "messages", label: dict.types.messages },
          { id: "rfqs", label: dict.types.rfqs },
          { id: "engagement", label: dict.types.engagement },
          { id: "social", label: dict.types.social },
          { id: "others", label: dict.types.others }
        ].map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedTypeFilter(type.id as any)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedTypeFilter === type.id
                ? "bg-foreground text-background"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground font-semibold">{dict.loading}</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="rounded-[20px] border border-border bg-card p-12 text-center max-w-xl mx-auto space-y-4">
            <div className="flex size-14 items-center justify-center rounded-3xl bg-secondary/80 text-muted-foreground mx-auto">
              <Inbox className="size-6" />
            </div>
            <h3 className="text-lg font-black text-foreground">
              {searchQuery || unreadOnly || selectedTypeFilter !== "all" ? dict.noResults : dict.emptyTitle}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {searchQuery || unreadOnly || selectedTypeFilter !== "all" ? dict.noResultsDesc : dict.emptyDesc}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleMarkRead(n.id, n.isRead)}
                className={`group relative rounded-[20px] border p-4 sm:p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer ${
                  n.isRead
                    ? "border-border/60 bg-card text-muted-foreground"
                    : "border-primary/20 bg-primary/5 text-foreground ring-2 ring-primary/5"
                }`}
              >
                <div className="flex items-start gap-4">
                  {n.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={n.imageUrl}
                      alt=""
                      className="size-11 rounded-xl object-cover border border-border shrink-0"
                    />
                  ) : (
                    <div className="size-11 rounded-xl bg-secondary/80 flex items-center justify-center border border-border shrink-0 text-xl shadow-xs">
                      {n.type === "follower" && <Share2 className="size-5 text-blue-500" />}
                      {n.type === "message" && <MessageSquare className="size-5 text-indigo-500" />}
                      {n.type === "rfq_received" && <FileText className="size-5 text-emerald-500" />}
                      {n.type === "rfq_reply" && <FileText className="size-5 text-emerald-500" />}
                      {n.type === "comment" && <MessageSquare className="size-5 text-amber-500" />}
                      {n.type === "like" && <Heart className="size-5 text-rose-500" />}
                      {n.type === "mention" && <Check className="size-5 text-purple-500" />}
                      {n.type === "live_started" && <Tv className="size-5 text-red-500 animate-pulse" />}
                      {n.type === "product_published" && <FileText className="size-5 text-sky-500" />}
                      {n.type === "order_status" && <FileText className="size-5 text-blue-500" />}
                      {n.type === "announcement" && <Bell className="size-5 text-yellow-500" />}
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-black tracking-tight">{n.title}</h4>
                      {!n.isRead && (
                        <span className="size-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="text-xs font-semibold leading-relaxed line-clamp-3 max-w-2xl">{n.body}</p>
                    <span className="text-[10px] text-muted-foreground block">
                      {new Date(n.createdAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}{" "}
                      at{" "}
                      {new Date(n.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {n.actionUrl && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMarkRead(n.id, n.isRead)
                        startTransition(() => {
                          router.push(n.actionUrl!)
                        })
                      }}
                      className="p-2.5 rounded-xl border border-border hover:bg-secondary/60 text-foreground hover:text-primary transition-all cursor-pointer"
                      title="View detail"
                    >
                      <Eye className="size-4" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(n.id)
                    }}
                    className="p-2.5 rounded-xl border border-destructive/10 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all cursor-pointer"
                    title="Delete notification"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}

            {nextCursor && (
              <div className="text-center pt-4">
                <button
                  onClick={handleLoadMore}
                  className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl border border-border bg-card hover:bg-secondary/40 text-xs font-black text-foreground transition-all cursor-pointer shadow-xs"
                >
                  <span>{dict.loadMore}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  return (
    <MarketplaceShell>
      <NotificationsScreen />
    </MarketplaceShell>
  )
}
