import { NextResponse } from "next/server"
import { getExhibitions, loadStatistics } from "@/lib/services/exhibitions-service"
import { authorizeAdmin } from "@/lib/admin/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const authz = await authorizeAdmin()
    if (!authz.ok) return authz.response

    const { searchParams } = new URL(request.url)
    const exhibitions = await getExhibitions()

    if (exhibitions.length === 0) {
      return NextResponse.json({ success: false, error: "no_exhibitions_found" }, { status: 404 })
    }

    const defaultId = exhibitions[0].id
    const exhibitionId = searchParams.get("exhibitionId") || defaultId

    const stats = await loadStatistics(exhibitionId, authz.auth.service)

    return NextResponse.json({ success: true, data: stats })
  } catch (err: any) {
    console.error("[api/exhibitions/organizer/statistics] GET failed:", err)
    return NextResponse.json(
      { success: false, error: err.message || "internal_server_error" },
      { status: 500 }
    )
  }
}
