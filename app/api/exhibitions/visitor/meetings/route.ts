import { NextResponse } from "next/server"
import { getMeetings, createMeeting, updateMeetingStatus, rescheduleMeeting } from "@/lib/services/exhibitions-service"
import { authorizeVisitor } from "@/lib/exhibitions/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const auth = await authorizeVisitor()
  if (!auth.ok) return auth.response

  try {
    const list = await getMeetings(auth.userId)
    return NextResponse.json({ success: true, data: list })
  } catch (err: any) {
    console.error("[api/exhibitions/visitor/meetings] GET failed:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await authorizeVisitor()
  if (!auth.ok) return auth.response

  try {
    const { boothId, companyId, preferredDate, preferredTime, purpose, expectedVolume, preferredLanguage, notes } = await request.json()
    if (!boothId || !companyId || !preferredDate || !preferredTime || !purpose || !expectedVolume || !preferredLanguage) {
      return NextResponse.json({ success: false, error: "missing_fields" }, { status: 400 })
    }
    const meeting = await createMeeting(auth.userId, {
      boothId,
      companyId,
      preferredDate,
      preferredTime,
      purpose,
      expectedVolume,
      preferredLanguage,
      notes: notes || null
    })
    return NextResponse.json({ success: true, data: meeting })
  } catch (err: any) {
    // target_not_found: boothId/companyId isn't a real, live exhibition
    // booth (e.g. a legacy demo id, or an exhibition that has no booths
    // yet) — there's honestly nothing to book, not a server error.
    if (err.message === "target_not_found") {
      return NextResponse.json({ success: false, error: "target_not_found" }, { status: 400 })
    }
    console.error("[api/exhibitions/visitor/meetings] POST failed:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const auth = await authorizeVisitor()
  if (!auth.ok) return auth.response

  try {
    const { action, meetingId, status, preferredDate, preferredTime, notes } = await request.json()
    if (!meetingId) {
      return NextResponse.json({ success: false, error: "missing_meeting_id" }, { status: 400 })
    }

    if (action === "cancel") {
      const updated = await updateMeetingStatus(auth.userId, meetingId, "Cancelled")
      return NextResponse.json({ success: true, data: updated })
    }

    if (action === "reschedule") {
      if (!preferredDate || !preferredTime) {
        return NextResponse.json({ success: false, error: "missing_datetime" }, { status: 400 })
      }
      const updated = await rescheduleMeeting(auth.userId, meetingId, preferredDate, preferredTime, notes)
      return NextResponse.json({ success: true, data: updated })
    }

    if (action === "updateStatus" && status) {
      const updated = await updateMeetingStatus(auth.userId, meetingId, status)
      return NextResponse.json({ success: true, data: updated })
    }

    return NextResponse.json({ success: false, error: "invalid_action" }, { status: 400 })
  } catch (err: any) {
    console.error("[api/exhibitions/visitor/meetings] PATCH failed:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
