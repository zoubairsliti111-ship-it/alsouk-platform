import { NextResponse } from "next/server"
import { getVisitorNotes, saveVisitorNote, deleteVisitorNote } from "@/lib/services/exhibitions-service"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const visitorId = searchParams.get("visitorId") || "visitor-local"
    const boothId = searchParams.get("boothId") || undefined
    const list = await getVisitorNotes(visitorId, boothId)
    return NextResponse.json({ success: true, data: list })
  } catch (err: any) {
    console.error("[api/exhibitions/visitor/notes] GET failed:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { visitorId, boothId, noteText, tags } = await request.json()
    if (!visitorId || !boothId || noteText === undefined) {
      return NextResponse.json({ success: false, error: "missing_fields" }, { status: 400 })
    }
    const note = await saveVisitorNote(visitorId, boothId, noteText, tags || [])
    return NextResponse.json({ success: true, data: note })
  } catch (err: any) {
    console.error("[api/exhibitions/visitor/notes] POST failed:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const visitorId = searchParams.get("visitorId") || "visitor-local"
    const boothId = searchParams.get("boothId")

    if (!boothId) {
      return NextResponse.json({ success: false, error: "missing_booth_id" }, { status: 400 })
    }

    const success = await deleteVisitorNote(visitorId, boothId)
    return NextResponse.json({ success })
  } catch (err: any) {
    console.error("[api/exhibitions/visitor/notes] DELETE failed:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
