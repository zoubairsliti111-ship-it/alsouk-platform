"use client"

import { Suspense } from "react"
import { MarketplaceShell } from "@/components/marketplace/shell"
import { AuthForm } from "@/components/auth/auth-form"

export default function SignupPage() {
  return (
    <MarketplaceShell>
      <Suspense fallback={null}>
        <AuthForm mode="signup" />
      </Suspense>
    </MarketplaceShell>
  )
}
