"use client"

import { LanguageProvider } from "@/components/language-provider"
import { SiteHeader } from "@/components/site-header"
import { HeroSection } from "@/components/hero-section"
import { CategoriesSection } from "@/components/categories-section"
import { FeaturedSuppliers } from "@/components/featured-suppliers"
import { FeaturedProducts } from "@/components/featured-products"
import { RfqSection } from "@/components/rfq-section"
import { WhyChoose } from "@/components/why-choose"
import { StatsSection } from "@/components/stats-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { SiteFooter } from "@/components/site-footer"

export default function HomePage() {
  return (
    <LanguageProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex-1">
          <HeroSection />
          <CategoriesSection />
          <FeaturedSuppliers />
          <FeaturedProducts />
          <RfqSection />
          <WhyChoose />
          <StatsSection />
          <TestimonialsSection />
        </main>
        <SiteFooter />
      </div>
    </LanguageProvider>
  )
}
