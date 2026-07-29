"use client"

import { LanguageProvider } from "@/components/language-provider"
import { SiteHeader } from "@/components/site-header"
import { HomeSearch } from "@/components/home/search-bar"
import { LiveActivity } from "@/components/home/live-activity"
import { Opportunities } from "@/components/home/opportunities"
import { CategoriesSection } from "@/components/categories-section"
import { FeaturedSuppliers } from "@/components/featured-suppliers"
import { FeaturedProducts } from "@/components/featured-products"
import { RfqSection } from "@/components/rfq-section"
import { AssistantWidget } from "@/components/ai/assistant-widget"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"

export default function HomePage() {
  return (
    <LanguageProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex-1 pb-16 lg:pb-0">
          <HomeSearch />
          <LiveActivity />
          <Opportunities />
          <CategoriesSection />
          <FeaturedSuppliers />
          <FeaturedProducts />
          <RfqSection />
        </main>
        <AssistantWidget />
        <MobileBottomNav />
      </div>
    </LanguageProvider>
  )
}
