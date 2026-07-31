import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { fetchNotifications, deleteAllNotifications } from "@/lib/services/notifications-service"
import { type NotificationType } from "@/lib/domains/notification/types"

export const dynamic = "force-dynamic"

// Realistic Mock Notifications for unconfigured local builds to enable frontend verification
const getMockNotifications = () => {
  const now = new Date()
  return [
    {
      id: "mock-1",
      recipient_id: "mock-user-id",
      actor_company_id: "mock-actor-1",
      type: "rfq_received",
      entity_type: "rfq",
      entity_id: "rfq-1",
      title: "New RFQ Received 📦",
      body: "You received a new RFQ from Atlas Distribution for 'Extra Virgin Olive Oil Bulk'.",
      image_url: null,
      action_url: "/account?tab=rfqs",
      is_read: false,
      created_at: new Date(now.getTime() - 1000 * 60 * 15).toISOString(), // 15 mins ago (Today)
      metadata: {}
    },
    {
      id: "mock-2",
      recipient_id: "mock-user-id",
      actor_company_id: "mock-actor-2",
      type: "follower",
      entity_type: "company",
      entity_id: "comp-1",
      title: "New Follower 👤",
      body: "Sonia Ben Ali started following your company on ALSOUK.",
      image_url: null,
      action_url: "/account",
      is_read: false,
      created_at: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago (Today)
      metadata: {}
    },
    {
      id: "mock-3",
      recipient_id: "mock-user-id",
      actor_company_id: "mock-actor-3",
      type: "comment",
      entity_type: "post",
      entity_id: "post-1",
      title: "New Comment 💬",
      body: "A user commented on 'Our newest harvest': 'Great quality dates, highly recommended!'",
      image_url: null,
      action_url: "/discover",
      is_read: true,
      created_at: new Date(now.getTime() - 1000 * 60 * 60 * 26).toISOString(), // ~26 hours ago (Yesterday)
      metadata: {}
    },
    {
      id: "mock-4",
      recipient_id: "mock-user-id",
      actor_company_id: "mock-actor-4",
      type: "live_started",
      entity_type: "stream",
      entity_id: "stream-1",
      title: "🔴 Live Stream Started",
      body: "Medina Olive Co. is live now: 'Cold-Pressing Olive Oil Tour'",
      image_url: null,
      action_url: "/discover",
      is_read: true,
      created_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 4).toISOString(), // 4 days ago (Earlier)
      metadata: {}
    }
  ]
}

// In-memory simulation of read status for mock notifications during local verification using globalThis
function getMockReadState() {
  if (!(globalThis as any).mockReadState) {
    (globalThis as any).mockReadState = {
      "mock-1": false,
      "mock-2": false,
      "mock-3": true,
      "mock-4": true
    }
  }
  return (globalThis as any).mockReadState
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // Bypassing auth check for local development demo is fine, or we can use mock user
    const finalUser = user || { id: "mock-user-id", email: "mock@alsouk.com" }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get("unreadOnly") === "true"
    const type = searchParams.get("type") as NotificationType | null
    const cursor = searchParams.get("cursor") || undefined
    const limitParam = searchParams.get("limit")
    const limit = limitParam ? parseInt(limitParam, 10) : 20

    // Check if Supabase is unconfigured (returns true when we are on mock fallback)
    const isUnconfigured = !process.env.NEXT_PUBLIC_SUPABASE_URL

    if (isUnconfigured) {
      const mockRead = getMockReadState()
      // Return custom mock notifications
      let list = getMockNotifications().map(n => ({
        ...n,
        is_read: mockRead[n.id] ?? n.is_read
      }))

      if (unreadOnly) {
        list = list.filter(n => !n.is_read)
      }

      if (type) {
        list = list.filter(n => n.type === type)
      }

      // Pagination slice simulation
      return NextResponse.json({
        success: true,
        data: list.map(n => ({
          id: n.id,
          recipientId: n.recipient_id,
          actorCompanyId: n.actor_company_id,
          type: n.type as NotificationType,
          entityType: n.entity_type,
          entityId: n.entity_id,
          title: n.title,
          body: n.body,
          imageUrl: n.image_url,
          actionUrl: n.action_url,
          isRead: n.is_read,
          createdAt: n.created_at,
          metadata: n.metadata
        })),
        nextCursor: null
      })
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await fetchNotifications(supabase, finalUser.id, {
      unreadOnly,
      type: type || undefined,
      cursor,
      limit: isNaN(limit) ? 20 : limit
    })

    return NextResponse.json({ success: true, ...result })
  } catch (error: any) {
    console.error("[api/notifications] Fetch error:", error)
    return NextResponse.json({ error: error.message || "Failed to load notifications" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    const isUnconfigured = !process.env.NEXT_PUBLIC_SUPABASE_URL
    if (isUnconfigured) {
      (globalThis as any).mockReadState = {}
      return NextResponse.json({ success: true })
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await deleteAllNotifications(supabase, user.id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[api/notifications] Bulk delete error:", error)
    return NextResponse.json({ error: error.message || "Failed to clear notifications" }, { status: 500 })
  }
}
