import { NextResponse } from "next/server"
import { getProducts, type ProductFilter } from "@/lib/services/products-service"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const filter: ProductFilter = {}
  const companyId = searchParams.get("companyId")
  const storeId = searchParams.get("storeId")
  const categoryId = searchParams.get("categoryId")
  const limit = searchParams.get("limit")
  if (companyId) filter.companyId = companyId
  if (storeId) filter.storeId = storeId
  if (categoryId) filter.categoryId = categoryId
  if (limit) {
    const n = Number(limit)
    if (Number.isFinite(n) && n > 0) filter.limit = Math.min(n, 100)
  }

  try {
    const products = await getProducts(filter)
    return NextResponse.json({ success: true, data: products })
  } catch (err) {
    console.error("[api/products] Failed to load products:", err)
    return NextResponse.json({ success: false, data: [] })
  }
}
