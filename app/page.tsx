"use client"

import { LanguageProvider } from "@/components/language-provider"
import { SiteHeader } from "@/components/site-header"
import { HomeSearch } from "@/components/home/search-bar"
import { Opportunities } from "@/components/home/opportunities"
import { CategoriesSection } from "@/components/categories-section"
import { FeaturedSuppliers } from "@/components/featured-suppliers"
import { FeaturedProducts } from "@/components/featured-products"
import { LiveMarketplace } from "@/components/home/live-marketplace"
import { UpcomingExhibitionsSection } from "@/components/home/exhibitions-section"
import { RfqSection } from "@/components/rfq-section"
import { AssistantWidget } from "@/components/ai/assistant-widget"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"

export default function HomePage() {
  return (
    <LanguageProvider>
      <div className="flex min-h-screen flex-col bg-background">
        {/* Section 1: Sticky Header */}
        <SiteHeader />

        {/* Sections 2 to 8 */}
        <main className="flex-1 pb-18 lg:pb-0">
          {/* Section 2: Search */}
          <HomeSearch />

          {/* Section 3: Today's Opportunities */}
          <Opportunities />

          {/* Section 4: Categories */}
          <CategoriesSection />

          {/* Section 5: Featured Suppliers */}
          <FeaturedSuppliers />

          {/* Section 6: Featured Products */}
          <FeaturedProducts />

          {/* Section 7: Live Marketplace */}
          <LiveMarketplace />

          {/* Section 7.5: Upcoming B2B Exhibitions */}
          <UpcomingExhibitionsSection />

          {/* Section 8: RFQ Banner */}
          <RfqSection />
        </main>

        <AssistantWidget />

        {/* Section 9: Bottom Navigation */}
        <MobileBottomNav />
      </div>
    </LanguageProvider>
  )
}
