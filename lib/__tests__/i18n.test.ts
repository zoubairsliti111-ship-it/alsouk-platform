import { describe, expect, it } from "vitest"
import { LANGS, translations, type Lang } from "@/lib/i18n"

const LANG_CODES: Lang[] = ["ar", "fr", "en"]

describe("LANGS", () => {
  it("lists exactly the supported languages", () => {
    expect(LANGS.map((l) => l.code).sort()).toEqual([...LANG_CODES].sort())
  })

  it("marks Arabic as right-to-left and the others left-to-right", () => {
    const byCode = Object.fromEntries(LANGS.map((l) => [l.code, l]))
    expect(byCode.ar.dir).toBe("rtl")
    expect(byCode.en.dir).toBe("ltr")
    expect(byCode.fr.dir).toBe("ltr")
  })

  it("provides a non-empty label and native name for each language", () => {
    for (const l of LANGS) {
      expect(l.label.length).toBeGreaterThan(0)
      expect(l.native.length).toBeGreaterThan(0)
    }
  })
})

describe("translations", () => {
  it("has an entry for every supported language", () => {
    for (const code of LANG_CODES) {
      expect(translations[code]).toBeDefined()
    }
  })

  it("keeps the same top-level sections across all languages", () => {
    const sections = Object.keys(translations.en).sort()
    for (const code of LANG_CODES) {
      expect(Object.keys(translations[code]).sort()).toEqual(sections)
    }
  })

  it("keeps parallel array lengths across languages (categories, popular terms)", () => {
    for (const code of LANG_CODES) {
      expect(translations[code].hero.popularTerms.length).toBe(
        translations.en.hero.popularTerms.length,
      )
      expect(translations[code].categories.items.length).toBe(
        translations.en.categories.items.length,
      )
      expect(translations[code].stats.items.length).toBe(
        translations.en.stats.items.length,
      )
    }
  })

  it("has no empty nav labels in any language", () => {
    for (const code of LANG_CODES) {
      for (const value of Object.values(translations[code].nav)) {
        expect(value.trim().length).toBeGreaterThan(0)
      }
    }
  })
})
