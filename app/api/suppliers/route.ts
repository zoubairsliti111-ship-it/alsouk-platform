import { NextResponse } from "next/server"
import type { Supplier } from "@/lib/directory-data"

import {
  SORT_COLUMNS,
  SUPPLIER_COLUMNS,
  SUPPLIERS_TABLE,
  SUPPLIER_SORTS,
  mapRow,
  type SupplierRow,
  type SupplierSort,
} from "@/lib/supabase/suppliers-service"
import { KEY_VARS, URL_VARS, firstDefined } from "@/lib/supabase/env"

export const dynamic = "force-dynamic"

function reportVars(names: readonly string[]) {
  return names.map((name) => {
    const raw = process.env[name]
    return {
      name,
      inEnv: name in process.env,
      rawLength: raw?.length ?? 0,
      trimmedLength: raw?.trim().length ?? 0,
    }
  })
}

function buildDiag(): Record<string, unknown> {
  const url = firstDefined(URL_VARS)
  const key = firstDefined(KEY_VARS)
  return {
    urlVarPresent: Boolean(url.value),
    urlVarName: url.name ?? null,
    urlLooksLikeHttpUrl: url.value ? /^https?:\/\//.test(url.value) : false,
    keyVarPresent: Boolean(key.value),
    keyVarName: key.name ?? null,
    keyKind: key.value
      ? key.value.startsWith("sb_publishable_")
        ? "publishable"
        : key.value.startsWith("sb_secret_")
          ? "secret"
          : key.value.startsWith("eyJ")
            ? "jwt"
            : "unknown"
      : null,
    keyLength: key.value ? key.value.length : 0,
    checkedUrlVars: URL_VARS,
    checkedKeyVars: KEY_VARS,
    vercelEnv: process.env.VERCEL_ENV ?? null,
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
    presentEnvNames: Object.keys(process.env)
      .filter((name) => /supabase/i.test(name) || name.startsWith("NEXT_PUBLIC_"))
      .sort(),
    keyVarReport: reportVars(KEY_VARS),
    urlVarReport: reportVars(URL_VARS),
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const debug = searchParams.get("debug") === "1"
  const withDiag = (body: Record<string, unknown>) =>
    NextResponse.json(debug ? { ...body, diag: buildDiag() } : body)

  const url = firstDefined(URL_VARS).value
  const key = firstDefined(KEY_VARS).value
  if (!url || !key) {
    console.error(
      "[api/suppliers] Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
      "NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).",
    )
    return withDiag({ suppliers: [], error: true, reason: "unconfigured" })
  }
  if (!/^https?:\/\//.test(url)) {
    console.error("[api/suppliers] Supabase URL is not an http(s) URL.")
    return withDiag({ suppliers: [], error: true, reason: "bad_url" })
  }

  const sortParam = searchParams.get("sort")
  const sort: SupplierSort = SUPPLIER_SORTS.includes(sortParam as SupplierSort)
    ? (sortParam as SupplierSort)
    : "newest"
  const limitParam = Number.parseInt(searchParams.get("limit") ?? "", 10)
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : undefined

  let endpoint = `${url}/rest/v1/${SUPPLIERS_TABLE}?select=${SUPPLIER_COLUMNS}&active=eq.true&order=${SORT_COLUMNS[sort]}.desc`
  if (limit) endpoint += `&limit=${limit}`

  try {
    const res = await fetch(endpoint, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: "no-store",
    })
    if (!res.ok) {
      const text = await res.text()
      console.error("[api/suppliers] Supabase query failed:", res.status, text)
      return withDiag({ suppliers: [], error: true, reason: `upstream_${res.status}` })
    }
    const rows = (await res.json()) as SupplierRow[]

    const ids = rows.map((r) => r.id).filter(Boolean)
    if (ids.length > 0) {
      try {
        const idsParam = ids.map((id) => `"${id}"`).join(",")
        const countsRes = await fetch(
          `${url}/rest/v1/products?select=company_id&company_id=in.(${idsParam})&is_active=eq.true`,
          { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" },
        )
        if (countsRes.ok) {
          const productRows = (await countsRes.json()) as { company_id: string }[]
          const counts = new Map<string, number>()
          const mediaRes = await fetch(
            `${url}/rest/v1/company_media?select=company_id,url,created_at&company_id=in.(${idsParam})&media_type=in.(product_gallery,factory_photo)&order=created_at.asc`,
            { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" },
          )
          if (mediaRes.ok) {
            const mediaRows = (await mediaRes.json()) as { company_id: string; url: string }[]
            const firstPhoto = new Map<string, string>()
            for (const m of mediaRows) {
              if (!firstPhoto.has(m.company_id)) firstPhoto.set(m.company_id, m.url)
            }
            for (const row of rows) {
              row.cover_photo_url = firstPhoto.get(row.id) ?? null
            }
          }
          for (const p of productRows) {
            counts.set(p.company_id, (counts.get(p.company_id) ?? 0) + 1)
          }
          for (const row of rows) {
            row.products_count = counts.get(row.id) ?? 0
          }
        }
      } catch (err) {
        console.error("[api/suppliers] Failed to load product counts:", err)
      }
    }

    const suppliers = rows.map(mapRow).filter((s): s is Supplier => s !== null)
    return withDiag({ suppliers, error: false })
  } catch (err) {
    console.error("[api/suppliers] Unexpected error loading suppliers:", err)
    return withDiag({ suppliers: [], error: true, reason: "fetch_failed" })
  }
}
