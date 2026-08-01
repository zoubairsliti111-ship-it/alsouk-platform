import { NextResponse } from "next/server"
import { getExhibitions, getOrganizerDashboardStats } from "@/lib/services/exhibitions-service"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const exhibitions = await getExhibitions()

    if (exhibitions.length === 0) {
      return NextResponse.json({ success: false, error: "no_exhibitions_found" }, { status: 404 })
    }

    const defaultId = exhibitions[0].id
    const exhibitionId = searchParams.get("exhibitionId") || defaultId

    const exhibition = exhibitions.find((e) => e.id === exhibitionId) || exhibitions[0]
    const stats = await getOrganizerDashboardStats(exhibition.id)

    return NextResponse.json({
      success: true,
      data: {
        exhibition,
        stats,
      },
    })
  } catch (err: any) {
    console.error("[api/exhibitions/organizer/dashboard] GET error:", err)
    return NextResponse.json(
      { success: false, error: err.message || "internal_server_error" },
      { status: 500 }
    )
  }
}
