import { NextResponse } from "next/server"
import { getQRReport } from "@/lib/services/exhibitions-service"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id") || "exh-101"
    const isOrganizer = searchParams.get("isOrganizer") !== "false"
    const range = searchParams.get("range") || "7days"
    const startDate = searchParams.get("startDate") || undefined
    const endDate = searchParams.get("endDate") || undefined

    const report = await getQRReport(id, isOrganizer, range, startDate, endDate)
    return NextResponse.json({ success: true, data: report })
  } catch (err) {
    console.error("[api/analytics/qr] Failed to load qr report:", err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
