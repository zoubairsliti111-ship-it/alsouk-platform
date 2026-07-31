import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { fetchUnreadCount } from "@/lib/services/notifications-service"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    const isUnconfigured = !process.env.NEXT_PUBLIC_SUPABASE_URL
    if (isUnconfigured) {
      // Fetch current mock state from GET route by checking our local unread count
      // Or we can just import the state or query it.
      // Wait, let's look at `app/api/notifications/route.ts`.
      // The mock read state can be imported, or we can check the state manually or use a standard mock count.
      // Let's import the read state or simply read it directly if we want, or since they run in the same node process,
      // we can fetch the route or we can just count values of false in the process memory!
      // Let's import mockReadState from our route.ts or define a shared module.
      // Even simpler, we can fetch `http://localhost:3000/api/notifications` or compute it locally by checking process variables.
      // Wait, let's keep it simple: we can count unread mock notifications!
      // Let's define the mock notifications here and count them based on process state if available, or just fetch count.
      // Since `app/api/notifications/route.ts` has `mockReadState`, we can check it. But to avoid circular or split imports,
      // let's do a fetch request or just declare a local helper, or we can fetch the GET endpoint!
      // Fetching the GET endpoint is extremely robust, standard, and handles everything dynamically!
      // Let's do a local fetch to /api/notifications!
      // Wait, fetch in NextJS server needs absolute URL during build, but at runtime on dev server, we can fetch or we can
      // just import a shared state, or we can simply count local mockReadState.
      // Let's see: we can import `setMockRead` and get the mock count from a shared state, or let's use a very clean, simple import:
      // Let's use standard import.
      // Or even simpler: let's declare a global variable on `globalThis`! This is a bulletproof way to share state across route files!
      const globalMockReadState = (globalThis as any).mockReadState || {
        "mock-1": false,
        "mock-2": false,
        "mock-3": true,
        "mock-4": true
      }
      const count = Object.values(globalMockReadState).filter(v => v === false).length
      return NextResponse.json({ success: true, count })
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const count = await fetchUnreadCount(supabase, user.id)

    return NextResponse.json({ success: true, count })
  } catch (error: any) {
    console.error("[api/notifications/unread-count] Error:", error)
    return NextResponse.json({ error: error.message || "Failed to load unread count" }, { status: 500 })
  }
}
