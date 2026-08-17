"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, BadgeCheck, Loader2, ShieldAlert } from "lucide-react"

type AdminCompany = {
  id: string
  name: string
  slug: string
  country: string | null
  city: string | null
  verified: boolean
  verification_tier: string | null
  created_at: string
}

type View = "loading" | "loaded" | "forbidden" | "error"

/**
 * Access itself is enforced server-side: the `/admin/*` middleware requires a
 * signed-in `admin_users` session before this page even renders, and
 * `/api/admin/companies` re-checks the same thing. No client-side token gate.
 */
export function CompaniesAdmin() {
  const [view, setView] = useState<View>("loading")
  const [companies, setCompanies] = useState<AdminCompany[]>([])
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = async () => {
    setView("loading")
    try {
      const res = await fetch("/api/admin/companies", { cache: "no-store" })
      if (res.status === 401 || res.status === 403) {
        setView("forbidden")
        return
      }
      if (!res.ok) {
        setView("error")
        return
      }
      const json = await res.json()
      setCompanies(json.companies || [])
      setView("loaded")
    } catch {
      setView("error")
    }
  }

  useEffect(() => {
    let active = true
    fetch("/api/admin/companies", { cache: "no-store" })
      .then(async (res) => {
        if (!active) return
        if (res.status === 401 || res.status === 403) {
          setView("forbidden")
          return
        }
        if (!res.ok) {
          setView("error")
          return
        }
        const json = await res.json()
        if (!active) return
        setCompanies(json.companies || [])
        setView("loaded")
      })
      .catch(() => {
        if (active) setView("error")
      })
    return () => {
      active = false
    }
  }, [])

  const toggleVerified = async (company: AdminCompany) => {
    setBusyId(company.id)
    const next = !company.verified
    try {
      const res = await fetch("/api/admin/companies", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ companyId: company.id, verified: next }),
      })
      if (res.ok) {
        setCompanies((prev) =>
          prev.map((c) => (c.id === company.id ? { ...c, verified: next, verification_tier: next ? "verified" : "basic" } : c)),
        )
      }
    } finally {
      setBusyId(null)
    }
  }

  if (view === "loading") {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (view === "forbidden" || view === "error") {
    const Icon = view === "forbidden" ? ShieldAlert : AlertCircle
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center space-y-3">
        <Icon className="mx-auto size-8 text-destructive" />
        <p className="text-sm text-muted-foreground">
          {view === "forbidden" ? "Admin access required." : "Couldn't load companies."}
        </p>
        {view === "error" && (
          <Button variant="outline" onClick={load}>
            Retry
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-foreground">Company Verification</h1>
        <Button variant="outline" size="sm" onClick={load}>
          Refresh
        </Button>
      </div>

      {companies.length === 0 ? (
        <p className="text-sm text-muted-foreground py-10 text-center">No companies yet.</p>
      ) : (
        <div className="space-y-2">
          {companies.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3.5"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black text-foreground truncate">{c.name}</span>
                  {c.verified && <BadgeCheck className="size-4 text-emerald-500 shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground">
                  {[c.city, c.country].filter(Boolean).join(", ") || "No location set"}
                </p>
              </div>
              <Button
                size="sm"
                variant={c.verified ? "outline" : "default"}
                disabled={busyId === c.id}
                onClick={() => toggleVerified(c)}
              >
                {busyId === c.id ? <Loader2 className="size-4 animate-spin" /> : c.verified ? "Unverify" : "Verify"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
