import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Companies",
  description: "Browse verified B2B companies and their stores across Tunisia and North Africa on ALSOUK.",
  alternates: { canonical: '/companies' },
}

export default function SegmentLayout({ children }: { children: React.ReactNode }) {
  return children
}
