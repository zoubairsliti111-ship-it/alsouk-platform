"use client"

import { LanguageProvider } from "@/components/language-provider"
import { SiteHeader } from "@/components/site-header"
import { HeroSection } from "@/components/hero-section"
import { CategoriesSection } from "@/components/categories-section"
import { LiveActivity } from "@/components/home/live-activity"
import { FeaturedProducts } from "@/components/featured-products"
import { FeaturedSuppliers } from "@/components/featured-suppliers"
import { Opportunities } from "@/components/home/opportunities"
import { BusinessVideos } from "@/components/home/business-videos"
import { RecommendedCompanies } from "@/components/home/recommended-companies"
import { TradeShows } from "@/components/home/trade-shows"
import { StatsSection } from "@/components/stats-section"
import { RfqSection } from "@/components/rfq-section"
import { AiCta } from "@/components/home/ai-cta"
import { SiteFooter } from "@/components/site-footer"
import { AssistantWidget } from "@/components/ai/assistant-widget"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"

export default function HomePage() {
  return (
    <LanguageProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex-1 pb-16 lg:pb-0">
          <HeroSection />
          <LiveActivity />
          <CategoriesSection />
          <FeaturedProducts />
          <FeaturedSuppliers />
          <Opportunities />
          <BusinessVideos />
          <RecommendedCompanies />
          <TradeShows />
          <StatsSection />
          <RfqSection />
          <AiCta />
        </main>
        <SiteFooter />
        <AssistantWidget />
        <MobileBottomNav />
      </div>
    </LanguageProvider>
  )
}
