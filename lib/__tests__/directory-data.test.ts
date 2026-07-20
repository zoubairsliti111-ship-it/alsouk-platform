import { describe, expect, it } from "vitest"
import {
  BUSINESS_TYPE_KEYS,
  CATEGORY_KEYS,
  COUNTRY_KEYS,
  MOQ_TIERS,
  REGION_KEYS,
  YEARS_TIERS,
  matchesMoq,
  matchesYears,
  suppliers,
  type MoqTier,
  type YearsTier,
} from "@/lib/directory-data"

describe("matchesMoq", () => {
  it("returns true for the 'any' tier regardless of value", () => {
    expect(matchesMoq("any", 0)).toBe(true)
    expect(matchesMoq("any", 999999)).toBe(true)
  })

  it("handles the 'lt100' tier (strictly below 100)", () => {
    expect(matchesMoq("lt100", 99)).toBe(true)
    expect(matchesMoq("lt100", 0)).toBe(true)
    expect(matchesMoq("lt100", 100)).toBe(false)
  })

  it("handles the '100to500' tier as an inclusive range", () => {
    expect(matchesMoq("100to500", 100)).toBe(true)
    expect(matchesMoq("100to500", 500)).toBe(true)
    expect(matchesMoq("100to500", 99)).toBe(false)
    expect(matchesMoq("100to500", 501)).toBe(false)
  })

  it("handles the '500to1000' tier (exclusive lower, inclusive upper)", () => {
    expect(matchesMoq("500to1000", 500)).toBe(false)
    expect(matchesMoq("500to1000", 501)).toBe(true)
    expect(matchesMoq("500to1000", 1000)).toBe(true)
    expect(matchesMoq("500to1000", 1001)).toBe(false)
  })

  it("handles the 'gt1000' tier (strictly above 1000)", () => {
    expect(matchesMoq("gt1000", 1000)).toBe(false)
    expect(matchesMoq("gt1000", 1001)).toBe(true)
  })

  it("treats the boundary value 500 consistently across adjacent tiers", () => {
    expect(matchesMoq("100to500", 500)).toBe(true)
    expect(matchesMoq("500to1000", 500)).toBe(false)
  })

  it("falls back to true for an unknown tier", () => {
    expect(matchesMoq("unknown" as MoqTier, 42)).toBe(true)
  })
})

describe("matchesYears", () => {
  it("returns true for the 'any' tier regardless of value", () => {
    expect(matchesYears("any", 0)).toBe(true)
    expect(matchesYears("any", 50)).toBe(true)
  })

  it("handles the '1to3' tier as an inclusive range", () => {
    expect(matchesYears("1to3", 1)).toBe(true)
    expect(matchesYears("1to3", 3)).toBe(true)
    expect(matchesYears("1to3", 0)).toBe(false)
    expect(matchesYears("1to3", 4)).toBe(false)
  })

  it("handles the '3to5' tier (exclusive lower, inclusive upper)", () => {
    expect(matchesYears("3to5", 3)).toBe(false)
    expect(matchesYears("3to5", 4)).toBe(true)
    expect(matchesYears("3to5", 5)).toBe(true)
    expect(matchesYears("3to5", 6)).toBe(false)
  })

  it("handles the '5to10' tier (exclusive lower, inclusive upper)", () => {
    expect(matchesYears("5to10", 5)).toBe(false)
    expect(matchesYears("5to10", 6)).toBe(true)
    expect(matchesYears("5to10", 10)).toBe(true)
    expect(matchesYears("5to10", 11)).toBe(false)
  })

  it("handles the 'gt10' tier (strictly above 10)", () => {
    expect(matchesYears("gt10", 10)).toBe(false)
    expect(matchesYears("gt10", 11)).toBe(true)
  })

  it("treats the boundary value 5 consistently across adjacent tiers", () => {
    expect(matchesYears("3to5", 5)).toBe(true)
    expect(matchesYears("5to10", 5)).toBe(false)
  })

  it("falls back to true for an unknown tier", () => {
    expect(matchesYears("unknown" as YearsTier, 7)).toBe(true)
  })
})

describe("tier constants", () => {
  it("lists MOQ tiers starting with 'any'", () => {
    expect(MOQ_TIERS[0]).toBe("any")
    expect(new Set(MOQ_TIERS).size).toBe(MOQ_TIERS.length)
  })

  it("lists years tiers starting with 'any'", () => {
    expect(YEARS_TIERS[0]).toBe("any")
    expect(new Set(YEARS_TIERS).size).toBe(YEARS_TIERS.length)
  })
})

describe("suppliers dataset integrity", () => {
  it("contains at least one supplier", () => {
    expect(suppliers.length).toBeGreaterThan(0)
  })

  it("has unique ids", () => {
    const ids = suppliers.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("only references known enum keys", () => {
    for (const s of suppliers) {
      expect(COUNTRY_KEYS).toContain(s.country)
      expect(REGION_KEYS).toContain(s.region)
      expect(s.businessTypes.length).toBeGreaterThan(0)
      for (const b of s.businessTypes) expect(BUSINESS_TYPE_KEYS).toContain(b)
      expect(s.categories.length).toBeGreaterThan(0)
      for (const c of s.categories) expect(CATEGORY_KEYS).toContain(c)
    }
  })

  it("keeps numeric fields within sane bounds", () => {
    for (const s of suppliers) {
      expect(s.rating).toBeGreaterThanOrEqual(0)
      expect(s.rating).toBeLessThanOrEqual(5)
      expect(s.responseRate).toBeGreaterThanOrEqual(0)
      expect(s.responseRate).toBeLessThanOrEqual(100)
      expect(s.minMoq).toBeGreaterThan(0)
      expect(s.years).toBeGreaterThanOrEqual(0)
      expect(Number.isInteger(s.reviews)).toBe(true)
      expect(Number.isInteger(s.products)).toBe(true)
    }
  })

  it("assigns every supplier a MOQ tier via matchesMoq", () => {
    for (const s of suppliers) {
      const matched = MOQ_TIERS.filter((t) => t !== "any").filter((t) =>
        matchesMoq(t, s.minMoq),
      )
      expect(matched.length).toBe(1)
    }
  })

  it("assigns every supplier a years tier via matchesYears", () => {
    for (const s of suppliers) {
      const matched = YEARS_TIERS.filter((t) => t !== "any").filter((t) =>
        matchesYears(t, s.years),
      )
      expect(matched.length).toBe(1)
    }
  })
})
