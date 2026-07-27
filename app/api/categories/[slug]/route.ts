import { NextResponse } from "next/server"
import { getCategoryBySlug } from "@/lib/services/categories-service"

export const dynamic = "force-dynamic"

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  try {
    const category = await getCategoryBySlug(slug)
    if (!category) {
      return NextResponse.json({ success: false, data: null }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: category })
  } catch (err) {
    console.error("[api/categories/[slug]] Failed to load category:", err)
    return NextResponse.json({ success: false, data: null }, { status: 500 })
  }
}
