import { NextResponse } from "next/server"
import { getExhibitions } from "@/lib/services/exhibitions-service"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const exhibitions = await getExhibitions()
    return NextResponse.json({ success: true, data: exhibitions })
  } catch (err) {
    console.error("[api/exhibitions] Failed to load exhibitions:", err)
    return NextResponse.json({ success: false, data: [] })
  }
}
