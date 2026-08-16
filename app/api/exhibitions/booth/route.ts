import { NextResponse } from "next/server"
import { getBoothDetails, saveBoothDraft } from "@/lib/services/exhibitions-service"
import { authorizeBoothOwner } from "@/lib/exhibitions/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing booth id parameter" },
        { status: 400 }
      )
    }

    const booth = await getBoothDetails(id)
    if (!booth) {
      return NextResponse.json(
        { success: false, error: "Booth not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: booth })
  } catch (err: any) {
    console.error("[API/exhibitions/booth GET] Error:", err)
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load booth details" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, title, shortDescription, description, bannerUrl, logoUrl, category, status } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing booth id in body" },
        { status: 400 }
      )
    }

    const authz = await authorizeBoothOwner(id)
    if (!authz.ok) return authz.response

    const updated = await saveBoothDraft(id, {
      title,
      shortDescription,
      description,
      bannerUrl,
      logoUrl,
      category,
      status,
    }, authz.auth.client)

    return NextResponse.json({ success: true, data: updated })
  } catch (err: any) {
    console.error("[API/exhibitions/booth POST] Error:", err)
    return NextResponse.json(
      { success: false, error: err.message || "Failed to save booth draft" },
      { status: 500 }
    )
  }
}
