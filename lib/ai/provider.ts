// Provider-agnostic AI layer for the ALSOUK assistant.
//
// The assistant is *pluggable and safely disabled by default*: it only turns on
// when an API key is configured via env. No SDK dependency — we call any
// OpenAI-compatible Chat Completions endpoint over fetch, so switching provider
// is just a base URL + model change. All secrets stay server-side; nothing here
// is imported by client components.

import { firstDefined } from "@/lib/supabase/env"

/** Env var names checked, in order, for the (server-only) AI API key. */
export const AI_KEY_VARS = ["AI_API_KEY", "OPENAI_API_KEY"] as const

/** Optional overrides; sensible defaults target the OpenAI API. */
const AI_BASE_URL_VAR = "AI_BASE_URL"
const AI_MODEL_VAR = "AI_MODEL"

const DEFAULT_BASE_URL = "https://api.openai.com/v1"
const DEFAULT_MODEL = "gpt-4o-mini"

export type ChatRole = "system" | "user" | "assistant"
export type ChatMessage = { role: ChatRole; content: string }

export type AiConfig = {
  apiKey: string
  baseUrl: string
  model: string
}

/**
 * Resolves the AI configuration from the environment, or `null` when no API key
 * is set. A `null` result means the assistant is disabled — callers must treat
 * this as a normal, non-error state.
 */
export function getAiConfig(): AiConfig | null {
  const apiKey = firstDefined(AI_KEY_VARS).value
  if (!apiKey) return null
  const baseUrl = (process.env[AI_BASE_URL_VAR]?.trim() || DEFAULT_BASE_URL).replace(/\/$/, "")
  const model = process.env[AI_MODEL_VAR]?.trim() || DEFAULT_MODEL
  return { apiKey, baseUrl, model }
}

/** True when an AI provider is configured. Safe to call anywhere server-side. */
export function isAiConfigured(): boolean {
  return getAiConfig() !== null
}

export type GenerateResult =
  | { ok: true; reply: string }
  | { ok: false; reason: "disabled" | "error" }

/**
 * Sends a conversation to the configured provider and returns the assistant's
 * reply. Returns `{ ok: false, reason: "disabled" }` when no provider is
 * configured so the UI can degrade gracefully instead of erroring.
 */
export async function generateReply(messages: ChatMessage[]): Promise<GenerateResult> {
  const config = getAiConfig()
  if (!config) return { ok: false, reason: "disabled" }

  try {
    const res = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        temperature: 0.3,
        max_tokens: 500,
      }),
      cache: "no-store",
    })
    if (!res.ok) {
      const text = await res.text()
      console.error("[ai] Provider responded", res.status, text.slice(0, 500))
      return { ok: false, reason: "error" }
    }
    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const reply = json.choices?.[0]?.message?.content?.trim()
    if (!reply) return { ok: false, reason: "error" }
    return { ok: true, reply }
  } catch (err) {
    console.error("[ai] Request failed:", err)
    return { ok: false, reason: "error" }
  }
}

/**
 * Extracts short search keywords from a natural-language query using the
 * configured AI provider (e.g. turns "where can I find wholesale clothing
 * suppliers with good prices?" into "clothing wholesale"). Falls back to
 * null when no provider is configured or extraction fails, so callers can
 * fall back to the raw query.
 */
export async function extractSearchKeywords(query: string): Promise<string | null> {
  const config = getAiConfig()
  if (!config) return null

  const trimmed = query.trim()
  if (!trimmed) return null

  const result = await generateReply([
    {
      role: "system",
      content:
        "Extract 2 to 5 short search keywords (product type, category, material) " +
        "from the user query below, for a B2B marketplace search. Reply with ONLY " +
        "the keywords separated by spaces, no punctuation, no explanation, in the " +
        "same language as the query. If the query is already just keywords, return " +
        "it as-is.",
    },
    { role: "user", content: trimmed.slice(0, 300) },
  ])

  if (!result.ok) return null
  const cleaned = result.reply.trim().replace(/["'.]/g, "")
  return cleaned || null
}

/** System prompt that scopes the assistant to ALSOUK's B2B use case. */
export const ALSOUK_SYSTEM_PROMPT =
  "You are the ALSOUK assistant, a concise helper for a B2B marketplace serving " +
  "manufacturers, suppliers, wholesalers, importers, distributors and retailers " +
  "in Tunisia and North Africa. Help merchants find suppliers and products, " +
  "understand MOQs and trade terms, and prepare RFQs (requests for quote). Keep " +
  "answers short, practical and professional. If asked something outside B2B " +
  "commerce, gently steer back. Reply in the language the user writes in."
