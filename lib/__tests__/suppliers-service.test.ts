import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const getSupabaseClient = vi.fn()
vi.mock("@/lib/supabase/client", () => ({
  getSupabaseClient: () => getSupabaseClient(),
}))

import { fetchSuppliers, SUPPLIERS_TABLE } from "@/lib/supabase/suppliers-service"

type Row = Record<string, unknown>

/**
 * Minimal Supabase query-builder double. `from().select().order().limit()` all
 * return the same thenable that resolves to `{ data, error }`.
 */
function fakeClient(result: { data: Row[] | null; error: { message: string } | null }) {
  const calls = { table: "", order: [] as unknown[], limit: undefined as number | undefined }
  const builder: Record<string, unknown> = {
    select: vi.fn(() => builder),
    order: vi.fn((col: string, opts: unknown) => {
      calls.order = [col, opts]
      return builder
    }),
    limit: vi.fn((n: number) => {
      calls.limit = n
      return builder
    }),
    then: (resolve: (v: typeof result) => unknown) => resolve(result),
  }
  const client = {
    from: vi.fn((table: string) => {
      calls.table = table
      return builder
    }),
  }
  return { client, calls, builder }
}

function validRow(overrides: Partial<Row> = {}): Row {
  return {
    id: "medina-olive",
    company_name: "Medina Olive Co.",
    monogram: "MO",
    logo_color: "green",
    country: "tn",
    city: "sfax",
    region: "coastal",
    verified: true,
    rating: 4.9,
    reviews: 312,
    products: 148,
    years_in_business: 8,
    response_rate: 98,
    min_moq: 500,
    business_type: "manufacturer",
    category: "food",
    ...overrides,
  }
}

const originalConsoleError = console.error
beforeEach(() => {
  getSupabaseClient.mockReset()
  console.error = vi.fn()
})
afterEach(() => {
  console.error = originalConsoleError
})

describe("fetchSuppliers", () => {
  it("returns an error result when Supabase is not configured", async () => {
    getSupabaseClient.mockReturnValue(null)
    const res = await fetchSuppliers()
    expect(res).toEqual({ suppliers: [], error: true })
  })

  it("maps a valid row into a strongly-typed supplier", async () => {
    const { client } = fakeClient({ data: [validRow()], error: null })
    getSupabaseClient.mockReturnValue(client)

    const res = await fetchSuppliers()
    expect(res.error).toBe(false)
    expect(res.suppliers).toHaveLength(1)
    expect(res.suppliers[0]).toMatchObject({
      id: "medina-olive",
      name: "Medina Olive Co.",
      country: "tn",
      region: "coastal",
      businessTypes: ["manufacturer"],
      categories: ["food"],
      logoColor: "green",
    })
  })

  it("resolves English display names for country and city", async () => {
    const { client } = fakeClient({
      data: [validRow({ country: "Tunisia", city: "Sfax" })],
      error: null,
    })
    getSupabaseClient.mockReturnValue(client)

    const res = await fetchSuppliers()
    expect(res.suppliers[0]).toMatchObject({ country: "tn", cityKey: "sfax" })
  })

  it("falls back to the raw lowercased city when it is neither a key nor a known name", async () => {
    const { client } = fakeClient({ data: [validRow({ city: "Gabès" })], error: null })
    getSupabaseClient.mockReturnValue(client)

    const res = await fetchSuppliers()
    expect(res.suppliers[0].cityKey).toBe("gabès")
  })

  it("derives a monogram from the company name when missing", async () => {
    const { client } = fakeClient({
      data: [validRow({ monogram: null, company_name: "Atlas Ceramics" })],
      error: null,
    })
    getSupabaseClient.mockReturnValue(client)

    const res = await fetchSuppliers()
    expect(res.suppliers[0].monogram).toBe("AC")
  })

  it("defaults logoColor to blue for unknown values", async () => {
    const { client } = fakeClient({ data: [validRow({ logo_color: "purple" })], error: null })
    getSupabaseClient.mockReturnValue(client)

    const res = await fetchSuppliers()
    expect(res.suppliers[0].logoColor).toBe("blue")
  })

  it("skips rows with missing ids, invalid enums, or no category/business type", async () => {
    const { client } = fakeClient({
      data: [
        validRow({ id: "", company_name: "No Id" }),
        validRow({ id: "bad-region", region: "outer-space" }),
        validRow({ id: "bad-country", country: "atlantis" }),
        validRow({ id: "no-category", category: null }),
        validRow({ id: "no-type", business_type: null }),
        validRow({ id: "ok" }),
      ],
      error: null,
    })
    getSupabaseClient.mockReturnValue(client)

    const res = await fetchSuppliers()
    expect(res.suppliers.map((s) => s.id)).toEqual(["ok"])
  })

  it("queries the suppliers table ordered by the requested sort column", async () => {
    const { client, calls } = fakeClient({ data: [], error: null })
    getSupabaseClient.mockReturnValue(client)

    await fetchSuppliers({ sort: "years", limit: 3 })
    expect(calls.table).toBe(SUPPLIERS_TABLE)
    expect(calls.order).toEqual(["years_in_business", { ascending: false }])
    expect(calls.limit).toBe(3)
  })

  it("defaults to ordering by rating when no sort is given", async () => {
    const { client, calls } = fakeClient({ data: [], error: null })
    getSupabaseClient.mockReturnValue(client)

    await fetchSuppliers()
    expect(calls.order).toEqual(["rating", { ascending: false }])
  })

  it("returns an error result when the query reports an error", async () => {
    const { client } = fakeClient({ data: null, error: { message: "boom" } })
    getSupabaseClient.mockReturnValue(client)

    const res = await fetchSuppliers()
    expect(res).toEqual({ suppliers: [], error: true })
  })

  it("returns an error result when the query throws", async () => {
    const client = {
      from: vi.fn(() => {
        throw new Error("network down")
      }),
    }
    getSupabaseClient.mockReturnValue(client)

    const res = await fetchSuppliers()
    expect(res).toEqual({ suppliers: [], error: true })
  })
})
