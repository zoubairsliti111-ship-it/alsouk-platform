"use client"

import Link from "next/link"
import { BarChart3, LineChart, Shield, Store, ArrowRight } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { MarketplaceShell, Breadcrumbs, ListingHeader } from "@/components/marketplace/shell"

export default function AnalyticsSelectorPage() {
  return (
    <MarketplaceShell>
      <AnalyticsSelectorContent />
    </MarketplaceShell>
  )
}

function AnalyticsSelectorContent() {
  const { t, dir } = useLanguage()

  return (
    <div className="pb-16" dir={dir}>
      <Breadcrumbs
        items={[
          { label: t.marketplace.breadcrumbHome, href: "/" },
          { label: t.nav.exhibitions, href: "/exhibitions" },
          { label: "Exhibition Analytics" },
        ]}
      />

      <div className="mx-auto max-w-4xl px-4 py-12">
        <ListingHeader
          title="Souk Exhibition Analytics"
          subtitle="Real-time performance metrics, B2B interaction tracking, and trade intelligence reports for organizers and exhibitors."
        />

        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Organizer card */}
          <div className="flex flex-col justify-between overflow-hidden rounded-[20px] border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
            <div>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-5">
                <BarChart3 className="size-6" />
              </div>
              <h2 className="text-xl font-black text-foreground tracking-tight">Organizer Workspace</h2>
              <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed font-semibold">
                Monitor global tradeshow statistics, application funnels, total visitors, scheduled B2B meetings, active pavilion booths, top performing categories, and visitor geographical origins.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-border/40">
              <Link
                href="/exhibitions/analytics/organizer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/95 px-4 py-3 text-xs font-black text-white transition-all min-h-11"
              >
                <span>Enter Organizer Analytics</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          {/* Exhibitor card */}
          <div className="flex flex-col justify-between overflow-hidden rounded-[20px] border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
            <div>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 mb-5">
                <LineChart className="size-6" />
              </div>
              <h2 className="text-xl font-black text-foreground tracking-tight">Exhibitor Dashboard</h2>
              <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed font-semibold">
                Analyze your virtual booth traffic, unique visitors, individual exhibit views, digital catalog PDF downloads, contact clicks (WhatsApp, Email, Web), and real-time B2B meeting submissions.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-border/40">
              <Link
                href="/exhibitions/analytics/exhibitor"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-3 text-xs font-black text-white transition-all min-h-11"
              >
                <span>Enter Exhibitor Analytics</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
