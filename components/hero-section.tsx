"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowRight, BadgeCheck, Search, ShieldCheck, Sparkles, Building2, Globe2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"

export function HeroSection() {
  const { t } = useLanguage()
  const router = useRouter()
  const [query, setQuery] = useState("")

  function goSearch(term?: string) {
    const q = (term ?? query).trim()
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search")
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-secondary/50 via-background to-background py-16 sm:py-24 lg:py-32">
      {/* Background illustration / abstract grid */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,oklch(0.92_0.01_259/0.4)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.92_0.01_259/0.4)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">

          {/* Left Column (Content & Search) */}
          <div className="flex flex-col items-center text-center lg:col-span-7 lg:items-start lg:text-start">

            {/* Premium Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5 text-xs font-semibold tracking-wide text-primary transition-all duration-300 hover:bg-primary/10">
              <Sparkles className="size-3.5 animate-pulse text-accent" />
              <span>{t.hero.badge}</span>
            </div>

            {/* Main Headline */}
            <h1 className="mt-6 text-pretty text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {t.hero.title1}{" "}
              <span className="relative inline-block text-primary">
                {t.hero.titleHighlight}
                <span className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-accent/60" />
              </span>{" "}
              {t.hero.title2}
            </h1>

            {/* Subtitle */}
            <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t.hero.subtitle}
            </p>

            {/* Large Search Input */}
            <div className="mt-8 w-full max-w-xl">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  goSearch()
                }}
                role="search"
                className="group flex flex-col gap-2 rounded-2xl border border-border bg-background p-2.5 shadow-md transition-all duration-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 sm:flex-row sm:items-center sm:rounded-full"
              >
                <div className="flex flex-1 items-center gap-3 px-3">
                  <Search className="size-5 shrink-0 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t.hero.searchPlaceholder}
                    aria-label={t.hero.searchButton}
                    className="w-full bg-transparent py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <Button
                  type="submit"
                  className="h-12 shrink-0 rounded-xl bg-primary px-7 text-sm font-semibold text-primary-foreground shadow transition-transform hover:bg-primary/95 active:scale-95 sm:rounded-full"
                >
                  <Search className="size-4 mr-1.5 rtl:ml-1.5" />
                  {t.hero.searchButton}
                </Button>
              </form>

              {/* Popular Tags */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 text-xs sm:text-sm lg:justify-start">
                <span className="font-medium text-muted-foreground">{t.hero.popular}</span>
                {t.hero.popularTerms.map((term) => (
                  <button
                    key={term}
                    onClick={() => goSearch(term)}
                    className="rounded-full border border-border bg-card px-3.5 py-1 text-xs font-medium text-foreground transition-all duration-300 hover:border-primary hover:bg-primary/5 hover:text-primary hover:shadow-sm"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary & Secondary CTAs */}
            <div className="mt-8 flex flex-wrap justify-center gap-4 sm:flex-row lg:justify-start">
              <Button
                onClick={() => router.push("/products")}
                size="lg"
                className="h-12 bg-accent px-8 font-semibold text-accent-foreground shadow-lg transition-all duration-300 hover:bg-accent/90 hover:shadow-xl active:scale-95"
              >
                {t.hero.ctaPrimary}
                <ArrowRight className="size-4 ml-2 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180" />
              </Button>
              <Button
                onClick={() => router.push("/suppliers")}
                size="lg"
                variant="outline"
                className="h-12 border-border bg-card px-8 font-semibold text-foreground shadow transition-all duration-300 hover:bg-secondary active:scale-95"
              >
                {t.hero.ctaSecondary}
              </Button>
            </div>

            {/* Quick trust metrics */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 border-t border-border pt-8 lg:justify-start">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <BadgeCheck className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-foreground">12,000+</p>
                  <p className="text-xs text-muted-foreground">{t.hero.trusted}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-foreground">100% Verified</p>
                  <p className="text-xs text-muted-foreground">Certified Manufacturers</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (Premium Split Interactive Frame) */}
          <div className="relative flex justify-center lg:col-span-5">
            <div className="relative aspect-[1/1] w-full max-w-[420px] sm:max-w-[480px] lg:max-w-none">

              {/* Main Decorative Gradient Glow */}
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-primary/15 to-accent/15 opacity-80 blur-2xl" />

              {/* Main Premium Card */}
              <div className="relative h-full w-full overflow-hidden rounded-3xl border border-border bg-card shadow-2xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)]">
                <Image
                  src="/images/hero-trade.png"
                  alt="Mediterranean trade and logistics port in Tunisia"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />

                {/* Overlay Premium Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Bottom Card Title */}
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <p className="text-xs font-semibold uppercase tracking-wider text-accent">Gateway to Global B2B</p>
                  <p className="mt-1 text-lg font-bold sm:text-xl">Tunisia&apos;s Premium Trade Portal</p>
                </div>
              </div>

              {/* Floating Badge 1: Verification */}
              <div className="absolute -bottom-6 -left-4 flex items-center gap-3 rounded-2xl border border-border bg-background/95 p-3.5 shadow-xl backdrop-blur transition-transform duration-300 hover:scale-105 sm:-left-6">
                <span className="flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Building2 className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-foreground">Direct Access</p>
                  <p className="text-[11px] text-muted-foreground">To Tunisians Factories</p>
                </div>
              </div>

              {/* Floating Badge 2: Global Reach */}
              <div className="absolute -right-4 -top-6 flex items-center gap-3 rounded-2xl border border-border bg-background/95 p-3.5 shadow-xl backdrop-blur transition-transform duration-300 hover:scale-105 sm:-right-6">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Globe2 className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-foreground">Multi-channel</p>
                  <p className="text-[11px] text-muted-foreground">Regional Trade Platform</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
