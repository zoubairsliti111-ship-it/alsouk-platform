"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, LayoutGrid, FileText, MessageSquare, User } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

/**
 * Mobile app-style bottom navigation. Fixed to the viewport bottom.
 * Height: exactly 70px.
 * Tabs: Home, Categories, RFQ, Messages, Account.
 */
export function MobileBottomNav() {
  const { lang } = useLanguage()
  const pathname = usePathname()

  const homeLabels: Record<string, string> = { en: "Home", fr: "Accueil", ar: "الرئيسية" }
  const categoriesLabels: Record<string, string> = { en: "Categories", fr: "Catégories", ar: "الفئات" }
  const rfqLabels: Record<string, string> = { en: "RFQ", fr: "RFQ", ar: "طلبات الأسعار" }
  const messagesLabels: Record<string, string> = { en: "Messages", fr: "Messages", ar: "الرسائل" }
  const accountLabels: Record<string, string> = { en: "Account", fr: "Compte", ar: "الحساب" }

  const tabs = [
    { href: "/", label: homeLabels[lang] || homeLabels["en"], icon: Home },
    { href: "/categories", label: categoriesLabels[lang] || categoriesLabels["en"], icon: LayoutGrid },
    { href: "/rfq", label: rfqLabels[lang] || rfqLabels["en"], icon: FileText },
    { href: "/messages", label: messagesLabels[lang] || messagesLabels["en"], icon: MessageSquare },
    { href: "/account", label: accountLabels[lang] || accountLabels["en"], icon: User },
  ]

  function isActive(href: string) {
    if (href === "/") return pathname === "/"
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 h-[70px] border-t border-border bg-background/95 backdrop-blur-md lg:hidden flex items-stretch"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="w-full flex items-stretch justify-between px-2">
        {tabs.map((tab) => {
          const active = isActive(tab.href)
          const Icon = tab.icon
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className="group flex h-full flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 transition-colors active:scale-95"
              >
                <span
                  className={`flex size-8 items-center justify-center rounded-full transition-colors ${
                    active ? "bg-primary/10 text-primary" : "text-muted-foreground group-hover:text-foreground"
                  }`}
                >
                  <Icon className="size-[1.25rem]" strokeWidth={active ? 2.4 : 2} />
                </span>
                <span
                  className={`text-[10px] font-semibold leading-none ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
