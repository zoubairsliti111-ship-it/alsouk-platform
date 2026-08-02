import { NextResponse } from "next/server"
import {
  getExhibitionApplicationById,
  approveApplication,
  rejectApplication,
  updateApplicationReviewNotes,
} from "@/lib/services/exhibitions-service"

export const dynamic = "force-dynamic"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const application = await getExhibitionApplicationById(id)

    if (!application) {
      return NextResponse.json(
        { success: false, error: "Application not found", data: null },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: application })
  } catch (err: any) {
    console.error(`[api/exhibitions/applications/[id]] GET failed:`, err)
    return NextResponse.json(
      { success: false, error: err.message || "internal_server_error" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, error: "invalid_json" },
        { status: 400 }
      )
    }

    const { action, reviewNotes } = body

    if (!action) {
      return NextResponse.json(
        { success: false, error: "missing_action_parameter" },
        { status: 400 }
      )
    }

    let result: any

    switch (action) {
      case "Approve":
        result = await approveApplication(id, reviewNotes)
        break
      case "Reject":
        if (!reviewNotes || !reviewNotes.trim()) {
          return NextResponse.json(
            { success: false, error: "review_notes_required_for_rejection" },
            { status: 400 }
          )
        }
        result = await rejectApplication(id, reviewNotes.trim())
        break
      case "UpdateNotes":
        result = await updateApplicationReviewNotes(id, reviewNotes || "")
        break
      default:
        return NextResponse.json(
          { success: false, error: `unknown_action_${action}` },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true, data: result })
  } catch (err: any) {
    console.error(`[api/exhibitions/applications/[id]] POST action failed:`, err)
    return NextResponse.json(
      { success: false, error: err.message || "internal_server_error" },
      { status: 500 }
    )
  }
}
