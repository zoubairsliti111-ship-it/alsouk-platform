import { NextResponse } from "next/server"
import { getMeetings, createMeeting, updateMeetingStatus, rescheduleMeeting } from "@/lib/services/exhibitions-service"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const visitorId = searchParams.get("visitorId") || "visitor-local"
    const list = await getMeetings(visitorId)
    return NextResponse.json({ success: true, data: list })
  } catch (err: any) {
    console.error("[api/exhibitions/visitor/meetings] GET failed:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { visitorId, boothId, companyId, preferredDate, preferredTime, purpose, expectedVolume, preferredLanguage, notes } = await request.json()
    if (!visitorId || !boothId || !companyId || !preferredDate || !preferredTime || !purpose || !expectedVolume || !preferredLanguage) {
      return NextResponse.json({ success: false, error: "missing_fields" }, { status: 400 })
    }
    const meeting = await createMeeting(visitorId, {
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
    console.error("[api/exhibitions/visitor/meetings] POST failed:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { action, meetingId, status, preferredDate, preferredTime, notes } = await request.json()
    if (!meetingId) {
      return NextResponse.json({ success: false, error: "missing_meeting_id" }, { status: 400 })
    }

    if (action === "cancel") {
      const updated = await updateMeetingStatus(meetingId, "Cancelled")
      return NextResponse.json({ success: true, data: updated })
    }

    if (action === "reschedule") {
      if (!preferredDate || !preferredTime) {
        return NextResponse.json({ success: false, error: "missing_datetime" }, { status: 400 })
      }
      const updated = await rescheduleMeeting(meetingId, preferredDate, preferredTime, notes)
      return NextResponse.json({ success: true, data: updated })
    }

    if (action === "updateStatus" && status) {
      const updated = await updateMeetingStatus(meetingId, status)
      return NextResponse.json({ success: true, data: updated })
    }

    return NextResponse.json({ success: false, error: "invalid_action" }, { status: 400 })
  } catch (err: any) {
    console.error("[api/exhibitions/visitor/meetings] PATCH failed:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
