"use client"

import { Quote, Star } from "lucide-react"
import { SectionHeading } from "@/components/section-heading"
import { useLanguage } from "@/components/language-provider"

export function TestimonialsSection() {
  const { t } = useLanguage()

  return (
    <section className="bg-secondary/40 py-16">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading align="center" title={t.testimonials.title} subtitle={t.testimonials.subtitle} />

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {t.testimonials.items.map((item) => (
            <figure
              key={item.name}
              className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <Quote className="size-8 text-primary/25" />
              <div className="mt-3 flex gap-0.5 text-accent">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-3 flex-1 text-pretty leading-relaxed text-foreground/90">
                {item.quote}
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                  {item.name.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
