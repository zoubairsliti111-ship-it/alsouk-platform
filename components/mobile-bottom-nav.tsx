"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Compass, Home, LayoutGrid, MessageCircle, User } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

/**
 * Mobile app-style bottom navigation. Visible on small screens only; desktop
 * keeps the SiteHeader nav. Fixed to the viewport bottom with large touch
 * targets and an active-state indicator.
 */
export function MobileBottomNav() {
  const { t } = useLanguage()
  const pathname = usePathname()

  const tabs = [
    { href: "/", label: t.bottomNav.home, icon: Home },
    { href: "/discover", label: t.bottomNav.discover, icon: Compass },
    { href: "/categories", label: t.bottomNav.categories, icon: LayoutGrid },
    { href: "/messages", label: t.bottomNav.messages, icon: MessageCircle },
    { href: "/account", label: t.bottomNav.account, icon: User },
  ]

  function isActive(href: string) {
    if (href === "/") return pathname === "/"
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {tabs.map((tab) => {
          const active = isActive(tab.href)
          const Icon = tab.icon
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className="group flex min-h-[3.5rem] flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 transition-colors active:scale-95"
              >
                <span
                  className={`flex size-8 items-center justify-center rounded-full transition-colors ${
                    active ? "bg-primary/10 text-primary" : "text-muted-foreground group-hover:text-foreground"
                  }`}
                >
                  <Icon className="size-[1.35rem]" strokeWidth={active ? 2.4 : 2} />
                </span>
                <span
                  className={`text-[10px] font-medium leading-none ${
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
