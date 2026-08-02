"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, LogIn, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { socialT } from "@/lib/social-i18n"
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/browser"

const inputClass =
  "h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"

export function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const { lang, dir } = useLanguage()
  const s = socialT[lang]
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get("redirect") || "/account"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState<"idle" | "working" | "confirm">("idle")
  const [error, setError] = useState<string | null>(null)

  const configured = isSupabaseConfigured()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!configured) {
      setError(s.authError)
      return
    }
    setStatus("working")
    setError(null)
    const sb = getSupabaseBrowserClient()
    try {
      if (mode === "signup") {
        const { data, error } = await sb.auth.signUp({ email, password })
        if (error) throw error
        if (!data.session) {
          setStatus("confirm")
          return
        }
      } else {
        const { error } = await sb.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
      router.push(redirect)
      router.refresh()
    } catch {
      setError(s.authError)
      setStatus("idle")
    }
  }

  const title = mode === "signup" ? s.authSignUpTitle : s.authSignInTitle
  const subtitle = mode === "signup" ? s.authSignUpSubtitle : s.authSignInSubtitle

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-12 sm:py-16" dir={dir}>
      <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {mode === "signup" ? <UserPlus className="size-6" /> : <LogIn className="size-6" />}
      </div>
      <h1 className="mt-5 text-2xl font-bold tracking-tight text-foreground">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>

      {status === "confirm" ? (
        <p className="mt-8 rounded-xl bg-secondary p-4 text-sm text-foreground">{s.checkEmail}</p>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
            {s.email}
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@company.com"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
            {s.password}
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="••••••••"
            />
          </label>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" size="lg" className="mt-1 h-11 text-sm" disabled={status === "working"}>
            {status === "working" ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {s.working}
              </>
            ) : mode === "signup" ? (
              s.signUp
            ) : (
              s.signIn
            )}
          </Button>
        </form>
      )}

      <p className="mt-6 text-sm text-muted-foreground">
        {mode === "signup" ? s.haveAccount : s.noAccount}{" "}
        <Link
          href={mode === "signup" ? "/login" : "/signup"}
          className="font-semibold text-primary hover:underline"
        >
          {mode === "signup" ? s.signIn : s.signUp}
        </Link>
      </p>
    </div>
  )
}
