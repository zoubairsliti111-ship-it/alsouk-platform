import { NextResponse } from "next/server"
import { search } from "@/lib/services/search-service"
import { extractSearchKeywords } from "@/lib/ai/provider"

export const dynamic = "force-dynamic"

// Below this word count, the query is likely already keywords (e.g. "steel
// pipes") — skip the AI extraction step and search directly to save a round
// trip. Above it, treat the query as a natural-language question and extract
// keywords first (e.g. "where can I find wholesale clothing suppliers?").
const NATURAL_LANGUAGE_WORD_THRESHOLD = 4

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get("q") ?? "").trim()

  if (!q) {
    return NextResponse.json({ success: true, data: { suppliers: [], companies: [], products: [] } })
  }

  try {
    const wordCount = q.split(/\s+/).filter(Boolean).length
    let effectiveQuery = q

    if (wordCount >= NATURAL_LANGUAGE_WORD_THRESHOLD) {
      const keywords = await extractSearchKeywords(q)
      if (keywords) effectiveQuery = keywords
    }

    let data = await search(effectiveQuery)
    const total = data.suppliers.length + data.companies.length + data.products.length

    // If the extracted keywords found nothing, fall back to the raw query
    // once — better to try the literal words than return empty-handed.
    if (total === 0 && effectiveQuery !== q) {
      data = await search(q)
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error("[api/search] Search failed:", err)
    return NextResponse.json({
      success: false,
      data: { suppliers: [], companies: [], products: [] },
    })
  }
}
