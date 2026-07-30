import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { cleanPhoneNumber, phoneToSyntheticEmail } from "@/lib/supabase/auth-helpers"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, phone } = body

    const admin = createAdminClient()

    if (email) {
      const emailLower = email.toLowerCase()
      const { data, error } = await admin
        .schema("auth")
        .from("users")
        .select("id")
        .eq("email", emailLower)
        .limit(1)

      if (error) {
        console.error("check-unique error querying auth email:", error)
        return NextResponse.json({ error: true, message: error.message }, { status: 500 })
      }

      const exists = data && data.length > 0
      return NextResponse.json({ exists })
    }

    if (phone) {
      const cleaned = cleanPhoneNumber(phone)
      const syntheticEmail = phoneToSyntheticEmail(cleaned)

      // Query users where email matches synthetic email OR phone_number matches in metadata jsonb
      const { data, error } = await admin
        .schema("auth")
        .from("users")
        .select("id")
        .or(`email.eq.${syntheticEmail.toLowerCase()},raw_user_meta_data->>phone_number.eq.${cleaned}`)
        .limit(1)

      if (error) {
        console.error("check-unique error querying auth phone:", error)
        return NextResponse.json({ error: true, message: error.message }, { status: 500 })
      }

      const exists = data && data.length > 0
      return NextResponse.json({ exists })
    }

    return NextResponse.json({ error: true, message: "Missing email or phone parameter" }, { status: 400 })
  } catch (error: any) {
    console.error("check-unique route handler error:", error)
    return NextResponse.json({ error: true, message: error.message || "Internal server error" }, { status: 500 })
  }
}
