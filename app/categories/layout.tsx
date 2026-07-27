import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Categories",
  description: "Explore product categories across the ALSOUK B2B marketplace.",
  alternates: { canonical: '/categories' },
}

export default function SegmentLayout({ children }: { children: React.ReactNode }) {
  return children
}
