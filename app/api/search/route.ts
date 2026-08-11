import { NextResponse } from "next/server"
import { search, type SearchResults } from "@/lib/services/search-service"
import { extractSearchKeywords } from "@/lib/ai/provider"

export const dynamic = "force-dynamic"

// Below this word count, the query is likely already keywords (e.g. "steel
// pipes") — skip the AI extraction step and search directly to save a round
// trip. Above it, treat the query as a natural-language question and extract
// keywords first (e.g. "where can I find wholesale clothing suppliers?").
const NATURAL_LANGUAGE_WORD_THRESHOLD = 4

const EMPTY: SearchResults = { suppliers: [], companies: [], products: [] }

function isEmpty(data: SearchResults): boolean {
  return data.suppliers.length === 0 && data.companies.length === 0 && data.products.length === 0
}

/** Merges two result sets, de-duplicating by id within each entity type. */
function mergeResults(a: SearchResults, b: SearchResults): SearchResults {
  const dedupe = <T extends { id: string }>(items: T[]) => {
    const seen = new Set<string>()
    return items.filter((item) => (seen.has(item.id) ? false : (seen.add(item.id), true)))
  }
  return {
    suppliers: dedupe([...a.suppliers, ...b.suppliers]),
    companies: dedupe([...a.companies, ...b.companies]),
    products: dedupe([...a.products, ...b.products]),
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get("q") ?? "").trim()

  if (!q) {
    return NextResponse.json({ success: true, data: EMPTY })
  }

  try {
    const wordCount = q.split(/\s+/).filter(Boolean).length
    let data = EMPTY

    if (wordCount >= NATURAL_LANGUAGE_WORD_THRESHOLD) {
      const extracted = await extractSearchKeywords(q)
      if (extracted) {
        // The whole extracted phrase as one substring first (covers the case
        // where it's a single multi-word product name).
        data = await search(extracted)
        // AI extraction often returns several distinct keywords (e.g. "ملابس
        // جملة") that won't appear as one contiguous substring in any listing.
        // Search each keyword individually and merge so a match on any single
        // term still surfaces results.
        if (isEmpty(data)) {
          const words = extracted.split(/\s+/).filter((w) => w.length > 1)
          for (const word of words) {
            const wordResults = await search(word)
            data = mergeResults(data, wordResults)
          }
        }
      }
    }

    // Last resort: try the raw query as typed.
    if (isEmpty(data)) {
      data = await search(q)
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error("[api/search] Search failed:", err)
    return NextResponse.json({ success: false, data: EMPTY })
  }
}
