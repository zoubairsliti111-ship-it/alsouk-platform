"use client"

import { useEffect, useRef, useState } from "react"
import { Bot, Loader2, Search, Send, Sparkles, X } from "lucide-react"
import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"

type Msg = { role: "user" | "assistant"; content: string }
type Enabled = "unknown" | "on" | "off"

/**
 * Floating ALSOUK assistant. Pluggable + safely disabled: it asks the server
 * (`GET /api/ai`) whether a provider is configured. When enabled it chats via
 * `POST /api/ai`; when disabled it shows a helpful fallback with quick actions,
 * so it always answers "does this make business easier for merchants?".
 */
export function AssistantWidget() {
  const { t, dir } = useLanguage()
  const a = t.ai

  const [open, setOpen] = useState(false)
  const [enabled, setEnabled] = useState<Enabled>("unknown")
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState("")
  const [pending, setPending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Resolve availability the first time the panel opens.
  useEffect(() => {
    if (!open || enabled !== "unknown") return
    let active = true
    fetch("/api/ai", { cache: "no-store" })
      .then((r) => r.json())
      .then((j: { enabled?: boolean }) => {
        if (active) setEnabled(j.enabled ? "on" : "off")
      })
      .catch(() => {
        if (active) setEnabled("off")
      })
    return () => {
      active = false
    }
  }, [open, enabled])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, pending])

  // Allow other components (e.g. the homepage AI CTA) to open the assistant.
  useEffect(() => {
    function onOpen() {
      setOpen(true)
    }
    window.addEventListener("alsouk:open-assistant", onOpen)
    return () => window.removeEventListener("alsouk:open-assistant", onOpen)
  }, [])

  async function send() {
    const text = input.trim()
    if (!text || pending) return
    const next: Msg[] = [...messages, { role: "user", content: text }]
    setMessages(next)
    setInput("")
    setPending(true)
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next }),
      })
      if (!res.ok) throw new Error(String(res.status))
      const json = (await res.json()) as { reply?: string }
      setMessages((m) => [...m, { role: "assistant", content: json.reply ?? a.error }])
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: a.error }])
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={a.launch}
        aria-expanded={open}
        className="fixed bottom-20 end-4 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-primary-foreground shadow-lg transition-transform hover:scale-105 lg:bottom-5 lg:end-5"
      >
        {open ? <X className="size-5" /> : <Sparkles className="size-5" />}
        <span className="hidden text-sm font-semibold sm:inline">{a.launch}</span>
      </button>

      {open && (
        <div
          dir={dir}
          className="fixed bottom-36 end-4 z-50 flex h-[70vh] max-h-[560px] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl lg:bottom-20 lg:end-5"
          role="dialog"
          aria-label={a.title}
        >
          <div className="flex items-center gap-3 border-b border-border bg-secondary/40 p-4">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bot className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-foreground">{a.title}</p>
              <p className="truncate text-xs text-muted-foreground">{a.subtitle}</p>
            </div>
          </div>

          {enabled === "off" ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
                <Sparkles className="size-6" />
              </span>
              <div>
                <p className="font-semibold text-foreground">{a.disabledTitle}</p>
                <p className="mt-1 text-sm text-muted-foreground">{a.disabledBody}</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <Link
                  href="/search"
                  onClick={() => setOpen(false)}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  <Search className="size-4" />
                  {t.search.title}
                </Link>
                <Link
                  href="/rfq"
                  onClick={() => setOpen(false)}
                  className={buttonVariants({ size: "sm" })}
                >
                  {t.nav.rfq}
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
                <Bubble role="assistant" text={a.greeting} />
                {messages.map((m, i) => (
                  <Bubble key={i} role={m.role} text={m.content} />
                ))}
                {pending && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    {a.thinking}
                  </div>
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  send()
                }}
                className="flex items-center gap-2 border-t border-border p-3"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={a.placeholder}
                  aria-label={a.placeholder}
                  disabled={enabled === "unknown"}
                  className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <Button type="submit" size="icon" disabled={pending || !input.trim()} aria-label={a.send}>
                  <Send className="size-4" />
                </Button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  )
}

function Bubble({ role, text }: { role: "user" | "assistant"; text: string }) {
  const isUser = role === "user"
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-foreground"
        }`}
      >
        {text}
      </div>
    </div>
  )
}
