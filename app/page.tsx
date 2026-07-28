"use client"

import { LanguageProvider } from "@/components/language-provider"
import { SiteHeader } from "@/components/site-header"
import { HeroSection } from "@/components/hero-section"
import { BusinessDiscovery } from "@/components/business-discovery"
import { CategoriesSection } from "@/components/categories-section"
import { FeaturedSuppliers } from "@/components/featured-suppliers"
import { FeaturedProducts } from "@/components/featured-products"
import { RfqSection } from "@/components/rfq-section"
import { WhyChoose } from "@/components/why-choose"
import { TestimonialsSection } from "@/components/testimonials-section"
import { ExportTunisia } from "@/components/export-tunisia"
import { SiteFooter } from "@/components/site-footer"
import { AssistantWidget } from "@/components/ai/assistant-widget"

export default function HomePage() {
  return (
    <LanguageProvider>
      <div className="flex min-h-screen flex-col bg-background selection:bg-primary/10 selection:text-primary">
        <SiteHeader />

        <main className="flex-1">
          {/* 1. Premium Hero Section */}
          <HeroSection />

          {/* 2. Business Discovery (Manufacturing Videos, Factory Tours, Product Demos) */}
          <BusinessDiscovery />

          {/* 3. Popular Industries */}
          <CategoriesSection />

          {/* 4. Featured Manufacturers */}
          <FeaturedSuppliers />

          {/* 5. Trending Products */}
          <FeaturedProducts />

          {/* 6. RFQ Section */}
          <RfqSection />

          {/* 7. Why ALSOUK */}
          <WhyChoose />

          {/* 8. Testimonials */}
          <TestimonialsSection />

          {/* 9. Export Tunisia Section */}
          <ExportTunisia />
        </main>

        {/* 10. Premium Footer */}
        <SiteFooter />

        {/* Pluggable AI Assistant widget */}
        <AssistantWidget />
      </div>
    </LanguageProvider>
  )
}
