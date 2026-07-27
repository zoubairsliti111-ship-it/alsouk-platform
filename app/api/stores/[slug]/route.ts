import { NextResponse } from "next/server"
import { getStoreBySlug } from "@/lib/services/stores-service"

export const dynamic = "force-dynamic"

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  try {
    const store = await getStoreBySlug(slug)
    if (!store) {
      return NextResponse.json({ success: false, data: null }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: store })
  } catch (err) {
    console.error("[api/stores/[slug]] Failed to load store:", err)
    return NextResponse.json({ success: false, data: null }, { status: 500 })
  }
}
