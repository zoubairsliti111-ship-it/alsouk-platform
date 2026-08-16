import { NextResponse } from "next/server"
import {
  getDocumentsForBooth,
  createDocumentItem,
  deleteDocumentItem,
  getDocumentBoothId,
} from "@/lib/services/booth-media-service"
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

    const docList = await getDocumentsForBooth(boothId)
    return NextResponse.json({ success: true, data: docList })
  } catch (err: any) {
    console.error("[API/exhibitions/booth/documents GET] Error:", err)
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load booth documents" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { boothId, name, url, fileSize, sortOrder, language, description } = body

    if (!boothId || !name || !url) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (boothId, name, url)" },
        { status: 400 }
      )
    }

    const authz = await authorizeBoothOwner(boothId)
    if (!authz.ok) return authz.response

    const newItem = await createDocumentItem({
      boothId,
      name,
      url,
      fileSize: fileSize || "1.0 MB",
      sortOrder: Number(sortOrder) || 0,
      language: language || null,
      description: description || null,
    }, authz.auth.client)

    return NextResponse.json({ success: true, data: newItem })
  } catch (err: any) {
    console.error("[API/exhibitions/booth/documents POST] Error:", err)
    return NextResponse.json(
      { success: false, error: err.message || "Failed to upload document item" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing id parameter" },
        { status: 400 }
      )
    }

    const boothId = await getDocumentBoothId(id)
    const authz = await authorizeBoothOwner(boothId)
    if (!authz.ok) return authz.response

    const success = await deleteDocumentItem(id, authz.auth.client)
    return NextResponse.json({ success })
  } catch (err: any) {
    console.error("[API/exhibitions/booth/documents DELETE] Error:", err)
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete document item" },
      { status: 500 }
    )
  }
}
