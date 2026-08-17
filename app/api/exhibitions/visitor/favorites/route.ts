import { NextResponse } from "next/server"
import { getFavorites, addFavorite, removeFavorite } from "@/lib/services/exhibitions-service"
import { authorizeVisitor } from "@/lib/exhibitions/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const auth = await authorizeVisitor()
  if (!auth.ok) return auth.response

  try {
    const favorites = await getFavorites(auth.userId)
    return NextResponse.json({ success: true, data: favorites })
  } catch (err: any) {
    console.error("[api/exhibitions/visitor/favorites] GET failed:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await authorizeVisitor()
  if (!auth.ok) return auth.response

  try {
    const { targetType, targetId } = await request.json()
    if (!targetType || !targetId) {
      return NextResponse.json({ success: false, error: "missing_fields" }, { status: 400 })
    }
    const favorite = await addFavorite(auth.userId, targetType, targetId)
    return NextResponse.json({ success: true, data: favorite })
  } catch (err: any) {
    // target_not_found: targetId isn't a real, live booth/exhibit (e.g. a
    // legacy demo booth id) — there's honestly nothing to favorite.
    if (err.message === "target_not_found") {
      return NextResponse.json({ success: false, error: "target_not_found" }, { status: 400 })
    }
    console.error("[api/exhibitions/visitor/favorites] POST failed:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const auth = await authorizeVisitor()
  if (!auth.ok) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const targetType = searchParams.get("targetType") as "booth" | "exhibit"
    const targetId = searchParams.get("targetId")

    if (!targetType || !targetId) {
      return NextResponse.json({ success: false, error: "missing_fields" }, { status: 400 })
    }

    const success = await removeFavorite(auth.userId, targetType, targetId)
    return NextResponse.json({ success })
  } catch (err: any) {
    console.error("[api/exhibitions/visitor/favorites] DELETE failed:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
