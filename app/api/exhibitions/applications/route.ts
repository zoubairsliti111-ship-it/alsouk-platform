import { NextResponse } from "next/server"
import {
  createExhibitionApplication,
  checkDuplicateApplication,
  getApplicationsList,
} from "@/lib/services/exhibitions-service"
import { authorizeAdmin } from "@/lib/admin/server"

export const dynamic = "force-dynamic"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[+]?[\d\s().-]{6,20}$/

export async function GET(request: Request) {
  try {
    const authz = await authorizeAdmin()
    if (!authz.ok) return authz.response

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "all"
    const search = searchParams.get("search") || ""
    const sort = (searchParams.get("sort") || "newest") as "newest" | "oldest"

    const applications = await getApplicationsList({
      status,
      search,
      sort,
    }, authz.auth.service)

    return NextResponse.json({ success: true, data: applications })
  } catch (err: any) {
    console.error("[api/exhibitions/applications] GET failed:", err)
    return NextResponse.json(
      { success: false, error: err.message || "internal_server_error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, error: "invalid_json" },
        { status: 400 }
      )
    }

    const {
      exhibitionId,
      companyId,
      companyName,
      contactPerson,
      email,
      phone,
      country,
      businessCategory,
      shortDescription,
      message,
    } = body

    // 1. Required Fields Validation
    if (
      !exhibitionId ||
      !companyName?.trim() ||
      !contactPerson?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !country?.trim() ||
      !businessCategory?.trim() ||
      !shortDescription?.trim()
    ) {
      return NextResponse.json(
        { success: false, error: "missing_required_fields" },
        { status: 400 }
      )
    }

    // 2. Format Validation
    const cleanEmail = email.trim()
    const cleanPhone = phone.trim()

    if (!EMAIL_RE.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: "invalid_email" },
        { status: 400 }
      )
    }

    if (!PHONE_RE.test(cleanPhone)) {
      return NextResponse.json(
        { success: false, error: "invalid_phone" },
        { status: 400 }
      )
    }

    // 3. Character Limits Validation
    if (companyName.length > 255) {
      return NextResponse.json(
        { success: false, error: "company_name_too_long" },
        { status: 400 }
      )
    }
    if (contactPerson.length > 255) {
      return NextResponse.json(
        { success: false, error: "contact_person_too_long" },
        { status: 400 }
      )
    }
    if (businessCategory.length > 255) {
      return NextResponse.json(
        { success: false, error: "business_category_too_long" },
        { status: 400 }
      )
    }
    if (shortDescription.length > 500) {
      return NextResponse.json(
        { success: false, error: "short_description_too_long" },
        { status: 400 }
      )
    }
    if (message && message.length > 2000) {
      return NextResponse.json(
        { success: false, error: "message_too_long" },
        { status: 400 }
      )
    }

    // 4. Duplicate Check
    const isDuplicate = await checkDuplicateApplication(
      exhibitionId,
      cleanEmail,
      companyId || null
    )

    if (isDuplicate) {
      return NextResponse.json(
        { success: false, error: "duplicate" },
        { status: 409 }
      )
    }

    // 5. Create application record
    const application = await createExhibitionApplication({
      exhibitionId,
      companyId: companyId || null,
      companyName: companyName.trim(),
      contactPerson: contactPerson.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      country: country.trim(),
      businessCategory: businessCategory.trim(),
      shortDescription: shortDescription.trim(),
      message: message ? message.trim() : null,
    })

    return NextResponse.json({ success: true, data: application }, { status: 201 })
  } catch (err) {
    console.error("[api/exhibitions/applications] POST failed:", err)
    return NextResponse.json(
      { success: false, error: "internal_server_error" },
      { status: 500 }
    )
  }
}
