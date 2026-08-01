import { NextResponse } from "next/server"
import { getExhibitionApplicationById } from "@/lib/services/exhibitions-service"

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
        { success: false, data: null },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: application })
  } catch (err) {
    console.error(`[api/exhibitions/applications/[id]] GET failed for ID ${id}:`, err)
    return NextResponse.json(
      { success: false, error: "internal_server_error" },
      { status: 500 }
    )
  }
}
