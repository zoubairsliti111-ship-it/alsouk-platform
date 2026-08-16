import { NextResponse } from "next/server"
import { getExhibitions, createExhibition } from "@/lib/services/exhibitions-service"
import { authorizeAdmin } from "@/lib/admin/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const list = await getExhibitions()
    return NextResponse.json({ success: true, data: list })
  } catch (err: any) {
    console.error("[api/admin/exhibitions] GET failed:", err)
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
    const {
      name,
      organizer,
      description,
      categories,
      startDate,
      endDate,
      city,
      country,
      coverUrl,
      logoUrl,
      contactEmail,
      contactPhone,
      website
    } = body

    if (!name || !organizer || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: "missing_required_fields" },
        { status: 400 }
      )
    }

    const created = await createExhibition({
      name,
      organizer,
      description,
      categories,
      startDate,
      endDate,
      city,
      country,
      coverUrl,
      logoUrl,
      contactEmail,
      contactPhone,
      website
    }, authz.auth.service)

    return NextResponse.json({ success: true, data: created })
  } catch (err: any) {
    console.error("[api/admin/exhibitions] POST failed:", err)
    return NextResponse.json(
      { success: false, error: err.message || "internal_server_error" },
      { status: 500 }
    )
  }
}
