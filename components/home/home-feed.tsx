"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Heart,
  MessageCircle,
  Share2,
  BadgeCheck,
  Calendar,
  Loader2,
  Play,
  RotateCcw,
  WifiOff,
  Store,
  Layers,
  Sparkles,
  ArrowRight
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { type CommercialPost } from "@/lib/domains/post/types"
import { fetchFeedPostsCursor } from "@/lib/services/posts-service"

export function HomeFeed() {
  const { lang, dir } = useLanguage()

  // Tab Filtering
  const [activeFilter, setActiveFilter] = useState<"all" | "following" | "nearby" | "categories">("all")

  // Feed Data States
  const [posts, setPosts] = useState<CommercialPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cursor, setCursor] = useState<string | undefined>(undefined)
  const [hasMore, setHasMore] = useState(true)
  const [fetchingMore, setFetchingMore] = useState(false)
  const [isOffline, setIsOffline] = useState(false)

  // Sentinel ref for infinite scroll observer
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  // Track offline status dynamically
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine)
      const handleOnline = () => setIsOffline(false)
      const handleOffline = () => setIsOffline(true)
      window.addEventListener("online", handleOnline)
      window.addEventListener("offline", handleOffline)
      return () => {
        window.removeEventListener("online", handleOnline)
        window.removeEventListener("offline", handleOffline)
      }
    }
  }, [])

  // Load posts dynamically with cursor
  const loadPosts = useCallback(async (currentCursor?: string, isRetry = false) => {
    if (isRetry) {
      setError(null)
    }

    if (!currentCursor) {
      setLoading(true)
    } else {
      setFetchingMore(true)
    }

    try {
      if (typeof window !== "undefined" && !navigator.onLine) {
        setIsOffline(true)
        setLoading(false)
        setFetchingMore(false)
        return
      }

      const limit = 4
      const res = await fetchFeedPostsCursor(limit, currentCursor)

      if (res.success && res.data) {
        if (res.data.length < limit) {
          setHasMore(false)
        }
        if (!currentCursor) {
          setPosts(res.data)
        } else {
          setPosts((prev) => {
            // Filter duplicates defensively
            const existingIds = new Set(prev.map(p => p.id))
            const newPosts = res.data.filter(p => !existingIds.has(p.id))
            return [...prev, ...newPosts]
          })
        }
        setCursor(res.nextCursor || undefined)
      } else {
        setError(res.error || "Failed to load feed.")
      }
    } catch (err: any) {
      console.error("Home feed fetch failure:", err)
      setError(err.message || "An unexpected network error occurred.")
    } finally {
      setLoading(false)
      setFetchingMore(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    loadPosts(undefined)
  }, [loadPosts])

  // Setup IntersectionObserver for Infinite Scroll
  useEffect(() => {
    if (loading || fetchingMore || !hasMore || activeFilter !== "all" || isOffline) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadPosts(cursor)
        }
      },
      { rootMargin: "200px" }
    )

    const currentSentinel = sentinelRef.current
    if (currentSentinel) {
      observer.observe(currentSentinel)
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel)
      }
    }
  }, [loading, fetchingMore, hasMore, cursor, activeFilter, isOffline, loadPosts])

  // Trigger retry when network / offline error occurs
  const handleRetry = () => {
    loadPosts(undefined, true)
  }

  // Localized dictionaries
  const dict = {
    en: {
      title: "Commercial Feed Updates",
      subtitle: "Discover real-time updates, shipments, and wholesale catalogs directly from verified North African factories.",
      tabAll: "All Updates",
      tabFollowing: "Following",
      tabNearby: "Nearby",
      tabCategories: "Categories",
      followingPlaceholderTitle: "No suppliers followed yet",
      followingPlaceholderDesc: "Follow suppliers by opening their profiles to personalize your feed and get alerted on new stocks.",
      nearbyPlaceholderTitle: "Nearby updates filter",
      nearbyPlaceholderDesc: "Showing updates from suppliers closest to your city. Select your city to receive closer bulk deals.",
      categoriesPlaceholderTitle: "Browse updates by Category",
      categoriesPlaceholderDesc: "Filter supply announcements by Agriculture, Textiles, Leather, or Handicrafts.",
      visitStore: "Visit Storefront",
      viewProfile: "View Profile",
      moq: "MOQ",
      offlineTitle: "You are currently offline",
      offlineDesc: "Please check your network connection and retry loading the wholesale feed.",
      errorTitle: "Failed to load SOUKI feed",
      retry: "Retry Action",
      emptyTitle: "SOUKI feed is quiet today",
      emptyDesc: "No commercial updates have been published yet. Check back soon for wholesale announcements!",
      likes: "Likes",
      comments: "Comments",
      share: "Share",
      productRefLabel: "Featured Products Reference"
    },
    fr: {
      title: "Actualités Commerciales",
      subtitle: "Découvrez les arrivages, promotions et catalogues de gros directement depuis les usines vérifiées.",
      tabAll: "Tout",
      tabFollowing: "Abonnements",
      tabNearby: "À Proximité",
      tabCategories: "Catégories",
      followingPlaceholderTitle: "Aucun fournisseur suivi",
      followingPlaceholderDesc: "Suivez des usines pour personnaliser votre flux et recevoir des alertes d'arrivages.",
      nearbyPlaceholderTitle: "Mises à jour à proximité",
      nearbyPlaceholderDesc: "Affiche les offres les plus proches de votre ville. Ajustez votre profil pour voir les usines locales.",
      categoriesPlaceholderTitle: "Filtrer par Catégorie",
      categoriesPlaceholderDesc: "Découvrez les offres par secteur : Agroalimentaire, Textile, Artisanat ou Cuir.",
      visitStore: "Visiter la boutique",
      viewProfile: "Voir le profil",
      moq: "MOQ",
      offlineTitle: "Vous êtes hors ligne",
      offlineDesc: "Veuillez vérifier votre connexion internet et réessayer de charger les actualités.",
      errorTitle: "Échec du chargement du flux",
      retry: "Réessayer",
      emptyTitle: "Le flux SOUKI est calme aujourd'hui",
      emptyDesc: "Aucune annonce de gros n'a été publiée pour le moment. Revenez bientôt !",
      likes: "J'aime",
      comments: "Commentaires",
      share: "Partager",
      productRefLabel: "Produits Associés"
    },
    ar: {
      title: "أحدث المستجدات التجارية",
      subtitle: "اكتشف عروض الشحن، مستجدات المخزون، وكتالوجات البيع بالجملة مباشرة من المصانع المعتمدة.",
      tabAll: "الكل",
      tabFollowing: "المتابعة",
      tabNearby: "الأقرب إليك",
      tabCategories: "الفئات",
      followingPlaceholderTitle: "لم تتابع أي مصانع بعد",
      followingPlaceholderDesc: "قم بمتابعة المصنعين المفضلين لتخصيص جدولك وتلقي تنبيهات المخزون فورا.",
      nearbyPlaceholderTitle: "المستجدات القريبة منك",
      nearbyPlaceholderDesc: "عرض العروض التجارية الأقرب إلى مدينتك. حدد موقعك لتصفية الموردين المحليين.",
      categoriesPlaceholderTitle: "تصفح حسب الفئة",
      categoriesPlaceholderDesc: "تصفية المستجدات حسب قطاعات الزراعة، المنسوجات، الصناعات التقليدية، أو الجلود.",
      visitStore: "زيارة المتجر",
      viewProfile: "الملف التعريفي",
      moq: "أقل كمية",
      offlineTitle: "أنت غير متصل بالإنترنت حالياً",
      offlineDesc: "يرجى التحقق من اتصال الشبكة وإعادة المحاولة لتحميل العروض التجارية.",
      errorTitle: "فشل تحميل جدول العروض",
      retry: "إعادة المحاولة",
      emptyTitle: "الجدول التجاري هادئ اليوم",
      emptyDesc: "لم يتم نشر أي مستجدات تجارية بعد. تحقق لاحقاً لمشاهدة عروض البيع بالجملة!",
      likes: "إعجاب",
      comments: "تعليق",
      share: "مشاركة",
      productRefLabel: "المنتجات ذات الصلة"
    }
  }[lang] || dict.en

  return (
    <section id="home-feed" className="py-8 bg-background border-t border-border/40" dir={dir}>
      <div className="mx-auto max-w-xl px-4 sm:px-6">
        {/* Header Block */}
        <div className="text-center space-y-2 mb-6">
          <span className="inline-flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary px-3.5 py-1.5 rounded-full text-[11px] font-black tracking-wider uppercase">
            <Sparkles className="size-3.5 text-primary" />
            <span>SOUKI Social Loop</span>
          </span>
          <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            {dict.title}
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
            {dict.subtitle}
          </p>
        </div>

        {/* Dynamic Navigation Tabs (Filters) */}
        <div className="flex border-b border-border bg-secondary/15 rounded-2xl overflow-hidden p-1 gap-1 mb-6">
          {[
            { id: "all", label: dict.tabAll },
            { id: "following", label: dict.tabFollowing },
            { id: "nearby", label: dict.tabNearby },
            { id: "categories", label: dict.tabCategories }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`flex-1 py-2 px-1 text-[11px] font-black rounded-xl transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? "bg-card text-primary shadow-xs border border-border/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 1. Offline Banner State */}
        {isOffline && (
          <div className="p-6 rounded-[20px] border border-dashed border-amber-500/30 bg-amber-500/5 text-center space-y-4 animate-scale-up">
            <WifiOff className="size-10 text-amber-500 mx-auto" />
            <div>
              <h4 className="text-sm font-black text-foreground">{dict.offlineTitle}</h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto leading-normal">{dict.offlineDesc}</p>
            </div>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 text-white font-bold text-xs py-2.5 px-5 hover:opacity-90 transition-all cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              <span>{dict.retry}</span>
            </button>
          </div>
        )}

        {/* 2. Error State */}
        {!isOffline && error && (
          <div className="p-6 rounded-[20px] border border-dashed border-destructive/30 bg-destructive/5 text-center space-y-4 animate-scale-up">
            <WifiOff className="size-10 text-destructive mx-auto" />
            <div>
              <h4 className="text-sm font-black text-foreground">{dict.errorTitle}</h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto leading-normal">{error}</p>
            </div>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-1.5 rounded-xl bg-destructive text-white font-bold text-xs py-2.5 px-5 hover:opacity-90 transition-all cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              <span>{dict.retry}</span>
            </button>
          </div>
        )}

        {/* 3. Skeleton Loading State */}
        {!isOffline && !error && loading && (
          <div className="space-y-6">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div key={idx} className="p-5 rounded-[20px] border border-border bg-card space-y-4 animate-pulse">
                {/* Header Skeleton */}
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-xl bg-secondary" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 w-28 bg-secondary rounded-full" />
                    <div className="h-2 w-16 bg-secondary rounded-full" />
                  </div>
                </div>
                {/* Text Skeleton */}
                <div className="space-y-2">
                  <div className="h-2.5 w-full bg-secondary rounded-full" />
                  <div className="h-2.5 w-5/6 bg-secondary rounded-full" />
                </div>
                {/* Image Box Skeleton */}
                <div className="aspect-[4/3] rounded-2xl bg-secondary w-full" />
              </div>
            ))}
          </div>
        )}

        {/* 4. Tab Placeholders / Empty States */}
        {!isOffline && !error && !loading && (
          <div>
            {activeFilter === "following" && (
              <PlaceholderCard title={dict.followingPlaceholderTitle} desc={dict.followingPlaceholderDesc} />
            )}

            {activeFilter === "nearby" && (
              <PlaceholderCard title={dict.nearbyPlaceholderTitle} desc={dict.nearbyPlaceholderDesc} />
            )}

            {activeFilter === "categories" && (
              <PlaceholderCard title={dict.categoriesPlaceholderTitle} desc={dict.categoriesPlaceholderDesc} />
            )}

            {/* Core Feed List */}
            {activeFilter === "all" && (
              <div>
                {posts.length === 0 ? (
                  <div className="p-6 rounded-[20px] border border-dashed border-border bg-card text-center space-y-4 max-w-sm mx-auto">
                    <Store className="size-10 text-muted-foreground mx-auto" />
                    <div>
                      <h4 className="text-sm font-black text-foreground">{dict.emptyTitle}</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{dict.emptyDesc}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {posts.map((post, idx) => {
                      const hasImages = post.images && post.images.length > 0
                      const dateStr = new Date(post.createdAt).toLocaleDateString(
                        lang === "en" ? "en-US" : lang === "fr" ? "fr-FR" : "ar-TN",
                        { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
                      )

                      const companyName = post.company?.name || "Verified Supplier"
                      const logoUrl = post.company?.logoUrl
                      const companySlug = post.company?.slug

                      return (
                        <article
                          key={post.id}
                          className="p-5 rounded-[20px] border border-border bg-card shadow-xs transition-all duration-300 hover:shadow-md hover:border-primary/10 flex flex-col gap-4"
                        >
                          {/* Card Header: Brand identity */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {/* Logo with safe fallback initials */}
                              <div className="size-11 rounded-xl border border-border bg-white flex items-center justify-center overflow-hidden shrink-0">
                                {logoUrl ? (
                                  <Image
                                    src={logoUrl}
                                    alt={companyName}
                                    width={44}
                                    height={44}
                                    className="size-full object-contain p-1"
                                    loading="lazy"
                                  />
                                ) : (
                                  <span className="text-primary font-black text-base">
                                    {companyName.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              {/* Name & verification badge */}
                              <div>
                                <div className="flex items-center gap-1">
                                  {companySlug ? (
                                    <Link
                                      href={`/companies/${companySlug}`}
                                      className="text-xs font-black text-foreground hover:text-primary transition-colors hover:underline"
                                    >
                                      {companyName}
                                    </Link>
                                  ) : (
                                    <span className="text-xs font-black text-foreground">{companyName}</span>
                                  )}
                                  {post.company?.verified && (
                                    <BadgeCheck className="size-4 shrink-0 text-emerald-500 fill-emerald-500/10" />
                                  )}
                                </div>
                                <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1 mt-0.5">
                                  <Calendar className="size-3 text-muted-foreground" />
                                  <span>{dateStr}</span>
                                </p>
                              </div>
                            </div>

                            {/* View / Detail Action */}
                            {companySlug && (
                              <Link
                                href={`/companies/${companySlug}`}
                                className="size-8 rounded-lg border border-border hover:bg-secondary/40 flex items-center justify-center text-muted-foreground transition-all shrink-0 cursor-pointer"
                                title={dict.viewProfile}
                              >
                                <ArrowRight className="size-4 rtl:rotate-180" />
                              </Link>
                            )}
                          </div>

                          {/* Card Body: Caption Text */}
                          <p className="text-xs font-semibold text-foreground leading-relaxed whitespace-pre-wrap break-words">
                            {post.content}
                          </p>

                          {/* Post media preview (Optimized and snapped horizontally) */}
                          {hasImages && (
                            <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1">
                              {post.images.map((imgUrl, imgIdx) => (
                                <div
                                  key={imgIdx}
                                  className="relative aspect-[4/3] w-[280px] sm:w-[320px] shrink-0 snap-start overflow-hidden rounded-xl border border-border bg-secondary shadow-xs group"
                                >
                                  <Image
                                    src={imgUrl}
                                    alt={`${companyName} attached catalog photo`}
                                    fill
                                    sizes="(max-width: 640px) 280px, 320px"
                                    className="object-cover transition-transform duration-500 group-hover:scale-102"
                                    loading="lazy"
                                  />
                                  <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                  {/* Play symbol/ambient preview icon overlay */}
                                  <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="flex size-10 items-center justify-center rounded-full bg-white/30 backdrop-blur-xs">
                                      <Play className="size-4 fill-white text-white" />
                                    </span>
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Dynamic future-ready B2B Product references block */}
                          {companySlug && (
                            <div className="p-3.5 bg-secondary/35 rounded-xl border border-border/60 flex items-center justify-between gap-3 text-[11px] font-bold">
                              <span className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold">
                                <Layers className="size-3.5 text-primary shrink-0" />
                                <span>{dict.productRefLabel}</span>
                              </span>
                              <Link
                                href={`/stores/${companySlug}`}
                                className="text-primary hover:underline flex items-center gap-0.5 text-[10px] font-black"
                              >
                                <span>{dict.visitStore}</span>
                                <ArrowRight className="size-3 rtl:rotate-180" />
                              </Link>
                            </div>
                          )}

                          {/* Card Footer: Interactive interaction row placeholders */}
                          <div className="flex border-t border-border/40 pt-3.5 items-center justify-between text-muted-foreground text-[10px] font-bold">
                            <button className="flex items-center gap-1.5 hover:text-red-500 transition-all cursor-pointer">
                              <Heart className="size-4 shrink-0" />
                              <span>12 {dict.likes}</span>
                            </button>
                            <button className="flex items-center gap-1.5 hover:text-primary transition-all cursor-pointer">
                              <MessageCircle className="size-4 shrink-0" />
                              <span>4 {dict.comments}</span>
                            </button>
                            <button className="flex items-center gap-1.5 hover:text-foreground transition-all cursor-pointer">
                              <Share2 className="size-4 shrink-0" />
                              <span>{dict.share}</span>
                            </button>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                )}

                {/* Infinite Scroll Sentinel element */}
                {hasMore && posts.length > 0 && (
                  <div ref={sentinelRef} className="flex justify-center py-6">
                    <Loader2 className="size-6 animate-spin text-primary" />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  )
}

function PlaceholderCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="p-8 rounded-[20px] border border-dashed border-border bg-card text-center space-y-3 max-w-sm mx-auto animate-scale-up">
      <div className="size-11 rounded-2xl bg-secondary flex items-center justify-center mx-auto text-primary">
        <Store className="size-5" />
      </div>
      <div>
        <h4 className="text-xs font-black text-foreground">{title}</h4>
        <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed max-w-[240px] mx-auto">{desc}</p>
      </div>
    </div>
  )
}
