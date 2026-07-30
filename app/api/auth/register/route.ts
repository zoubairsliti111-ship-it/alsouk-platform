import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { cleanPhoneNumber, phoneToSyntheticEmail } from "@/lib/supabase/auth-helpers"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phone, password, fullName } = body

    if (!phone || !password || !fullName) {
      return NextResponse.json(
        { error: true, message: "Missing required fields" },
        { status: 400 }
      )
    }

    const admin = createAdminClient()
    const cleaned = cleanPhoneNumber(phone)
    const syntheticEmail = phoneToSyntheticEmail(cleaned)

    // Create the user with email_confirm: true using the admin API
    // This bypasses sending confirmation emails entirely for phone registrants
    const { data: newUser, error: createError } = await admin.auth.admin.createUser({
      email: syntheticEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName.trim(),
        phone_number: cleaned,
      },
    })

    if (createError) {
      console.error("Admin user creation error:", createError)
      return NextResponse.json(
        { error: true, message: createError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      user: newUser.user,
    })
  } catch (error: any) {
    console.error("Register route handler error:", error)
    return NextResponse.json(
      { error: true, message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
