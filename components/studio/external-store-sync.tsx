"use client"

import { useCallback, useEffect, useState } from "react"
import { AlertCircle, CheckCircle, Loader2, RefreshCw, Store, X } from "lucide-react"
import type { ShopifyStatus } from "@/app/api/integrations/shopify/status/route"
import type { SyncResult } from "@/app/api/integrations/shopify/sync/route"

/**
 * Lets a merchant connect their existing Shopify store and pull the real
 * catalog into ALSOUK.
 *
 * The access token is typed here and POSTed once to our own server route,
 * which stores it out of reach of the browser. It is never read back: after
 * connecting, this component only ever sees the shop domain and sync status.
 */
export function ExternalStoreSync({ companyId }: { companyId: string }) {
  const [status, setStatus] = useState<ShopifyStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [shopDomain, setShopDomain] = useState("")
  const [accessToken, setAccessToken] = useState("")
  const [connecting, setConnecting] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SyncResult | null>(null)

  const fetchStatus = useCallback(async (): Promise<ShopifyStatus | null> => {
    try {
      const res = await fetch(`/api/integrations/shopify/status?companyId=${encodeURIComponent(companyId)}`, {
        cache: "no-store",
      })
      if (!res.ok) return null
      return (await res.json()) as ShopifyStatus
    } catch {
      return null
    }
  }, [companyId])

  const loadStatus = useCallback(async () => {
    const next = await fetchStatus()
    setStatus(next)
    setLoading(false)
  }, [fetchStatus])

  useEffect(() => {
    let active = true
    fetchStatus().then((next) => {
      if (!active) return
      setStatus(next)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [fetchStatus])

  const connect = async () => {
    setConnecting(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch("/api/integrations/shopify/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, shopDomain, accessToken }),
      })
      const body = (await res.json()) as { error?: string }
      if (!res.ok) {
        setError(body.error || "Could not connect this store.")
        return
      }
      setAccessToken("")
      setShopDomain("")
      setShowForm(false)
      await loadStatus()
    } catch {
      setError("Could not reach the server. Check your connection and try again.")
    } finally {
      setConnecting(false)
    }
  }

  const sync = async () => {
    setSyncing(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch("/api/integrations/shopify/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId }),
      })
      const body = await res.json()
      if (!res.ok) {
        setError((body as { error?: string }).error || "The sync failed.")
        return
      }
      setResult(body as SyncResult)
      await loadStatus()
    } catch {
      setError("Could not reach the server. Check your connection and try again.")
    } finally {
      setSyncing(false)
    }
  }

  const disconnect = async () => {
    setError(null)
    setResult(null)
    try {
      await fetch(`/api/integrations/shopify/connect?companyId=${encodeURIComponent(companyId)}`, { method: "DELETE" })
      await loadStatus()
    } catch {
      setError("Could not disconnect the store.")
    }
  }

  if (loading) {
    return (
      <div className="mb-4 flex items-center gap-2 rounded-2xl border border-border bg-card p-4">
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Checking your store connection…</span>
      </div>
    )
  }

  if (!status) return null

  return (
    <div className="mb-4 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
          <Store className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-foreground">Shopify store</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
            {status.connected
              ? `Connected to ${status.shopDomain}. Tap "Sync now" to bring your products into ALSOUK.`
              : "Already selling on Shopify? Connect your store and import your products in one tap."}
          </p>
        </div>
      </div>

      {status.connected && (
        <dl className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
          <div className="rounded-xl bg-secondary/40 px-3 py-2">
            <dt className="text-muted-foreground">Products imported</dt>
            <dd className="font-black text-foreground">{status.importedProducts}</dd>
          </div>
          <div className="rounded-xl bg-secondary/40 px-3 py-2">
            <dt className="text-muted-foreground">Last sync</dt>
            <dd className="font-black text-foreground">
              {status.lastSyncAt ? new Date(status.lastSyncAt).toLocaleString() : "Not synced yet"}
            </dd>
          </div>
        </dl>
      )}

      {status.connected && status.lastSyncStatus && status.lastSyncStatus !== "success" && status.lastSyncError && (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-[11px] font-semibold text-destructive">
          <AlertCircle className="mt-px size-3.5 shrink-0" />
          <span>{status.lastSyncError}</span>
        </p>
      )}

      {error && (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-[11px] font-semibold text-destructive">
          <AlertCircle className="mt-px size-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {result && (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-emerald-500/10 p-3 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle className="mt-px size-3.5 shrink-0" />
          <span>
            {result.imported} of {result.fetched} product{result.fetched === 1 ? "" : "s"} imported
            {result.failed > 0 ? ` — ${result.failed} failed, you can safely run the sync again.` : "."}
          </span>
        </p>
      )}

      {showForm && !status.connected && (
        <div className="mt-3 space-y-3">
          <div className="space-y-1.5">
            <label htmlFor="shopify-domain" className="text-[11px] font-bold text-muted-foreground">
              Store domain
            </label>
            <input
              id="shopify-domain"
              type="text"
              inputMode="url"
              autoComplete="off"
              value={shopDomain}
              onChange={(e) => setShopDomain(e.target.value)}
              placeholder="my-shop.myshopify.com"
              className="w-full rounded-xl border border-border bg-secondary/20 px-4 py-3 text-xs font-semibold focus:border-primary focus:bg-card focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="shopify-token" className="text-[11px] font-bold text-muted-foreground">
              Admin API access token
            </label>
            <input
              id="shopify-token"
              type="password"
              autoComplete="off"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="shpat_…"
              className="w-full rounded-xl border border-border bg-secondary/20 px-4 py-3 text-xs font-semibold focus:border-primary focus:bg-card focus:outline-none"
            />
            <p className="text-[10px] text-muted-foreground">
              In Shopify: Settings → Apps and sales channels → Develop apps → create an app with the{" "}
              <span className="font-bold">read_products</span> scope, then copy its Admin API access token. We store it
              securely on our servers and never show it again.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={connect}
              disabled={connecting || !shopDomain.trim() || !accessToken.trim()}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-black text-white disabled:opacity-50"
            >
              {connecting && <Loader2 className="size-3.5 animate-spin" />}
              {connecting ? "Connecting…" : "Connect store"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setError(null)
              }}
              className="rounded-xl bg-secondary px-4 py-2.5 text-xs font-bold text-foreground"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center gap-2">
        {status.connected ? (
          <>
            <button
              type="button"
              onClick={sync}
              disabled={syncing}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-black text-white disabled:opacity-50"
            >
              <RefreshCw className={`size-3.5 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Syncing…" : "Sync now"}
            </button>
            <button
              type="button"
              onClick={disconnect}
              disabled={syncing}
              className="rounded-xl bg-secondary px-4 py-2.5 text-xs font-bold text-foreground disabled:opacity-50"
            >
              Disconnect
            </button>
          </>
        ) : (
          !showForm && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-secondary px-4 py-2.5 text-xs font-black text-foreground"
            >
              <Store className="size-3.5" />
              Connect Shopify
            </button>
          )
        )}
      </div>
    </div>
  )
}
