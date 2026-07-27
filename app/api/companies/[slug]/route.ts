import { NextResponse } from "next/server"
import { getCompanyBySlug } from "@/lib/services/companies-service"

export const dynamic = "force-dynamic"

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  try {
    const company = await getCompanyBySlug(slug)
    if (!company) {
      return NextResponse.json({ success: false, data: null }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: company })
  } catch (err) {
    console.error("[api/companies/[slug]] Failed to load company:", err)
    return NextResponse.json({ success: false, data: null }, { status: 500 })
  }
}
