import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Suppliers",
  description: "Discover verified manufacturers, exporters and wholesalers on the ALSOUK supplier directory.",
  alternates: { canonical: '/suppliers' },
}

export default function SegmentLayout({ children }: { children: React.ReactNode }) {
  return children
}
