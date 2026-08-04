"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export function HomeSearch() {
  const { t } = useLanguage()
  const router = useRouter()
  const [query, setQuery] = useState("")

  function goSearch(term?: string) {
    const q = (term ?? query).trim()
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search")
  }

  // Multi-language specific placeholder text for search.
  const placeholders: Record<string, string> = {
    en: "Search products, suppliers or factories...",
    fr: "Rechercher des produits, des fournisseurs ou des usines...",
    ar: "البحث عن المنتجات أو الموردين أو المصانع..."
  }

  const { lang, dir } = useLanguage()
  const placeholderText = placeholders[lang] || placeholders["en"]

  const chipsData: Record<string, { term: string; label: string }[]> = {
    en: [
      { term: "Olive Oil", label: "Olive Oil" },
      { term: "Dates", label: "Dates" },
      { term: "Textiles", label: "Textiles" },
      { term: "Machinery", label: "Machinery" },
      { term: "Packaging", label: "Packaging" },
      { term: "Ceramics", label: "Ceramics" },
      { term: "Furniture", label: "Furniture" },
      { term: "Chemicals", label: "Chemicals" },
    ],
    fr: [
      { term: "Olive Oil", label: "Huile d'olive" },
      { term: "Dates", label: "Dattes" },
      { term: "Textiles", label: "Textiles" },
      { term: "Machinery", label: "Machines" },
      { term: "Packaging", label: "Emballage" },
      { term: "Ceramics", label: "Céramique" },
      { term: "Furniture", label: "Meubles" },
      { term: "Chemicals", label: "Produits chimiques" },
    ],
    ar: [
      { term: "Olive Oil", label: "زيت زيتون" },
      { term: "Dates", label: "تمور" },
      { term: "Textiles", label: "منسوجات" },
      { term: "Machinery", label: "آلات" },
      { term: "Packaging", label: "تغليف" },
      { term: "Ceramics", label: "خزف" },
      { term: "Furniture", label: "أثاث" },
      { term: "Chemicals", label: "مواد كيميائية" },
    ],
  }

  const currentChips = chipsData[lang] || chipsData["en"]

  return (
    <section className="bg-background py-6 px-6">
      <div className="mx-auto max-w-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            goSearch()
          }}
          role="search"
          className="flex items-center gap-2 rounded-full border border-border/80 bg-card p-1.5 shadow-sm focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all"
        >
          <div className="flex flex-1 items-center gap-2 ps-3 pe-2">
            <Search className="size-4.5 shrink-0 text-muted-foreground/60" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholderText}
              aria-label={t.ui.searchLabel}
              className="w-full bg-transparent py-2.5 text-xs font-semibold text-foreground outline-none placeholder:text-muted-foreground/50 placeholder:font-medium"
            />
          </div>
          <button
            type="submit"
            className="h-10 shrink-0 inline-flex items-center justify-center rounded-full bg-[#2563EB] px-5 text-xs font-semibold text-white hover:bg-blue-700 transition-all active:scale-95"
          >
            <span>{t.hero.searchButton}</span>
          </button>
        </form>

        {/* Quick Search Chips directly below the search bar */}
        <div className="no-scrollbar mt-3 flex items-center gap-2 overflow-x-auto pb-1" dir={dir}>
          {currentChips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => goSearch(chip.label)}
              className="shrink-0 rounded-full bg-card px-3.5 py-1.5 text-[11px] font-semibold text-muted-foreground border border-border/60 shadow-xs hover:text-primary hover:border-primary/30 hover:shadow-sm transition-all duration-300 active:scale-95 cursor-pointer"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
