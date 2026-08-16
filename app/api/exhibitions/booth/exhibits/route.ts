import { NextResponse } from "next/server"
import {
  getExhibitsForBooth,
  createExhibit,
  updateExhibitsSortOrder,
} from "@/lib/services/exhibitions-service"
import { authorizeBoothOwner } from "@/lib/exhibitions/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const boothId = searchParams.get("boothId")

    if (!boothId) {
      return NextResponse.json(
        { success: false, error: "Missing boothId parameter" },
        { status: 400 }
      )
    }

    const exhibits = await getExhibitsForBooth(boothId)
    return NextResponse.json({ success: true, data: exhibits })
  } catch (err: any) {
    console.error("[API/exhibits GET] Error:", err)
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load exhibits" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      boothId,
      name,
      shortDescription,
      description,
      images,
      videos,
      pdfUrl,
      brochureUrl,
      isFeatured,
      sortOrder,
      category,
      status,
    } = body

    if (!boothId || !name) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: boothId and name are mandatory." },
        { status: 400 }
      )
    }

    const authz = await authorizeBoothOwner(boothId)
    if (!authz.ok) return authz.response

    const newExhibit = await createExhibit({
      boothId,
      name,
      shortDescription: shortDescription || null,
      description: description || null,
      images: images || [],
      videos: videos || [],
      pdfUrl: pdfUrl || null,
      brochureUrl: brochureUrl || null,
      isFeatured: Boolean(isFeatured),
      sortOrder: Number(sortOrder) || 0,
      category: category || null,
      status: status || "Draft",
    }, authz.auth.client)

    return NextResponse.json({ success: true, data: newExhibit })
  } catch (err: any) {
    console.error("[API/exhibits POST] Error:", err)
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create exhibit" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { boothId, orderedIds } = body

    if (!boothId || !Array.isArray(orderedIds)) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: boothId and orderedIds array are mandatory." },
        { status: 400 }
      )
    }

    const authz = await authorizeBoothOwner(boothId)
    if (!authz.ok) return authz.response

    const success = await updateExhibitsSortOrder(boothId, orderedIds, authz.auth.client)
    return NextResponse.json({ success })
  } catch (err: any) {
    console.error("[API/exhibits PATCH/REORDER] Error:", err)
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update sort orders" },
      { status: 500 }
    )
  }
}
