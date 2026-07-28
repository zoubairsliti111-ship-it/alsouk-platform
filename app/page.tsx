"use client"

import { LanguageProvider } from "@/components/language-provider"
import { SiteHeader } from "@/components/site-header"
import { HeroSection } from "@/components/hero-section"
import { OpportunitiesSection } from "@/components/opportunities-section"
import { CategoriesSection } from "@/components/categories-section"
import { FeaturedSuppliers } from "@/components/featured-suppliers"
import { FeaturedProducts } from "@/components/featured-products"
import { BusinessDiscovery } from "@/components/business-discovery"
import { RfqSection } from "@/components/rfq-section"
import { SiteFooter } from "@/components/site-footer"
import { AssistantWidget } from "@/components/ai/assistant-widget"

export default function HomePage() {
  return (
    <LanguageProvider>
      <div className="flex min-h-screen flex-col bg-background selection:bg-primary/10 selection:text-primary">
        <SiteHeader />

        <main className="flex-1">
          {/* 1. Search Bar (HeroSection) */}
          <HeroSection />

          {/* 2. Today's Opportunities */}
          <OpportunitiesSection />

          {/* 3. Categories */}
          <CategoriesSection />

          {/* 4. Featured Suppliers */}
          <FeaturedSuppliers />

          {/* 5. Featured Products */}
          <FeaturedProducts />

          {/* 6. Live Streams (Business Discovery) */}
          <BusinessDiscovery />

          {/* 7. RFQ Section */}
          <RfqSection />
        </main>

        {/* Premium Footer */}
        <SiteFooter />

        {/* Pluggable AI Assistant widget */}
        <AssistantWidget />
      </div>
    </LanguageProvider>
  )
}
