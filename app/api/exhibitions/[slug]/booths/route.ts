import { NextResponse } from "next/server"
import { getBoothsByExhibitionSlug } from "@/lib/services/exhibitions-service"

export const dynamic = "force-dynamic"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const booths = await getBoothsByExhibitionSlug(slug)
    return NextResponse.json({ success: true, data: booths })
  } catch (err) {
    console.error(`[api/exhibitions/[slug]/booths] Failed to load booths for slug:`, err)
    return NextResponse.json({ success: false, data: [] })
  }
}
