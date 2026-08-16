import { NextResponse } from "next/server"
import { updateExhibition } from "@/lib/services/exhibitions-service"
import { authorizeAdmin } from "@/lib/admin/server"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const authz = await authorizeAdmin()
    if (!authz.ok) return authz.response

    const body = await request.json()
    const {
      id,
      name,
      description,
      categories,
      startDate,
      endDate,
      city,
      country,
      coverUrl,
      organizer,
      logoUrl,
      contactEmail,
      contactPhone,
      website
    } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: "missing_exhibition_id" },
        { status: 400 }
      )
    }

    const updated = await updateExhibition(id, {
      name,
      description,
      categories,
      startDate,
      endDate,
      city,
      country,
      coverUrl,
      organizer,
      logoUrl,
      contactEmail,
      contactPhone,
      website,
    }, authz.auth.service)

    return NextResponse.json({ success: true, data: updated })
  } catch (err: any) {
    console.error("[api/exhibitions/organizer/exhibition] POST failed:", err)
    return NextResponse.json(
      { success: false, error: err.message || "internal_server_error" },
      { status: 500 }
    )
  }
}
