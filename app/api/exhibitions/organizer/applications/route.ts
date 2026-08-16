import { NextResponse } from "next/server"
import {
  getApplicationsList,
  approveApplication,
  rejectApplication,
  assignBoothDetails,
} from "@/lib/services/exhibitions-service"
import { authorizeAdmin } from "@/lib/admin/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const authz = await authorizeAdmin()
    if (!authz.ok) return authz.response

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "all"
    const search = searchParams.get("search") || ""
    const sort = (searchParams.get("sort") || "newest") as "newest" | "oldest"

    const applications = await getApplicationsList({
      status,
      search,
      sort,
    }, authz.auth.service)

    return NextResponse.json({ success: true, data: applications })
  } catch (err: any) {
    console.error("[api/exhibitions/organizer/applications] GET failed:", err)
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
    const { action, id, reviewNotes, boothNumber, category } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: "missing_id" },
        { status: 400 }
      )
    }

    if (action === "approve") {
      const app = await approveApplication(id, reviewNotes, authz.auth.service)
      return NextResponse.json({ success: true, data: app })
    }

    if (action === "reject") {
      if (!reviewNotes?.trim()) {
        return NextResponse.json(
          { success: false, error: "missing_review_notes" },
          { status: 400 }
        )
      }
      const app = await rejectApplication(id, reviewNotes.trim(), authz.auth.service)
      return NextResponse.json({ success: true, data: app })
    }

    if (action === "assign-booth") {
      const booth = await assignBoothDetails(id, { boothNumber, category }, authz.auth.service)
      return NextResponse.json({ success: true, data: booth })
    }

    return NextResponse.json(
      { success: false, error: "invalid_action" },
      { status: 400 }
    )
  } catch (err: any) {
    console.error("[api/exhibitions/organizer/applications] POST failed:", err)
    return NextResponse.json(
      { success: false, error: err.message || "internal_server_error" },
      { status: 500 }
    )
  }
}
