import { NextResponse } from "next/server"
import { getCompanies } from "@/lib/services/companies-service"

// Read fresh on every request so the response reflects the current database.
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const companies = await getCompanies()
    return NextResponse.json({ success: true, data: companies })
  } catch (err) {
    console.error("[api/companies] Failed to load companies:", err)
    return NextResponse.json({ success: false, data: [] })
  }
}
