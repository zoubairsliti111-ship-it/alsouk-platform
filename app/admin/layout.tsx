import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin",
  description: "ALSOUK administration.",
  robots: { index: false, follow: false },
}

export default function SegmentLayout({ children }: { children: React.ReactNode }) {
  return children
}
