import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("[meetings] private meeting request submitted:", body)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[api/exhibitions/meetings] Failed to post meeting request:", err)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
