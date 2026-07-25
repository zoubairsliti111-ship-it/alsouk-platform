import { NextResponse } from "next/server"
import { getCompanies } from "@/lib/services/companies-service"

export async function GET() {
  const companies = await getCompanies()

  return NextResponse.json({
    success: true,
    data: companies,
  })
}
