import { NextResponse } from "next/server"
import { getExhibitorAnalytics } from "@/lib/services/exhibitions-service"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const boothId = searchParams.get("boothId") || "booth-medina"
    const range = searchParams.get("range") || "7days"
    const startDate = searchParams.get("startDate") || undefined
    const endDate = searchParams.get("endDate") || undefined

    const stats = await getExhibitorAnalytics(boothId, range, startDate, endDate)
    return NextResponse.json({ success: true, data: stats })
  } catch (err) {
    console.error("[api/analytics/exhibitor] Failed to load statistics:", err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
