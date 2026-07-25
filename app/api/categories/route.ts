import { NextResponse } from "next/server"
import { getCategories } from "@/lib/services/categories-service"

export async function GET() {
  const categories = await getCategories()

  return NextResponse.json({
    success: true,
    data: categories,
  })
}
