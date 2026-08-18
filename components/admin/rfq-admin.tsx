"use client"

import { useEffect, useState } from "react"
import { AlertCircle, Inbox, Loader2, RefreshCw, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { directoryT } from "@/lib/directory-i18n"
import { fetchAdminRfqs, type RfqRow } from "@/lib/supabase/rfq-service"

type View = "loading" | "loaded" | "forbidden" | "unconfigured" | "error"

/**
 * Access itself is enforced server-side: the `/admin/*` middleware requires a
 * signed-in `admin_users` session before this page even renders, and
 * `/api/admin/rfqs` re-checks the same thing. No client-side token gate.
 */
export function RfqAdmin() {
  const { lang } = useLanguage()
  const a = directoryT[lang].admin

  const [view, setView] = useState<View>("loading")
  const [rfqs, setRfqs] = useState<RfqRow[]>([])

  async function load() {
    setView("loading")
    const res = await fetchAdminRfqs()
    if (res.reason === "forbidden") return setView("forbidden")
    if (res.reason === "unconfigured") return setView("unconfigured")
    if (res.reason === "error") return setView("error")
    setRfqs(res.rfqs)
    setView("loaded")
  }

  useEffect(() => {
    let active = true
    fetchAdminRfqs().then((res) => {
      if (!active) return
      if (res.reason === "forbidden") return setView("forbidden")
      if (res.reason === "unconfigured") return setView("unconfigured")
      if (res.reason === "error") return setView("error")
      setRfqs(res.rfqs)
      setView("loaded")
    })
    return () => {
      active = false
    }
  }, [])

  if (view === "loading") {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (view === "forbidden" || view === "unconfigured" || view === "error") {
    const Icon = view === "forbidden" ? ShieldAlert : AlertCircle
    const message = view === "forbidden" ? a.unauthorized : view === "unconfigured" ? a.unconfigured : a.error
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center space-y-3">
        <Icon className="mx-auto size-8 text-destructive" />
        <p className="text-sm text-muted-foreground">{message}</p>
        {view === "error" && (
          <Button variant="outline" onClick={load}>
            {a.refresh}
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{a.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {a.subtitle} · {a.count(rfqs.length)}
          </p>
        </div>
        <Button variant="outline" onClick={load} className="gap-2">
          <RefreshCw className="size-4" />
          {a.refresh}
        </Button>
      </div>

      {rfqs.length === 0 && (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-24 text-center">
          <Inbox className="size-8 text-muted-foreground" />
          <div>
            <p className="font-semibold text-foreground">{a.emptyTitle}</p>
            <p className="mt-1 text-sm text-muted-foreground">{a.emptyBody}</p>
          </div>
        </div>
      )}

      {rfqs.length > 0 && (
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
