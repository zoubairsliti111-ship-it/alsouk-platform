import { describe, expect, it } from "vitest"
import {
  MOQ_TIERS,
  YEARS_TIERS,
  matchesMoq,
  matchesYears,
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

describe("tier partitioning", () => {
  const moqValues = [10, 50, 100, 200, 500, 501, 1000, 1001, 2000]
  const yearsValues = [1, 3, 4, 5, 6, 10, 11, 15, 22]

  it("maps every MOQ value to exactly one non-'any' tier", () => {
    for (const v of moqValues) {
      const matched = MOQ_TIERS.filter((t) => t !== "any").filter((t) => matchesMoq(t, v))
      expect(matched.length).toBe(1)
    }
  })

  it("maps every years value to exactly one non-'any' tier", () => {
    for (const v of yearsValues) {
      const matched = YEARS_TIERS.filter((t) => t !== "any").filter((t) =>
        matchesYears(t, v),
      )
      expect(matched.length).toBe(1)
    }
  })
})
