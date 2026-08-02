import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { markAllNotificationsRead } from "@/lib/services/notifications-service"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await markAllNotificationsRead(supabase, user.id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[api/notifications/mark-all-read] Error:", error)
    return NextResponse.json({ error: error.message || "Failed to mark all as read" }, { status: 500 })
  }
}
