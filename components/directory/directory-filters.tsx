"use client"

import { BadgeCheck, RotateCcw } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { directoryT } from "@/lib/directory-i18n"
import {
  BUSINESS_TYPE_KEYS,
  CATEGORY_KEYS,
  COUNTRY_KEYS,
  MOQ_TIERS,
  REGION_KEYS,
  YEARS_TIERS,
  type BusinessTypeKey,
  type CategoryKey,
  type CountryKey,
  type MoqTier,
  type RegionKey,
  type YearsTier,
} from "@/lib/directory-data"

export type FilterState = {
  countries: CountryKey[]
  region: RegionKey | "any"
  categories: CategoryKey[]
  businessTypes: BusinessTypeKey[]
  verifiedOnly: boolean
  moq: MoqTier
  years: YearsTier
}

export const emptyFilters: FilterState = {
  countries: [],
  region: "any",
  categories: [],
  businessTypes: [],
  verifiedOnly: false,
  moq: "any",
  years: "any",
}

function CheckboxRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1 text-sm text-foreground/90">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="size-4 shrink-0 rounded border-border text-primary accent-[var(--primary)]"
      />
      <span>{label}</span>
    </label>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border py-4 last:border-b-0">
      <h3 className="mb-2 text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  )
}

export function DirectoryFilters({
  filters,
  setFilters,
}: {
  filters: FilterState
  setFilters: (updater: (prev: FilterState) => FilterState) => void
}) {
  const { lang } = useLanguage()
  const t = directoryT[lang]

  const toggleInArray = <T,>(arr: T[], value: T): T[] =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]

  const hasActive =
    filters.countries.length > 0 ||
    filters.categories.length > 0 ||
    filters.businessTypes.length > 0 ||
    filters.region !== "any" ||
    filters.verifiedOnly ||
    filters.moq !== "any" ||
    filters.years !== "any"

  return (
    <div>
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h2 className="text-base font-bold text-foreground">{t.filters.title}</h2>
        {hasActive && (
          <button
            type="button"
            onClick={() => setFilters(() => emptyFilters)}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
          >
            <RotateCcw className="size-3.5" />
            {t.filters.clearAll}
          </button>
        )}
      </div>

      {/* Verified toggle */}
      <Section title={t.filters.verified}>
        <label className="flex cursor-pointer items-center justify-between gap-2 rounded-lg bg-accent/5 px-3 py-2">
          <span className="flex items-center gap-2 text-sm font-medium text-foreground">
            <BadgeCheck className="size-4 text-accent" />
            {t.filters.verifiedOnly}
          </span>
          <input
            type="checkbox"
            checked={filters.verifiedOnly}
            onChange={() => setFilters((p) => ({ ...p, verifiedOnly: !p.verifiedOnly }))}
            className="size-4 rounded border-border accent-[var(--accent)]"
          />
        </label>
      </Section>

      {/* Country */}
      <Section title={t.filters.country}>
        <div className="space-y-0.5">
          {COUNTRY_KEYS.map((c) => (
            <CheckboxRow
              key={c}
              label={t.countries[c]}
              checked={filters.countries.includes(c)}
              onChange={() =>
                setFilters((p) => ({ ...p, countries: toggleInArray(p.countries, c) }))
              }
            />
          ))}
        </div>
      </Section>

      {/* Region */}
      <Section title={t.filters.region}>
        <select
          value={filters.region}
          onChange={(e) =>
            setFilters((p) => ({ ...p, region: e.target.value as RegionKey | "any" }))
          }
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="any">{t.anyOption}</option>
          {REGION_KEYS.map((r) => (
            <option key={r} value={r}>
              {t.regions[r]}
            </option>
          ))}
        </select>
      </Section>

      {/* Category */}
      <Section title={t.filters.category}>
        <div className="space-y-0.5">
          {CATEGORY_KEYS.map((c) => (
            <CheckboxRow
              key={c}
              label={t.categories[c]}
              checked={filters.categories.includes(c)}
              onChange={() =>
                setFilters((p) => ({ ...p, categories: toggleInArray(p.categories, c) }))
              }
            />
          ))}
        </div>
      </Section>

      {/* Business type */}
      <Section title={t.filters.businessType}>
        <div className="space-y-0.5">
          {BUSINESS_TYPE_KEYS.map((b) => (
            <CheckboxRow
              key={b}
              label={t.businessTypes[b]}
              checked={filters.businessTypes.includes(b)}
              onChange={() =>
                setFilters((p) => ({ ...p, businessTypes: toggleInArray(p.businessTypes, b) }))
              }
            />
          ))}
        </div>
      </Section>

      {/* MOQ */}
      <Section title={t.filters.moq}>
        <select
          value={filters.moq}
          onChange={(e) => setFilters((p) => ({ ...p, moq: e.target.value as MoqTier }))}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          {MOQ_TIERS.map((m) => (
            <option key={m} value={m}>
              {t.moqTiers[m]}
            </option>
          ))}
        </select>
      </Section>

      {/* Years */}
      <Section title={t.filters.years}>
        <select
          value={filters.years}
          onChange={(e) => setFilters((p) => ({ ...p, years: e.target.value as YearsTier }))}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          {YEARS_TIERS.map((y) => (
            <option key={y} value={y}>
              {t.yearsTiers[y]}
            </option>
          ))}
        </select>
      </Section>
    </div>
  )
}
