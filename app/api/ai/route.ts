import { NextResponse } from "next/server"
import {
  ALSOUK_SYSTEM_PROMPT,
  generateReply,
  isAiConfigured,
  type ChatMessage,
  type ChatRole,
} from "@/lib/ai/provider"

export const dynamic = "force-dynamic"

const MAX_MESSAGES = 20
const MAX_CONTENT = 2000

/** Reports whether the assistant is available (so the UI can render state). */
export async function GET() {
  return NextResponse.json({ enabled: isAiConfigured() })
}

function isRole(value: unknown): value is ChatRole {
  return value === "user" || value === "assistant" || value === "system"
}

function sanitize(raw: unknown): ChatMessage[] | null {
  if (!Array.isArray(raw)) return null
  const messages: ChatMessage[] = []
  for (const item of raw) {
    if (typeof item !== "object" || item === null) return null
    const role = (item as { role?: unknown }).role
    const content = (item as { content?: unknown }).content
    // The system prompt is added server-side; ignore any client-sent one.
    if (role === "system") continue
    if (!isRole(role) || typeof content !== "string") return null
    const trimmed = content.trim()
    if (!trimmed) continue
    messages.push({ role, content: trimmed.slice(0, MAX_CONTENT) })
  }
  return messages.slice(-MAX_MESSAGES)
}

export async function POST(request: Request) {
  if (!isAiConfigured()) {
    return NextResponse.json({ enabled: false, reason: "disabled" }, { status: 503 })
  }

  let body: { messages?: unknown }
  try {
    body = (await request.json()) as { messages?: unknown }
  } catch {
    return NextResponse.json({ error: true, reason: "invalid_json" }, { status: 400 })
  }

  const messages = sanitize(body.messages)
  if (!messages || messages.length === 0) {
    return NextResponse.json({ error: true, reason: "validation" }, { status: 400 })
  }

  const result = await generateReply([
    { role: "system", content: ALSOUK_SYSTEM_PROMPT },
    ...messages,
  ])

  if (!result.ok) {
    const status = result.reason === "disabled" ? 503 : 502
    return NextResponse.json({ error: true, reason: result.reason }, { status })
  }
  return NextResponse.json({ reply: result.reply })
}
