"use client"

import React, { useEffect, useState } from "react"
import {
  Bookmark,
  Loader2,
  Trash2,
  ExternalLink,
  Tag,
  Star
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { useAuth } from "@/components/auth-provider"
import { VisitorDashboardLayout } from "@/components/exhibition/visitor-layout"
import { MarketplaceShell } from "@/components/marketplace/shell"
import { fetchFavorites, removeFavoriteItem } from "@/lib/services/exhibitions-client"
import type { ExhibitionFavorite } from "@/lib/domains/exhibition/types"
import Link from "next/link"

export default function VisitorFavoritesPage() {
  return (
    <MarketplaceShell>
      <VisitorFavoritesContent />
    </MarketplaceShell>
  )
}

function VisitorFavoritesContent() {
  const { t, lang } = useLanguage()
  const exT = t.exhibitions
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<ExhibitionFavorite[]>([])

  useEffect(() => {
    if (authLoading || !user) return
    let active = true

    async function loadFavs() {
      try {
        const data = await fetchFavorites(user!.id)
        if (!active) return
        setFavorites(data || [])
        setLoading(false)
      } catch (err) {
        console.error("Load favorites failure:", err)
        if (active) setLoading(false)
      }
    }

    loadFavs()
    return () => {
      active = false
    }
  }, [authLoading, user])

  const handleRemove = async (targetType: "booth" | "exhibit", targetId: string) => {
    if (!user) return
    try {
      const res = await removeFavoriteItem(user.id, targetType, targetId)
      if (res) {
        setFavorites(prev => prev.filter(f => !(f.targetType === targetType && f.targetId === targetId)))
      }
    } catch (err) {
      console.error("Remove favorite item failure:", err)
    }
  }

  const boothFavs = favorites.filter((f) => f.targetType === "booth")
  const exhibitFavs = favorites.filter((f) => f.targetType === "exhibit")

  if (authLoading) {
    return (
      <VisitorDashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="size-8 text-primary animate-spin" />
          <span className="text-xs font-bold text-muted-foreground">{t.marketplace.loading}</span>
        </div>
      </VisitorDashboardLayout>
    )
  }

  if (!user) {
    return (
      <VisitorDashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <Bookmark className="size-10 text-muted-foreground" />
          <p className="text-xs font-bold text-muted-foreground max-w-xs">
            {lang === "ar"
              ? "سجّل الدخول لحفظ ومتابعة الأجنحة والمعروضات المفضلة لديك."
              : lang === "fr"
              ? "Connectez-vous pour enregistrer et suivre vos stands et produits favoris."
              : "Sign in to save and track your favorite booths and exhibits."}
          </p>
          <Link href="/login" className="mt-1 rounded-full bg-primary px-5 py-2 text-xs font-black text-white">
            {lang === "ar" ? "تسجيل الدخول" : lang === "fr" ? "Se connecter" : "Sign in"}
          </Link>
        </div>
      </VisitorDashboardLayout>
    )
  }

  if (loading) {
    return (
      <VisitorDashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="size-8 text-primary animate-spin" />
          <span className="text-xs font-bold text-muted-foreground">{t.marketplace.loading}</span>
        </div>
      </VisitorDashboardLayout>
    )
  }

  return (
    <VisitorDashboardLayout>
      <div className="space-y-8">

        {/* Intro */}
        <section className="bg-card border border-border rounded-[20px] p-6 shadow-xs">
          <h2 className="text-base font-black text-foreground flex items-center gap-2">
            <Bookmark className="size-5 text-amber-500" />
            <span>{lang === "ar" ? "أجنحتي ومعروضاتي المفضلة" : lang === "fr" ? "Mes Favoris" : "My Saved Bookmarks"}</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1.5 leading-normal">
            {lang === "ar"
              ? "استعرض وقارن بين أجنحة الشركات التي تفضلها ومعروضاتها الحصرية المسجلة في سجلاتك."
              : lang === "fr"
              ? "Parcourez et gérez les pavillons et les produits que vous avez enregistrés."
              : "Keep track of specific suppliers or target exhibits that you marked during the trade show."}
          </p>
        </section>

        {/* Saved Booths Section */}
        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground border-b border-border pb-2 flex items-center gap-2">
            <Star className="size-4 text-amber-500 fill-amber-500" />
            <span>{lang === "ar" ? "أجنحة الشركات المحفوظة" : lang === "fr" ? "Stands Enregistrés" : "Saved Booths & Pavilions"}</span>
            <span className="text-[10px] font-black text-primary">({boothFavs.length})</span>
          </h3>

          {boothFavs.length === 0 ? (
            <div className="text-center py-12 bg-secondary/10 rounded-2xl border border-dashed border-border text-xs text-muted-foreground italic">
              {lang === "ar" ? "لا توجد أجنحة محفوظة بعد." : lang === "fr" ? "Aucun stand enregistré pour le moment." : "No saved booths yet."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {boothFavs.map((fav) => {
                const b = fav.booth
                if (!b) return null
                return (
                  <div key={fav.id} className="p-4 bg-card border border-border rounded-[20px] shadow-3xs flex justify-between gap-4">
                    <div className="space-y-2 min-w-0">
                      <div>
                        <span className="text-[9px] font-black bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-full uppercase">
                          {b.boothNumber || "General"}
                        </span>
                        <h4 className="text-sm font-black text-foreground truncate mt-1">{b.title || b.company?.name || "Premium Exhibitor"}</h4>
                        <p className="text-[10px] text-muted-foreground font-semibold truncate">{b.category}</p>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-normal line-clamp-2">
                        {b.description}
                      </p>
                    </div>

                    <div className="flex flex-col justify-between items-end gap-3 shrink-0">
                      <button
                        onClick={() => handleRemove("booth", b.id)}
                        className="size-8 rounded-lg border border-border/80 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 text-muted-foreground flex items-center justify-center shrink-0 cursor-pointer min-h-11 transition-all"
                      >
                        <Trash2 className="size-4" />
                      </button>

                      <Link
                        href={`/exhibitions/tunisia-food-expo-2026/booths/${b.id}`}
                        className="size-8 rounded-lg bg-primary hover:bg-primary/95 text-white flex items-center justify-center shrink-0 cursor-pointer transition-all active:scale-95"
                      >
                        <ExternalLink className="size-4" />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Saved Exhibits Section */}
        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground border-b border-border pb-2 flex items-center gap-2">
            <Tag className="size-4 text-primary" />
            <span>{lang === "ar" ? "المعروضات والابتكارات الحصرية المحفوظة" : lang === "fr" ? "Produits Enregistrés" : "Saved Exhibits & Prototypes"}</span>
            <span className="text-[10px] font-black text-primary">({exhibitFavs.length})</span>
          </h3>

          {exhibitFavs.length === 0 ? (
            <div className="text-center py-12 bg-secondary/10 rounded-2xl border border-dashed border-border text-xs text-muted-foreground italic">
              {lang === "ar" ? "لا توجد معروضات محفوظة بعد." : lang === "fr" ? "Aucun produit enregistré pour le moment." : "No saved exhibits yet."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exhibitFavs.map((fav) => {
                const ex = fav.exhibit
                if (!ex) return null
                return (
                  <div key={fav.id} className="p-4 bg-card border border-border rounded-[20px] shadow-3xs flex justify-between gap-4">
                    <div className="space-y-2 min-w-0">
                      <div>
                        <span className="text-[9px] font-black bg-amber-500/10 border border-amber-500/20 text-amber-600 px-2 py-0.5 rounded uppercase">
                          {exT.featuredExhibit}
                        </span>
                        <h4 className="text-sm font-black text-foreground truncate mt-1">{ex.name}</h4>
                        <p className="text-[10px] text-muted-foreground font-semibold line-clamp-1">{ex.shortDescription}</p>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-normal line-clamp-2">
                        {ex.description}
                      </p>
                    </div>

                    <div className="flex flex-col justify-between items-end gap-3 shrink-0">
                      <button
                        onClick={() => handleRemove("exhibit", ex.id)}
                        className="size-8 rounded-lg border border-border/80 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 text-muted-foreground flex items-center justify-center shrink-0 cursor-pointer min-h-11 transition-all"
                      >
                        <Trash2 className="size-4" />
                      </button>

                      <Link
                        href={`/exhibitions/tunisia-food-expo-2026/booths/${ex.boothId}`}
                        className="size-8 rounded-lg bg-primary hover:bg-primary/95 text-white flex items-center justify-center shrink-0 cursor-pointer transition-all active:scale-95"
                      >
                        <ExternalLink className="size-4" />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

      </div>
    </VisitorDashboardLayout>
  )
}
