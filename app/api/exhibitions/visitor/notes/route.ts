import { NextResponse } from "next/server"
import { getVisitorNotes, saveVisitorNote, deleteVisitorNote } from "@/lib/services/exhibitions-service"
import { authorizeVisitor } from "@/lib/exhibitions/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const auth = await authorizeVisitor()
  if (!auth.ok) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const boothId = searchParams.get("boothId") || undefined
    const list = await getVisitorNotes(auth.userId, boothId)
    return NextResponse.json({ success: true, data: list })
  } catch (err: any) {
    console.error("[api/exhibitions/visitor/notes] GET failed:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await authorizeVisitor()
  if (!auth.ok) return auth.response

  try {
    const { boothId, noteText, tags } = await request.json()
    if (!boothId || noteText === undefined) {
      return NextResponse.json({ success: false, error: "missing_fields" }, { status: 400 })
    }
    const note = await saveVisitorNote(auth.userId, boothId, noteText, tags || [])
    return NextResponse.json({ success: true, data: note })
  } catch (err: any) {
    // target_not_found: boothId isn't a real, live booth (e.g. a legacy
    // demo booth id) — nothing real to attach a note to yet.
    if (err.message === "target_not_found") {
      return NextResponse.json({ success: false, error: "target_not_found" }, { status: 400 })
    }
    console.error("[api/exhibitions/visitor/notes] POST failed:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const auth = await authorizeVisitor()
  if (!auth.ok) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const boothId = searchParams.get("boothId")

    if (!boothId) {
      return NextResponse.json({ success: false, error: "missing_booth_id" }, { status: 400 })
    }

    const success = await deleteVisitorNote(auth.userId, boothId)
    return NextResponse.json({ success })
  } catch (err: any) {
    console.error("[api/exhibitions/visitor/notes] DELETE failed:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
