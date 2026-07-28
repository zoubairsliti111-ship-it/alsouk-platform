"use client"

import { Quote, Star, MessageSquare } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export function TestimonialsSection() {
  const { t } = useLanguage()

  return (
    <section className="bg-secondary/35 py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent">
            <MessageSquare className="size-3.5" />
            Client Success Stories
          </span>
          <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {t.testimonials.title}
          </h2>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            {t.testimonials.subtitle}
          </p>
        </div>

        {/* Premium Masonry-Style Grid layout */}
        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {t.testimonials.items.map((item) => (
            <figure
              key={item.name}
              className="group relative flex flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-md sm:p-8"
            >
              {/* Premium Quote & Stars overlay */}
              <div>
                <div className="flex items-center justify-between">
                  <Quote className="size-10 text-primary/10 transition-colors duration-300 group-hover:text-primary/20" />
                  <div className="flex gap-0.5 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="size-4 fill-current" />
                    ))}
                  </div>
                </div>

                <blockquote className="mt-6 text-base font-medium leading-relaxed text-foreground/90">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
              </div>

              {/* Author Info footer */}
              <figcaption className="mt-8 flex items-center gap-4 border-t border-border pt-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 font-bold text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                  {item.name.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-bold text-foreground">{item.name}</p>
                  <p className="text-xs font-semibold text-muted-foreground">{item.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>

      </div>
    </section>
  )
}
