"use client"

import { useState } from "react"
import { AlertCircle, Inbox, Loader2, Lock, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { directoryT } from "@/lib/directory-i18n"
import { fetchAdminRfqs, type RfqRow } from "@/lib/supabase/rfq-service"

type View = "locked" | "loading" | "loaded" | "unauthorized" | "unconfigured" | "error"

export function RfqAdmin() {
  const { lang } = useLanguage()
  const a = directoryT[lang].admin

  const [token, setToken] = useState("")
  const [view, setView] = useState<View>("locked")
  const [rfqs, setRfqs] = useState<RfqRow[]>([])

  async function load(currentToken: string) {
    setView("loading")
    const res = await fetchAdminRfqs(currentToken)
    if (res.reason === "unauthorized") return setView("unauthorized")
    if (res.reason === "unconfigured") return setView("unconfigured")
    if (res.reason === "error") return setView("error")
    setRfqs(res.rfqs)
    setView("loaded")
  }

  function lock() {
    setToken("")
    setRfqs([])
    setView("locked")
  }

  if (view === "locked" || view === "unauthorized" || view === "unconfigured") {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock className="size-6" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-foreground">{a.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{a.lockedHint}</p>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (token.trim()) load(token.trim())
            }}
            className="mt-5 space-y-3"
          >
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-foreground">{a.tokenLabel}</span>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder={a.tokenPlaceholder}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                autoComplete="off"
              />
            </label>
            {view === "unauthorized" && (
              <p role="alert" className="text-sm text-destructive">
                {a.unauthorized}
              </p>
            )}
            {view === "unconfigured" && (
              <p role="alert" className="text-sm text-destructive">
                {a.unconfigured}
              </p>
            )}
            <Button type="submit" disabled={!token.trim()} className="w-full">
              {a.unlock}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{a.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {a.subtitle}
            {view === "loaded" && ` · ${a.count(rfqs.length)}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => load(token)} disabled={view === "loading"} className="gap-2">
            <RefreshCw className={`size-4 ${view === "loading" ? "animate-spin" : ""}`} />
            {a.refresh}
          </Button>
          <Button variant="ghost" onClick={lock}>
            {a.signOut}
          </Button>
        </div>
      </div>

      {view === "loading" && (
        <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          {a.loading}
        </div>
      )}

      {view === "error" && (
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <AlertCircle className="size-8 text-destructive" />
          <p className="text-sm text-muted-foreground">{a.error}</p>
          <Button variant="outline" onClick={() => load(token)}>
            {a.refresh}
          </Button>
        </div>
      )}

      {view === "loaded" && rfqs.length === 0 && (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-24 text-center">
          <Inbox className="size-8 text-muted-foreground" />
          <div>
            <p className="font-semibold text-foreground">{a.emptyTitle}</p>
            <p className="mt-1 text-sm text-muted-foreground">{a.emptyBody}</p>
          </div>
        </div>
      )}

      {view === "loaded" && rfqs.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[64rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-2.5 font-semibold">{a.colDate}</th>
                <th className="px-3 py-2.5 font-semibold">{a.colSupplier}</th>
                <th className="px-3 py-2.5 font-semibold">{a.colBuyer}</th>
                <th className="px-3 py-2.5 font-semibold">{a.colContact}</th>
                <th className="px-3 py-2.5 font-semibold">{a.colProduct}</th>
                <th className="px-3 py-2.5 font-semibold">{a.colQuantity}</th>
                <th className="px-3 py-2.5 font-semibold">{a.colTargetPrice}</th>
                <th className="px-3 py-2.5 font-semibold">{a.colDestination}</th>
                <th className="px-3 py-2.5 font-semibold">{a.colStatus}</th>
                <th className="px-3 py-2.5 font-semibold">{a.colMessage}</th>
              </tr>
            </thead>
            <tbody>
              {rfqs.map((rfq) => (
                <tr key={rfq.id} className="border-b border-border last:border-0 align-top">
                  <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                    {new Date(rfq.created_at).toLocaleDateString(lang, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-3 py-3 font-medium text-foreground">{rfq.supplier_name ?? "—"}</td>
                  <td className="px-3 py-3">
                    <div className="font-medium text-foreground">{rfq.company_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {rfq.contact_person} · {rfq.country}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-foreground">{rfq.email}</div>
                    <div className="text-xs text-muted-foreground">{rfq.phone}</div>
                  </td>
                  <td className="px-3 py-3 text-foreground">{rfq.product_requested}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-foreground">{rfq.quantity}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                    {rfq.target_price ?? "—"}
                  </td>
                  <td className="px-3 py-3 text-foreground">{rfq.delivery_destination}</td>
                  <td className="px-3 py-3">
                    <span className="inline-flex rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                      {rfq.status}
                    </span>
                  </td>
                  <td className="min-w-[16rem] px-3 py-3 text-muted-foreground">{rfq.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
