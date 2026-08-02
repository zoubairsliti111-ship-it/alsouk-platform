import { NextResponse } from "next/server"
import { getRecentlyViewed, trackRecentlyViewed } from "@/lib/services/exhibitions-service"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const visitorId = searchParams.get("visitorId") || "visitor-local"
    const list = await getRecentlyViewed(visitorId)
    return NextResponse.json({ success: true, data: list })
  } catch (err: any) {
    console.error("[api/exhibitions/visitor/recently-viewed] GET failed:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { visitorId, targetType, targetId } = await request.json()
    if (!visitorId || !targetType || !targetId) {
      return NextResponse.json({ success: false, error: "missing_fields" }, { status: 400 })
    }
    const tracked = await trackRecentlyViewed(visitorId, targetType, targetId)
    return NextResponse.json({ success: true, data: tracked })
  } catch (err: any) {
    console.error("[api/exhibitions/visitor/recently-viewed] POST failed:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
