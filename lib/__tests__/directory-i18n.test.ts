import { describe, expect, it } from "vitest"
import { directoryT } from "@/lib/directory-i18n"
import {
  BUSINESS_TYPE_KEYS,
  CATEGORY_KEYS,
  COUNTRY_KEYS,
  REGION_KEYS,
} from "@/lib/directory-data"
import type { Lang } from "@/lib/i18n"

const LANG_CODES: Lang[] = ["ar", "fr", "en"]

describe("directoryT", () => {
  it("has an entry for every supported language", () => {
    for (const code of LANG_CODES) {
      expect(directoryT[code]).toBeDefined()
    }
  })

  it("keeps the same top-level sections across all languages", () => {
    const sections = Object.keys(directoryT.en).sort()
    for (const code of LANG_CODES) {
      expect(Object.keys(directoryT[code]).sort()).toEqual(sections)
    }
  })

  it("provides a label for every enum key used by the filters", () => {
    for (const code of LANG_CODES) {
      const t = directoryT[code]
      for (const c of COUNTRY_KEYS) expect(t.countries[c]?.length).toBeGreaterThan(0)
      for (const r of REGION_KEYS) expect(t.regions[r]?.length).toBeGreaterThan(0)
      for (const c of CATEGORY_KEYS) expect(t.categories[c]?.length).toBeGreaterThan(0)
      for (const b of BUSINESS_TYPE_KEYS)
        expect(t.businessTypes[b]?.length).toBeGreaterThan(0)
    }
  })
})

describe("directoryT results.count", () => {
  it("pluralizes English results", () => {
    expect(directoryT.en.results.count(1)).toBe("1 supplier found")
    expect(directoryT.en.results.count(0)).toBe("0 suppliers found")
    expect(directoryT.en.results.count(5)).toBe("5 suppliers found")
  })

  it("pluralizes French results", () => {
    expect(directoryT.fr.results.count(1)).toBe("1 fournisseur trouvé")
    expect(directoryT.fr.results.count(3)).toBe("3 fournisseurs trouvés")
  })

  it("interpolates the count for every language", () => {
    for (const code of LANG_CODES) {
      expect(directoryT[code].results.count(7)).toContain("7")
    }
  })
})
