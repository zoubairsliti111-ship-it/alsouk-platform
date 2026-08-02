"use client"

import React, { useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bookmark,
  Calendar,
  History,
  QrCode,
  LayoutDashboard,
  ArrowLeft,
  UserCheck
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export interface VisitorDashboardLayoutProps {
  children: React.ReactNode
}

export function VisitorDashboardLayout({ children }: VisitorDashboardLayoutProps) {
  const { t, lang, dir } = useLanguage()
  const exT = t.exhibitions
  const pathname = usePathname()

  const menuItems = useMemo(() => {
    return [
      {
        label: lang === "ar" ? "لوحة التحكم" : lang === "fr" ? "Dashboard" : "Dashboard Overview",
        href: "/exhibitions/visitor",
        icon: LayoutDashboard,
        active: pathname === "/exhibitions/visitor"
      },
      {
        label: lang === "ar" ? "المفضلة" : lang === "fr" ? "Favoris" : "My Favorites",
        href: "/exhibitions/visitor/favorites",
        icon: Bookmark,
        active: pathname === "/exhibitions/visitor/favorites"
      },
      {
        label: lang === "ar" ? "اللقاءات الثنائية B2B" : lang === "fr" ? "Réunions B2B" : "B2B Meetings",
        href: "/exhibitions/visitor/meetings",
        icon: Calendar,
        active: pathname === "/exhibitions/visitor/meetings"
      },
      {
        label: lang === "ar" ? "سجل الزيارات" : lang === "fr" ? "Historique" : "Visitor History",
        href: "/exhibitions/visitor/history",
        icon: History,
        active: pathname === "/exhibitions/visitor/history"
      }
    ]
  }, [pathname, lang])

  return (
    <div className="pb-16" dir={dir}>
      {/* Navigation Breadcrumb / Top Bar */}
      <div className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/exhibitions"
              className="size-9 rounded-xl border border-border bg-secondary/15 hover:bg-secondary/40 flex items-center justify-center text-foreground hover:text-primary transition-all active:scale-95"
            >
              <ArrowLeft className="size-4.5 rtl:rotate-180" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                <UserCheck className="size-5.5 text-primary" />
                <span>
                  {lang === "ar" ? "بوابة الزائر الافتراضية" : lang === "fr" ? "Espace Visiteur" : "Visitor Experience Portal"}
                </span>
              </h1>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">
                {exT.title} — B2B Networking Suite
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 w-full sm:w-auto">
            <Link
              href="/exhibitions"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/95 text-white py-3 px-5 text-xs font-black shadow-sm active:scale-95 transition-all min-h-11"
            >
              {exT.exploreExhibitions}
            </Link>
          </div>
        </div>
      </div>

      {/* Dashboard Grid Layout */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Left Sidebar Menu */}
          <aside className="lg:col-span-1 space-y-4">
            <div className="bg-card border border-border rounded-[20px] p-4 shadow-sm space-y-1">
              <div className="px-3 pb-3 border-b border-border/50 mb-2">
                <p className="text-[9px] font-black uppercase text-muted-foreground tracking-wider">
                  {lang === "ar" ? "قائمة الملاحة" : lang === "fr" ? "Navigation" : "Workspace Menu"}
                </p>
              </div>
              {menuItems.map((item, idx) => {
                const Icon = item.icon
                return (
                  <Link
                    key={idx}
                    href={item.href}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      item.active
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground border border-transparent"
                    }`}
                  >
                    <Icon className="size-4.5 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>

            {/* QR scanner trigger banner */}
            <div className="bg-gradient-to-tr from-slate-900 via-[#1E3A8A] to-blue-950 text-white rounded-[20px] p-5 shadow-md flex flex-col justify-between aspect-square">
              <div className="space-y-2">
                <div className="size-11 rounded-xl bg-white/10 flex items-center justify-center text-white mb-2 shadow-sm border border-white/20">
                  <QrCode className="size-5.5" />
                </div>
                <h4 className="text-sm font-black leading-tight">
                  {lang === "ar" ? "مسح رمز الجناح QR" : lang === "fr" ? "Scanner un Stand" : "Scan Booth QR"}
                </h4>
                <p className="text-[10px] text-white/70 font-semibold leading-normal">
                  {lang === "ar"
                    ? "أدخل رمز الجناح لزيارته فوراً أو مسحه بالهاتف لفتحه مباشرة."
                    : lang === "fr"
                    ? "Entrez l'identifiant pour accéder instantanément au stand."
                    : "Access booths instantly using their QR codes or digital ID numbers."}
                </p>
              </div>
              <div className="pt-4 border-t border-white/10 mt-4">
                <Link
                  href="/exhibitions/visitor?triggerScan=true"
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-white hover:bg-white/95 text-xs font-black text-primary py-3 transition-all min-h-11 shadow-md"
                >
                  <QrCode className="size-4" />
                  <span>
                    {lang === "ar" ? "مسح رقمي سريع" : lang === "fr" ? "Simuler Scanner" : "Simulate Scanner"}
                  </span>
                </Link>
              </div>
            </div>
          </aside>

          {/* Right Main Content Panel */}
          <main className="lg:col-span-3">
            {children}
          </main>

        </div>
      </div>
    </div>
  )
}
