import { NextResponse } from "next/server"
import { getFavorites, addFavorite, removeFavorite } from "@/lib/services/exhibitions-service"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const visitorId = searchParams.get("visitorId") || "visitor-local"
    const favorites = await getFavorites(visitorId)
    return NextResponse.json({ success: true, data: favorites })
  } catch (err: any) {
    console.error("[api/exhibitions/visitor/favorites] GET failed:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { visitorId, targetType, targetId } = await request.json()
    if (!visitorId || !targetType || !targetId) {
      return NextResponse.json({ success: false, error: "missing_fields" }, { status: 400 })
    }
    const favorite = await addFavorite(visitorId, targetType, targetId)
    return NextResponse.json({ success: true, data: favorite })
  } catch (err: any) {
    console.error("[api/exhibitions/visitor/favorites] POST failed:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const visitorId = searchParams.get("visitorId") || "visitor-local"
    const targetType = searchParams.get("targetType") as "booth" | "exhibit"
    const targetId = searchParams.get("targetId")

    if (!targetType || !targetId) {
      return NextResponse.json({ success: false, error: "missing_fields" }, { status: 400 })
    }

    const success = await removeFavorite(visitorId, targetType, targetId)
    return NextResponse.json({ success })
  } catch (err: any) {
    console.error("[api/exhibitions/visitor/favorites] DELETE failed:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
