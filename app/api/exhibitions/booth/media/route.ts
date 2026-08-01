import { NextResponse } from "next/server"
import {
  getMediaForBooth,
  createMediaItem,
  updateMediaItem,
  deleteMediaItem,
  updateMediaSortOrder,
  setBoothCoverImage,
} from "@/lib/services/booth-media-service"

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

    const mediaList = await getMediaForBooth(boothId)
    return NextResponse.json({ success: true, data: mediaList })
  } catch (err: any) {
    console.error("[API/exhibitions/booth/media GET] Error:", err)
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load booth media" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { boothId, mediaType, url, caption, sortOrder, thumbnailUrl, isCover } = body

    if (!boothId || !mediaType || !url) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (boothId, mediaType, url)" },
        { status: 400 }
      )
    }

    const newItem = await createMediaItem({
      boothId,
      mediaType,
      url,
      caption: caption || null,
      sortOrder: Number(sortOrder) || 0,
      thumbnailUrl: thumbnailUrl || null,
      isCover: Boolean(isCover),
    })

    return NextResponse.json({ success: true, data: newItem })
  } catch (err: any) {
    console.error("[API/exhibitions/booth/media POST] Error:", err)
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create media item" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { action, id, boothId, orderedIds, data } = body

    if (action === "reorder") {
      if (!boothId || !orderedIds) {
        return NextResponse.json(
          { success: false, error: "Missing boothId or orderedIds for reorder" },
          { status: 400 }
        )
      }
      await updateMediaSortOrder(boothId, orderedIds)
      return NextResponse.json({ success: true })
    }

    if (action === "setCover") {
      if (!boothId || !id) {
        return NextResponse.json(
          { success: false, error: "Missing boothId or id for setting cover image" },
          { status: 400 }
        )
      }
      await setBoothCoverImage(boothId, id)
      return NextResponse.json({ success: true })
    }

    if (action === "update") {
      if (!id || !data) {
        return NextResponse.json(
          { success: false, error: "Missing id or data for updating media" },
          { status: 400 }
        )
      }
      const updated = await updateMediaItem(id, data)
      return NextResponse.json({ success: true, data: updated })
    }

    return NextResponse.json(
      { success: false, error: "Invalid action parameter" },
      { status: 400 }
    )
  } catch (err: any) {
    console.error("[API/exhibitions/booth/media PATCH] Error:", err)
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update media details" },
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

    const success = await deleteMediaItem(id)
    return NextResponse.json({ success })
  } catch (err: any) {
    console.error("[API/exhibitions/booth/media DELETE] Error:", err)
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete media item" },
      { status: 500 }
    )
  }
}
