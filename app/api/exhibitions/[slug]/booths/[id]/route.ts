import { NextResponse } from "next/server"
import { getBoothDetails } from "@/lib/services/exhibitions-service"

export const dynamic = "force-dynamic"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const { id } = await params
    const booth = await getBoothDetails(id)
    if (!booth) {
      return NextResponse.json({ success: false, data: null }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: booth })
  } catch (err) {
    console.error(`[api/exhibitions/[slug]/booths/[id]] Failed to load booth details:`, err)
    return NextResponse.json({ success: false, data: null }, { status: 500 })
  }
}
