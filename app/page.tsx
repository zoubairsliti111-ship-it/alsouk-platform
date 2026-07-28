"use client"

import { LanguageProvider } from "@/components/language-provider"
import { SiteHeader } from "@/components/site-header"
import { HeroSection } from "@/components/hero-section"
import { TodaysOpportunities } from "@/components/todays-opportunities"
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
          {/* 1. Premium Search Bar Section (HeroSection) */}
          <HeroSection />

          {/* 2. Horizontally scrollable "Today's Opportunities" Section */}
          <TodaysOpportunities />

          {/* 3. Categories Section */}
          <CategoriesSection />

          {/* 4. Featured Suppliers Section */}
          <FeaturedSuppliers />

          {/* 5. Featured Products Section */}
          <FeaturedProducts />

          {/* 6. Live Streams & Tours Section (BusinessDiscovery) */}
          <BusinessDiscovery />

          {/* 7. Large RFQ Call-to-Action Section */}
          <RfqSection />
        </main>

        <SiteFooter />

        {/* Pluggable AI Assistant widget */}
        <AssistantWidget />
      </div>
    </LanguageProvider>
  )
}
