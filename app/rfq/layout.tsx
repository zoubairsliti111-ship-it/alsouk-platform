import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Request a Quote",
  description: "Post a request for quote and receive competitive offers from verified suppliers on ALSOUK.",
  alternates: { canonical: '/rfq' },
}

export default function SegmentLayout({ children }: { children: React.ReactNode }) {
  return children
}
