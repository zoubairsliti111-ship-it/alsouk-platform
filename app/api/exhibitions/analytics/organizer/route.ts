import { NextResponse } from "next/server"
import { getOrganizerAnalytics } from "@/lib/services/exhibitions-service"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const exhibitionId = searchParams.get("exhibitionId") || "exh-101"
    const range = searchParams.get("range") || "7days"
    const startDate = searchParams.get("startDate") || undefined
    const endDate = searchParams.get("endDate") || undefined

    const stats = await getOrganizerAnalytics(exhibitionId, range, startDate, endDate)
    return NextResponse.json({ success: true, data: stats })
  } catch (err) {
    console.error("[api/analytics/organizer] Failed to load statistics:", err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
