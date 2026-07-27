import { NextResponse } from "next/server"
import { search } from "@/lib/services/search-service"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get("q") ?? "").trim()

  if (!q) {
    return NextResponse.json({ success: true, data: { suppliers: [], companies: [], products: [] } })
  }

  try {
    const data = await search(q)
    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error("[api/search] Search failed:", err)
    return NextResponse.json({
      success: false,
      data: { suppliers: [], companies: [], products: [] },
    })
  }
}
