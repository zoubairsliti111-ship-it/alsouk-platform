import { NextResponse } from "next/server"
import {
  ALSOUK_SYSTEM_PROMPT,
  generateReply,
  isAiConfigured,
  type ChatMessage,
  type ChatRole,
} from "@/lib/ai/provider"
import { search } from "@/lib/services/search-service"
import { checkRateLimit } from "@/lib/rate-limit/api"

export const dynamic = "force-dynamic"

const MAX_MESSAGES = 20
const MAX_CONTENT = 2000

// A real chat session sends several messages; this caps abuse (scripted
// hammering of the shared Groq quota) without interrupting normal use.
const RATE_LIMIT_MAX = 20
const RATE_LIMIT_WINDOW_SECONDS = 600

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

/**
 * Builds a context block from real ALSOUK listings matching the user's last
 * message, so the assistant grounds its answer in actual companies/products
 * instead of generic advice. Returns null when nothing matched (the prompt
 * then tells the assistant to say so honestly rather than invent results).
 */
async function buildGroundingContext(messages: ChatMessage[]): Promise<string | null> {
  const lastUser = [...messages].reverse().find((m) => m.role === "user")
  if (!lastUser) return null

  const results = await search(lastUser.content, 5)
  const lines: string[] = []

  if (results.companies.length > 0) {
    lines.push("Matching companies on ALSOUK:")
    for (const c of results.companies) {
      lines.push(`- ${c.name} (${c.country ?? "unknown country"}) — /companies/${c.slug}`)
    }
  }

  if (results.products.length > 0) {
    lines.push("Matching products on ALSOUK:")
    for (const p of results.products) {
      const price = p.price != null ? `${p.price} TND` : "price on request"
      lines.push(`- ${p.name} — ${price}`)
    }
  }

  if (lines.length === 0) return null
  return lines.join("\n")
}

export async function POST(request: Request) {
  if (!isAiConfigured()) {
    return NextResponse.json({ enabled: false, reason: "disabled" }, { status: 503 })
  }

  const allowed = await checkRateLimit(request, "ai", RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_SECONDS)
  if (!allowed) {
    return NextResponse.json(
      { error: true, reason: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(RATE_LIMIT_WINDOW_SECONDS) } },
    )
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

  const grounding = await buildGroundingContext(messages)

  const systemMessages: ChatMessage[] = [{ role: "system", content: ALSOUK_SYSTEM_PROMPT }]
  if (grounding) {
    systemMessages.push({
      role: "system",
      content:
        "Here are real, current ALSOUK listings relevant to the user's question. " +
        "Base your answer on these when relevant, and mention them by name. " +
        "Do not invent companies or products that are not listed here.\n\n" + grounding,
    })
  } else {
    systemMessages.push({
      role: "system",
      content:
        "No matching companies or products were found on ALSOUK for this query. " +
        "Say so honestly, and suggest the user browse categories or post an RFQ " +
        "instead of inventing suppliers or products that don't exist on the platform.",
    })
  }

  const result = await generateReply([...systemMessages, ...messages])

  if (!result.ok) {
    const status = result.reason === "disabled" ? 503 : 502
    return NextResponse.json({ error: true, reason: result.reason }, { status })
  }
  return NextResponse.json({ reply: result.reply })
}
