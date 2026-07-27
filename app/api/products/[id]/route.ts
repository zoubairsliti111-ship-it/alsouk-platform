import { NextResponse } from "next/server"
import { getProductById } from "@/lib/services/products-service"

export const dynamic = "force-dynamic"

// Matches the UUID shape used by product primary keys; guards against junk ids.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ success: false, data: null }, { status: 404 })
  }
  try {
    const product = await getProductById(id)
    if (!product) {
      return NextResponse.json({ success: false, data: null }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: product })
  } catch (err) {
    console.error("[api/products/[id]] Failed to load product:", err)
    return NextResponse.json({ success: false, data: null }, { status: 500 })
  }
}
