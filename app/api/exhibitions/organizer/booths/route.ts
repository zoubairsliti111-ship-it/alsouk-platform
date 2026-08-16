import { NextResponse } from "next/server"
import { restGet, getRestConfig } from "@/lib/supabase/rest"
import {
  getExhibitions,
  getMockBooths,
  mapExhibitionBooth,
  updateBoothStatus,
} from "@/lib/services/exhibitions-service"
import { authorizeAdmin } from "@/lib/admin/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const authz = await authorizeAdmin()
    if (!authz.ok) return authz.response

    const { searchParams } = new URL(request.url)
    const exhibitions = await getExhibitions()

    if (exhibitions.length === 0) {
      return NextResponse.json({ success: true, data: [] })
    }

    const defaultId = exhibitions[0].id
    const exhibitionId = searchParams.get("exhibitionId") || defaultId
    const exhibition = exhibitions.find((e) => e.id === exhibitionId) || exhibitions[0]
    const slug = exhibition.slug

    let booths = []
    const cfg = getRestConfig()

    if (!cfg) {
      booths = getMockBooths()[slug] || []
    } else {
      const select = "id,exhibition_id,company_id,banner_url,description,is_archived,booth_number,category,status,title,short_description,companies(*)"
      const rows = await restGet<any>(
        `exhibition_booths?select=${select}&exhibition_id=eq.${encodeURIComponent(exhibition.id)}`
      )
      booths = rows.map(mapExhibitionBooth)
    }

    return NextResponse.json({ success: true, data: booths })
  } catch (err: any) {
    console.error("[api/exhibitions/organizer/booths] GET failed:", err)
    return NextResponse.json(
      { success: false, error: err.message || "internal_server_error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const authz = await authorizeAdmin()
    if (!authz.ok) return authz.response

    const body = await request.json()
    const { action, boothId, status } = body

    if (!boothId) {
      return NextResponse.json(
        { success: false, error: "missing_booth_id" },
        { status: 400 }
      )
    }

    if (action === "update-status") {
      if (!status) {
        return NextResponse.json(
          { success: false, error: "missing_status" },
          { status: 400 }
        )
      }
      const updated = await updateBoothStatus(boothId, status, authz.auth.service)
      return NextResponse.json({ success: true, data: updated })
    }

    return NextResponse.json(
      { success: false, error: "invalid_action" },
      { status: 400 }
    )
  } catch (err: any) {
    console.error("[api/exhibitions/organizer/booths] POST failed:", err)
    return NextResponse.json(
      { success: false, error: err.message || "internal_server_error" },
      { status: 500 }
    )
  }
}
