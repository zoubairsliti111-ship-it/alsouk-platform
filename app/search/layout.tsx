import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Search",
  description: "Search suppliers, companies and products across the ALSOUK B2B marketplace.",
  alternates: { canonical: '/search' },
  robots: { index: false, follow: false },
}

export default function SegmentLayout({ children }: { children: React.ReactNode }) {
  return children
}
