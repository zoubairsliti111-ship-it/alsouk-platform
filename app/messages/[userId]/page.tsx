"use client"

import { use, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Building2, Send, Loader2 } from "lucide-react"
import { MarketplaceShell } from "@/components/marketplace/shell"
import { useLanguage } from "@/components/language-provider"
import { useAuth } from "@/components/auth-provider"
import type { MessageItem, MessageParticipant } from "@/lib/domains/message/types"

const LOCAL_I18N = {
  en: { back: "Messages", placeholder: "Write a message...", empty: "Say hello to start the conversation.", loadError: "Couldn't load this conversation." },
  fr: { back: "Messages", placeholder: "Écrire un message...", empty: "Dites bonjour pour démarrer la conversation.", loadError: "Impossible de charger cette conversation." },
  ar: { back: "الرسائل", placeholder: "اكتب رسالة...", empty: "قل مرحبًا لبدء المحادثة.", loadError: "تعذّر تحميل هذه المحادثة." },
} as const

function ThreadScreen({ otherUserId }: { otherUserId: string }) {
  const { lang, dir } = useLanguage()
  const dict = LOCAL_I18N[lang as keyof typeof LOCAL_I18N] || LOCAL_I18N.en
  const { user } = useAuth()

  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading")
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [participant, setParticipant] = useState<MessageParticipant | null>(null)
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let active = true
    fetch(`/api/messages/${otherUserId}`)
      .then((res) => res.json())
      .then((json) => {
        if (!active) return
        if (json.success) {
          setMessages(json.data.messages)
          setParticipant(json.data.participant)
          setStatus("loaded")
        } else {
          setStatus("error")
        }
      })
      .catch(() => active && setStatus("error"))
    return () => {
      active = false
    }
  }, [otherUserId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = draft.trim()
    if (trimmed.length === 0 || sending) return
    setSending(true)
    setSendError(null)
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ receiverId: otherUserId, message: trimmed }),
      })
      const json = await res.json()
      if (json.success) {
        setMessages((prev) => [...prev, json.data])
        setDraft("")
      } else {
        setSendError(`${res.status}: ${json.error || "unknown error"}`)
      }
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "network error")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl flex flex-col h-[calc(100vh-8rem)]" dir={dir}>
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <Link href="/messages" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-5 rtl:rotate-180" />
        </Link>
        <div className="size-9 rounded-full bg-secondary flex items-center justify-center overflow-hidden shrink-0">
          {participant?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={participant.avatarUrl} alt={participant.name} className="size-full object-cover" />
          ) : (
            <Building2 className="size-4 text-muted-foreground" />
          )}
        </div>
        {participant?.companySlug ? (
          <Link href={`/companies/${participant.companySlug}`} className="text-sm font-black text-foreground hover:underline">
            {participant.name}
          </Link>
        ) : (
          <span className="text-sm font-black text-foreground">{participant?.name || "…"}</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {status === "loading" ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 w-2/3 rounded-2xl bg-secondary/40 animate-pulse" />
            ))}
          </div>
        ) : status === "error" ? (
          <p className="text-center text-xs text-muted-foreground py-10">{dict.loadError}</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground py-10">{dict.empty}</p>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === user?.id
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-xs font-medium whitespace-pre-wrap break-words ${
                    mine ? "bg-primary text-white rounded-br-sm" : "bg-secondary text-foreground rounded-bl-sm"
                  }`}
                >
                  {m.message}
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {sendError && (
        <p className="px-4 py-1.5 text-[10px] font-bold text-destructive bg-destructive/10">{sendError}</p>
      )}

      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border px-4 py-3">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={dict.placeholder}
          className="flex-1 rounded-full border border-border bg-secondary/15 px-4 py-2.5 text-xs outline-none focus:border-primary focus:bg-card transition-all"
        />
        <button
          type="submit"
          disabled={sending || draft.trim().length === 0}
          className="size-10 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-50 shrink-0"
        >
          {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4 rtl:-scale-x-100" />}
        </button>
      </form>
    </div>
  )
}

export default function ThreadPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params)
  return (
    <MarketplaceShell>
      <ThreadScreen otherUserId={userId} />
    </MarketplaceShell>
  )
}
