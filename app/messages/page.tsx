"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MessageCircle, Building2 } from "lucide-react"
import { MarketplaceShell } from "@/components/marketplace/shell"
import { useLanguage } from "@/components/language-provider"
import { useAuth } from "@/components/auth-provider"
import type { ConversationSummary } from "@/lib/domains/message/types"

const LOCAL_I18N = {
  en: {
    title: "Messages",
    empty: "No conversations yet",
    emptyDesc: "When you contact a supplier or a buyer reaches out, your conversations will show up here.",
    signInTitle: "Sign in to see your messages",
    signInDesc: "Messages are tied to your account.",
    signIn: "Sign in",
  },
  fr: {
    title: "Messages",
    empty: "Aucune conversation pour l'instant",
    emptyDesc: "Vos conversations avec les fournisseurs et acheteurs apparaîtront ici.",
    signInTitle: "Connectez-vous pour voir vos messages",
    signInDesc: "Les messages sont liés à votre compte.",
    signIn: "Se connecter",
  },
  ar: {
    title: "الرسائل",
    empty: "لا توجد محادثات بعد",
    emptyDesc: "عندما تتواصل مع مورد أو يتواصل معك مشتري، ستظهر محادثاتك هنا.",
    signInTitle: "سجّل الدخول لعرض رسائلك",
    signInDesc: "الرسائل مرتبطة بحسابك.",
    signIn: "تسجيل الدخول",
  },
} as const

function timeAgo(iso: string, lang: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return lang === "ar" ? "الآن" : lang === "fr" ? "à l'instant" : "just now"
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

function MessagesScreen() {
  const { lang, dir } = useLanguage()
  const dict = LOCAL_I18N[lang as keyof typeof LOCAL_I18N] || LOCAL_I18N.en
  const { user, isLoading: authLoading } = useAuth()

  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading")
  const [conversations, setConversations] = useState<ConversationSummary[]>([])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setStatus("loaded")
      return
    }
    let active = true
    fetch("/api/messages")
      .then((res) => res.json())
      .then((json) => {
        if (!active) return
        if (json.success) {
          setConversations(json.data)
          setStatus("loaded")
        } else {
          setStatus("error")
        }
      })
      .catch(() => active && setStatus("error"))
    return () => {
      active = false
    }
  }, [user, authLoading])

  if (!authLoading && !user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center space-y-3" dir={dir}>
        <MessageCircle className="size-10 text-muted-foreground/60 mx-auto" />
        <h2 className="text-base font-black text-foreground">{dict.signInTitle}</h2>
        <p className="text-xs text-muted-foreground">{dict.signInDesc}</p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-xs font-black text-white hover:opacity-90"
        >
          {dict.signIn}
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6" dir={dir}>
      <h1 className="text-xl font-black text-foreground mb-5">{dict.title}</h1>

      {status === "loading" ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-secondary/40 animate-pulse" />
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <MessageCircle className="size-10 text-muted-foreground/60 mx-auto" />
          <h2 className="text-sm font-black text-foreground">{dict.empty}</h2>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">{dict.emptyDesc}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((c) => (
            <Link
              key={c.participant.userId}
              href={`/messages/${c.participant.userId}`}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 hover:bg-secondary/20 transition-all"
            >
              <div className="size-11 rounded-full bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                {c.participant.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.participant.avatarUrl} alt={c.participant.name} className="size-full object-cover" />
                ) : (
                  <Building2 className="size-5 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-foreground truncate">{c.participant.name}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo(c.lastMessageAt, lang)}</span>
                </div>
                <p className="text-[11px] text-muted-foreground truncate mt-0.5">{c.lastMessage}</p>
              </div>
              {c.unreadCount > 0 && (
                <span className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center">
                  {c.unreadCount}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function MessagesPage() {
  return (
    <MarketplaceShell>
      <MessagesScreen />
    </MarketplaceShell>
  )
}
