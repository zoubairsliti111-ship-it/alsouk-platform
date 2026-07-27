import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Products",
  description: "Source products from verified suppliers and companies on ALSOUK.",
  alternates: { canonical: '/products' },
}

export default function SegmentLayout({ children }: { children: React.ReactNode }) {
  return children
}
