"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BadgeCheck, Loader2 } from "lucide-react"

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

type View = "form" | "loading" | "loaded" | "error" | "unauthorized"

export function CompaniesAdmin() {
  const [token, setToken] = useState("")
  const [view, setView] = useState<View>("form")
  const [companies, setCompanies] = useState<AdminCompany[]>([])
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = async (t: string) => {
    setView("loading")
    try {
      const res = await fetch("/api/admin/companies", {
        headers: { authorization: `Bearer ${t}` },
        cache: "no-store",
      })
      if (res.status === 401) {
        setView("unauthorized")
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

  const toggleVerified = async (company: AdminCompany) => {
    setBusyId(company.id)
    const next = !company.verified
    try {
      const res = await fetch("/api/admin/companies", {
        method: "PATCH",
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
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

  if (view === "form" || view === "unauthorized") {
    return (
      <div className="mx-auto max-w-md px-4 py-16 space-y-4">
        <h1 className="text-xl font-black text-foreground">Admin — Company Verification</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (token.trim()) load(token.trim())
          }}
          className="space-y-3"
        >
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-foreground">Admin token</span>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste RFQ_ADMIN_TOKEN"
              className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
            />
          </label>
          {view === "unauthorized" && (
            <p className="text-xs font-bold text-destructive">Wrong token.</p>
          )}
          <Button type="submit" disabled={!token.trim()} className="w-full">
            Load companies
          </Button>
        </form>
      </div>
    )
  }

  if (view === "loading") {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (view === "error") {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center space-y-3">
        <p className="text-sm font-bold text-foreground">Couldn't load companies.</p>
        <Button variant="outline" onClick={() => load(token)}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-foreground">Company Verification</h1>
        <Button variant="outline" size="sm" onClick={() => load(token)}>
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
