import { NextResponse } from "next/server"
import { updateExhibition, updateExhibitionStatus } from "@/lib/services/exhibitions-service"
import { authorizeAdmin } from "@/lib/admin/server"

export const dynamic = "force-dynamic"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authz = await authorizeAdmin()
    if (!authz.ok) return authz.response

    const { id } = await params
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
      website,
      status
    } = body

    let updated

    if (status !== undefined) {
      updated = await updateExhibitionStatus(id, status, authz.auth.service)
    } else {
      updated = await updateExhibition(id, {
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
        website,
      }, authz.auth.service)
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (err: any) {
    console.error("[api/admin/exhibitions/[id]] PATCH failed:", err)
    return NextResponse.json(
      { success: false, error: err.message || "internal_server_error" },
      { status: 500 }
    )
  }
}
