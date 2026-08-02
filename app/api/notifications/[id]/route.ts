import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { markNotificationRead, deleteNotification } from "@/lib/services/notifications-service"

export const dynamic = "force-dynamic"

type Context = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, context: Context) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    let body: { isRead?: boolean } = {}
    try {
      body = await request.json()
    } catch {
      // default to true
    }
    const isRead = body.isRead !== false

    const isUnconfigured = !process.env.NEXT_PUBLIC_SUPABASE_URL
    if (isUnconfigured) {
      if (!(globalThis as any).mockReadState) {
        (globalThis as any).mockReadState = {}
      }
      (globalThis as any).mockReadState[id] = isRead
      return NextResponse.json({
        success: true,
        data: { id, isRead }
      })
    }

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const updated = await markNotificationRead(supabase, user.id, id, isRead)

    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    console.error("[api/notifications/[id]] PATCH Error:", error)
    return NextResponse.json({ error: error.message || "Failed to update notification" }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: Context) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    const isUnconfigured = !process.env.NEXT_PUBLIC_SUPABASE_URL
    if (isUnconfigured) {
      if ((globalThis as any).mockReadState) {
        delete (globalThis as any).mockReadState[id]
      }
      return NextResponse.json({ success: true })
    }

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await deleteNotification(supabase, user.id, id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[api/notifications/[id]] DELETE Error:", error)
    return NextResponse.json({ error: error.message || "Failed to delete notification" }, { status: 500 })
  }
}
