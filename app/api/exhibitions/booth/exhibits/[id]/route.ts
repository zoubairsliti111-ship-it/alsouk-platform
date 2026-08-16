import { NextResponse } from "next/server"
import {
  updateExhibit,
  deleteExhibit,
  duplicateExhibit,
  mapExhibitionExhibit,
  getExhibitBoothId,
} from "@/lib/services/exhibitions-service"
import { restGet } from "@/lib/supabase/rest"
import type { ExhibitionItemRow } from "@/lib/services/exhibitions-service"
import { authorizeBoothOwner } from "@/lib/exhibitions/server"

export const dynamic = "force-dynamic"

/** Looks up a real exhibit by ID. Returns null if it doesn't exist. */
async function findExhibitById(id: string) {
  try {
    const rows = await restGet<ExhibitionItemRow>(
      `exhibition_items?select=*&id=eq.${encodeURIComponent(id)}&limit=1`
    )
    if (rows && rows.length > 0) {
      return mapExhibitionExhibit(rows[0])
    }
  } catch (err) {
    console.warn(`[findExhibitById] Error querying database for ID ${id}:`, err)
  }
  return null
}

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const id = params.id

    const exhibit = await findExhibitById(id)
    if (!exhibit) {
      return NextResponse.json(
        { success: false, error: "Exhibit not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: exhibit })
  } catch (err: any) {
    console.error("[API/exhibits/[id] GET] Error:", err)
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load exhibit detail" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const id = params.id
    const body = await request.json()
    const { action, data } = body

    if (!action) {
      return NextResponse.json(
        { success: false, error: "Missing action in body (update or duplicate required)" },
        { status: 400 }
      )
    }

    const boothId = await getExhibitBoothId(id)
    const authz = await authorizeBoothOwner(boothId)
    if (!authz.ok) return authz.response

    if (action === "duplicate") {
      const copied = await duplicateExhibit(id, authz.auth.client)
      return NextResponse.json({ success: true, data: copied })
    }

    if (action === "update") {
      if (!data) {
        return NextResponse.json(
          { success: false, error: "Missing data payload for update action" },
          { status: 400 }
        )
      }

      const updated = await updateExhibit(id, data, authz.auth.client)
      return NextResponse.json({ success: true, data: updated })
    }

    return NextResponse.json(
      { success: false, error: `Invalid action: ${action}` },
      { status: 400 }
    )
  } catch (err: any) {
    console.error("[API/exhibits/[id] PATCH] Error:", err)
    return NextResponse.json(
      { success: false, error: err.message || "Failed to edit/duplicate exhibit" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const id = params.id

    const boothId = await getExhibitBoothId(id)
    const authz = await authorizeBoothOwner(boothId)
    if (!authz.ok) return authz.response

    const success = await deleteExhibit(id, authz.auth.client)
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Exhibit not found or deletion failed" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("[API/exhibits/[id] DELETE] Error:", err)
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete exhibit" },
      { status: 500 }
    )
  }
}
