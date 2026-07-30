import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { cleanPhoneNumber, phoneToSyntheticEmail } from "@/lib/supabase/auth-helpers"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, phone, newPassword } = body

    if (!newPassword) {
      return NextResponse.json({ error: true, message: "Missing newPassword parameter" }, { status: 400 })
    }

    const admin = createAdminClient()

    let targetUserId: string | null = null

    if (email) {
      const emailLower = email.toLowerCase()
      const { data, error } = await admin
        .schema("auth")
        .from("users")
        .select("id")
        .eq("email", emailLower)
        .limit(1)

      if (error) {
        console.error("reset-password error querying auth email:", error)
        return NextResponse.json({ error: true, message: error.message }, { status: 500 })
      }

      if (data && data[0]) {
        targetUserId = data[0].id
      }
    } else if (phone) {
      const cleaned = cleanPhoneNumber(phone)
      const syntheticEmail = phoneToSyntheticEmail(cleaned)

      const { data, error } = await admin
        .schema("auth")
        .from("users")
        .select("id")
        .or(`email.eq.${syntheticEmail.toLowerCase()},raw_user_meta_data->>phone_number.eq.${cleaned}`)
        .limit(1)

      if (error) {
        console.error("reset-password error querying auth phone:", error)
        return NextResponse.json({ error: true, message: error.message }, { status: 500 })
      }

      if (data && data[0]) {
        targetUserId = data[0].id
      }
    } else {
      return NextResponse.json({ error: true, message: "Missing email or phone identifier" }, { status: 400 })
    }

    if (!targetUserId) {
      return NextResponse.json({ error: true, message: "User not found" }, { status: 404 })
    }

    // 2. Perform admin password update immediately
    const { data, error: updateError } = await admin.auth.admin.updateUserById(targetUserId, {
      password: newPassword,
    })

    if (updateError) {
      console.error("reset-password error updating user:", updateError)
      return NextResponse.json({ error: true, message: updateError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: "Password updated successfully" })
  } catch (error: any) {
    console.error("reset-password route handler error:", error)
    return NextResponse.json({ error: true, message: error.message || "Internal server error" }, { status: 500 })
  }
}
