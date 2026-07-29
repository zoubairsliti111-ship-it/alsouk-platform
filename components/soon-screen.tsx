"use client"

import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"

/** Presentation-only "coming soon" screen for not-yet-built app-shell tabs. */
export function SoonScreen({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon
  title: string
  body: string
}) {
  const { t, dir } = useLanguage()
  return (
    <div dir={dir} className="mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="size-7" />
      </span>
      <span className="mt-5 inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
        {t.soon.badge}
      </span>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">{title}</h1>
      <p className="mt-2 text-muted-foreground">{body}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/products" className={buttonVariants({ size: "lg" })}>
          {t.soon.browseProducts}
        </Link>
        <Link href="/" className={buttonVariants({ variant: "outline", size: "lg" })}>
          {t.soon.backHome}
        </Link>
      </div>
    </div>
  )
}
