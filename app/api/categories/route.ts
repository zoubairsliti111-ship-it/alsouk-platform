import { NextResponse } from "next/server"
import { getCategories } from "@/lib/services/categories-service"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const categories = await getCategories()
    return NextResponse.json({ success: true, data: categories })
  } catch (err) {
    console.error("[api/categories] Failed to load categories:", err)
    return NextResponse.json({ success: false, data: [] })
  }
}
