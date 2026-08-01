import { NextResponse } from "next/server"
import { getExhibitionBySlug } from "@/lib/services/exhibitions-service"

export const dynamic = "force-dynamic"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const exhibition = await getExhibitionBySlug(slug)
    if (!exhibition) {
      return NextResponse.json({ success: false, data: null }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: exhibition })
  } catch (err) {
    console.error(`[api/exhibitions/[slug]] Failed to load exhibition for slug:`, err)
    return NextResponse.json({ success: false, data: null }, { status: 500 })
  }
}
