"use client"

import { Suspense } from "react"
import { MarketplaceShell } from "@/components/marketplace/shell"
import { AuthForm } from "@/components/auth/auth-form"

export default function LoginPage() {
  return (
    <MarketplaceShell>
      <Suspense fallback={null}>
        <AuthForm mode="signin" />
      </Suspense>
    </MarketplaceShell>
  )
}
