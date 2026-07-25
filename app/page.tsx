"use client"

import { SiteShell } from "@/components/site-shell"
import { HeroSection } from "@/components/hero-section"
import { CategoriesSection } from "@/components/categories-section"
import { FeaturedSuppliers } from "@/components/featured-suppliers"
import { FeaturedProducts } from "@/components/featured-products"
import { RfqSection } from "@/components/rfq-section"
import { WhyChoose } from "@/components/why-choose"
import { StatsSection } from "@/components/stats-section"
import { TestimonialsSection } from "@/components/testimonials-section"

export default function HomePage() {
  return (
    <SiteShell>
      <HeroSection />
      <CategoriesSection />
      <FeaturedSuppliers />
      <FeaturedProducts />
      <RfqSection />
      <WhyChoose />
      <StatsSection />
      <TestimonialsSection />
    </SiteShell>
  )
}
