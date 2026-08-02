"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Presentation,
  FileCheck2,
  Building,
  BarChart3,
  Menu,
  X,
  Globe,
  User,
  Settings,
  ChevronRight,
  ShieldCheck
} from "lucide-react"
import { LanguageProvider, useLanguage } from "@/components/language-provider"

// Inner content layout wrapping with Sidebar and logical property layout
function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { lang, dir } = useLanguage()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isAr = lang === "ar"

  const navItems = [
    {
      href: "/admin",
      label: isAr ? "لوحة التحكم" : "Dashboard",
      icon: LayoutDashboard,
      active: pathname === "/admin"
    },
    {
      href: "/admin/exhibitions",
      label: isAr ? "إدارة المعارض" : "Exhibitions",
      icon: Presentation,
      active: pathname.startsWith("/admin/exhibitions")
    },
    {
      href: "/admin/applications",
      label: isAr ? "طلبات المشاركة" : "Applications",
      icon: FileCheck2,
      active: pathname.startsWith("/admin/applications")
    },
    {
      href: "/admin/booths",
      label: isAr ? "مساحات الأجنحة" : "Booth Spaces",
      icon: Building,
      active: pathname.startsWith("/admin/booths")
    },
    {
      href: "/admin/statistics",
      label: isAr ? "التحليلات والإحصاءات" : "Analytics & Stats",
      icon: BarChart3,
      active: pathname.startsWith("/admin/statistics")
    }
  ]

  const toggleMobile = () => setMobileOpen(!mobileOpen)

  return (
    <div
      dir={dir}
      className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row"
    >
      {/* MOBILE HEADER */}
      <header className="md:hidden flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900 sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="size-6 text-teal-400" />
          <span className="font-black text-sm tracking-widest text-teal-300">ALSOUK ADMIN</span>
        </div>
        <button
          onClick={toggleMobile}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 focus:outline-none"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>

      {/* SIDEBAR - DESKTOP */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 bg-slate-900/90 shrink-0">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="size-9 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20 shrink-0">
            <ShieldCheck className="size-5 text-teal-400" />
          </div>
          <div>
            <h1 className="text-xs font-black tracking-widest text-teal-400">ALSOUK PORTAL</h1>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5">Standalone Administration</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-black transition-all ${
                  item.active
                    ? "bg-teal-500/10 text-teal-300 border border-teal-500/20 shadow-lg shadow-teal-500/5"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent"
                }`}
              >
                <Icon className={`size-4.5 shrink-0 ${item.active ? "text-teal-400" : ""}`} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all text-[11px] font-bold"
          >
            <Globe className="size-4 text-teal-500/60" />
            <span>{isAr ? "العودة للموقع العام" : "Exit to Public Website"}</span>
          </Link>
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={toggleMobile}
          />

          <aside className="relative flex flex-col w-72 max-w-[80vw] h-full bg-slate-900 border-r border-slate-800 p-5 space-y-6 z-50">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-5">
              <ShieldCheck className="size-6 text-teal-400" />
              <div>
                <h1 className="text-xs font-black tracking-widest text-teal-400">ALSOUK ADMIN</h1>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">Trade Show Control</p>
              </div>
            </div>

            <nav className="flex-1 space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={toggleMobile}
                    className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-xs font-black transition-all ${
                      item.active
                        ? "bg-teal-500/10 text-teal-300 border border-teal-500/20"
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    }`}
                  >
                    <Icon className="size-5 shrink-0 text-teal-400" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="border-t border-slate-800 pt-4">
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all text-xs font-bold"
              >
                <Globe className="size-4.5 text-teal-400" />
                <span>{isAr ? "العودة للموقع العام" : "Exit to Public Website"}</span>
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="flex-1 bg-slate-950 p-6 md:p-10 min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </LanguageProvider>
  )
}
