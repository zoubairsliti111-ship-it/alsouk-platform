"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Building2, MessageSquare, Store } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type FollowedStore = {
  id: string
  name: string
  logo_url: string | null
}

export function BuyerAccountView({
  name,
  avatarUrl,
  userId,
}: {
  name: string
  avatarUrl: string | null
  userId: string
}) {
  const [stores, setStores] = useState<FollowedStore[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const supabase = createClient()
    supabase
      .from("company_follows")
      .select("companies(id,name,logo_url)")
      .eq("user_id", userId)
      .then(({ data }: { data: any[] | null }) => {
        if (!active) return
        const list = (data ?? [])
          .map((row) => row.companies)
          .filter((c): c is FollowedStore => !!c)
        setStores(list)
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [userId])

  const initial = name.trim() ? name.trim().charAt(0).toUpperCase() : "U"

  return (
    <div className="w-full min-h-screen bg-secondary/5 pb-24">
      <div className="mx-auto max-w-2xl px-4 pt-8">
        <div className="flex flex-col items-center text-center gap-3">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={name} className="size-24 rounded-full object-cover border-4 border-card shadow-xl" />
          ) : (
            <div className="flex size-24 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-blue-600 text-3xl font-black text-white shadow-xl">
              {initial}
            </div>
          )}
          <h1 className="text-xl font-black text-foreground">{name}</h1>
        </div>

        <Link
          href="/messages"
          className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-black text-white shadow-lg hover:opacity-90"
        >
          <MessageSquare className="size-4" />
          Messages
        </Link>

        <div className="mt-8">
          <h2 className="text-sm font-black text-foreground flex items-center gap-2 mb-3">
            <Store className="size-4 text-primary" />
            Stores You Follow
          </h2>

          {loading ? (
            <div className="space-y-2">
              {[0, 1].map((i) => (
                <div key={i} className="h-16 rounded-2xl bg-card border border-border animate-pulse" />
              ))}
            </div>
          ) : stores.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center">
              <Building2 className="size-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground mb-3">
                You haven&apos;t followed any stores yet.
              </p>
              <Link
                href="/suppliers"
                className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-xs font-bold text-foreground hover:bg-secondary/80"
              >
                Browse Suppliers
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {stores.map((s) => (
                <Link
                  key={s.id}
                  href={`/suppliers/${s.id}`}
                  className="flex items-center gap-3 rounded-2xl bg-card border border-border p-3.5 hover:border-primary/30 transition-all"
                >
                  <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary border border-border">
                    {s.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.logo_url} alt={s.name} className="size-full object-cover" />
                    ) : (
                      <Building2 className="size-4.5 text-muted-foreground" />
                    )}
                  </div>
                  <span className="text-sm font-bold text-foreground truncate">{s.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
