"use client"

import { SiteShell } from "@/components/site-shell"
import { SuppliersDirectory } from "@/components/directory/suppliers-directory"

export default function SuppliersPage() {
  return (
    <SiteShell>
      <SuppliersDirectory />
    </SiteShell>
  )
}
