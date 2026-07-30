"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { MarketplaceShell } from "@/components/marketplace/shell"
import { useLanguage } from "@/components/language-provider"
import {
  User,
  Mail,
  Phone,
  Shield,
  LogOut,
  Loader2,
  Building2,
  ShoppingBag,
  ChevronRight,
  Sparkles
} from "lucide-react"

function AccountScreen() {
  const { t, dir } = useLanguage()
  const router = useRouter()

  // Auth state
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  // Role selector state
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState<"buyer" | "supplier" | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // 1. Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/login")
      } else {
        const currentUser = session.user
        setUser(currentUser)

        // Show role chooser modal if account_type is not yet set
        if (!currentUser.user_metadata?.account_type) {
          setShowRoleModal(true)
        }
      }
      setLoading(false)
    })

    // 2. Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null)
        router.replace("/login")
      } else {
        const currentUser = session.user
        setUser(currentUser)
        if (!currentUser.user_metadata?.account_type) {
          setShowRoleModal(true)
        } else {
          setShowRoleModal(false)
        }
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    setLoading(true)
    await supabase.auth.signOut()
    router.replace("/login")
  }

  const handleSaveRole = async () => {
    if (!selectedRole) return

    setUpdating(true)
    const supabase = createClient()

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { account_type: selectedRole }
      })

      if (error) {
        console.error("Error updating account type:", error)
        alert(error.message)
      } else if (data.user) {
        setUser(data.user)
        setShowRoleModal(false)
      }
    } catch (err) {
      console.error("Unexpected error updating account type:", err)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login via useEffect
  }

  const metadata = user.user_metadata || {}
  const fullName = metadata.full_name || t.auth.notSet
  const phoneVal = metadata.phone_number || t.auth.notSet

  // Hide synthetic phone-based emails from displaying as actual emails
  const isSyntheticEmail = user.email && (
    user.email.endsWith("@phone.alsouk.com") ||
    /^phone\d+@alsouk\.com$/i.test(user.email)
  )
  const emailVal = user.email && !isSyntheticEmail ? user.email : (metadata.email_address || t.auth.notSet)
  const accountType = metadata.account_type || ""

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8" dir={dir}>

      {/* Page title */}
      <div className="mb-10 text-center sm:text-start">
        <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          {t.auth.profileTitle}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t.auth.profileSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

        {/* Avatar and Account Type Badge Card */}
        <div className="rounded-[20px] border border-border/80 bg-card p-6 text-center shadow-lg shadow-primary/5 h-fit">
          <div className="relative mx-auto mb-4 flex size-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-primary to-blue-600 text-3xl font-black text-white shadow-lg shadow-primary/20">
            {fullName.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-lg font-black text-foreground">{fullName}</h2>

          {/* Account Type Badge */}
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all border">
            {accountType === "buyer" ? (
              <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                <ShoppingBag className="size-3.5" />
                {t.auth.buyer}
              </span>
            ) : accountType === "supplier" ? (
              <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
                <Building2 className="size-3.5" />
                {t.auth.supplier}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
                <User className="size-3.5" />
                {t.auth.notSet}
              </span>
            )}
          </div>

          {/* Logout CTA */}
          <button
            onClick={handleLogout}
            className="mt-8 w-full flex items-center justify-center gap-2 rounded-xl border border-destructive/20 hover:bg-destructive/10 text-xs font-extrabold text-destructive py-3 transition-all"
          >
            <LogOut className="size-4" />
            <span>{t.auth.logout}</span>
          </button>
        </div>

        {/* User Details Form Card */}
        <div className="lg:col-span-2 rounded-[20px] border border-border/80 bg-card p-6 sm:p-8 shadow-lg shadow-primary/5">
          <h3 className="text-base font-black text-foreground mb-6 flex items-center gap-2">
            <Shield className="size-5 text-primary" />
            <span>Account Information</span>
          </h3>

          <div className="space-y-6">

            {/* Full Name display */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:items-center sm:gap-4 border-b border-border/50 pb-4">
              <span className="text-xs font-bold text-muted-foreground">{t.auth.fullName}</span>
              <span className="text-xs font-bold text-foreground sm:col-span-2">{fullName}</span>
            </div>

            {/* Phone display */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:items-center sm:gap-4 border-b border-border/50 pb-4">
              <span className="text-xs font-bold text-muted-foreground">{t.auth.phone}</span>
              <span className="text-xs font-bold text-foreground sm:col-span-2 flex items-center gap-2">
                <Phone className="size-4 text-muted-foreground" />
                <span>{phoneVal}</span>
              </span>
            </div>

            {/* Email display */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:items-center sm:gap-4 border-b border-border/50 pb-4">
              <span className="text-xs font-bold text-muted-foreground">{t.auth.email}</span>
              <span className="text-xs font-bold text-foreground sm:col-span-2 flex items-center gap-2">
                <Mail className="size-4 text-muted-foreground" />
                <span className="break-all">{emailVal}</span>
              </span>
            </div>

            {/* Account Type display */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:items-center sm:gap-4">
              <span className="text-xs font-bold text-muted-foreground">{t.auth.accountTypeLabel}</span>
              <span className="text-xs font-bold text-foreground sm:col-span-2 capitalize">
                {accountType ? t.auth[accountType as "buyer" | "supplier"] : t.auth.notSet}
              </span>
            </div>

          </div>
        </div>

      </div>

      {/* Role Picker Dialog / Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" dir={dir}>
          <div className="w-full max-w-[500px] rounded-[24px] border border-border bg-card p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">

            <div className="text-center mb-6">
              <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-blue-600 text-white mb-4">
                <Sparkles className="size-5 text-white" />
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-foreground">
                {t.auth.chooseRoleTitle}
              </h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                {t.auth.chooseRoleDesc}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-6">

              {/* Buyer Option */}
              <button
                type="button"
                onClick={() => setSelectedRole("buyer")}
                className={`flex items-start gap-4 p-4 rounded-2xl border text-start transition-all ${
                  selectedRole === "buyer"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20 scale-[1.01]"
                    : "border-border/80 hover:border-primary/50 hover:bg-secondary/40"
                }`}
              >
                <span className={`flex size-10 items-center justify-center rounded-xl transition-all shrink-0 ${
                  selectedRole === "buyer" ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
                }`}>
                  <ShoppingBag className="size-5" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-foreground">{t.auth.buyer}</h4>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-normal">
                    {t.auth.buyerDesc}
                  </p>
                </div>
              </button>

              {/* Supplier Option */}
              <button
                type="button"
                onClick={() => setSelectedRole("supplier")}
                className={`flex items-start gap-4 p-4 rounded-2xl border text-start transition-all ${
                  selectedRole === "supplier"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20 scale-[1.01]"
                    : "border-border/80 hover:border-primary/50 hover:bg-secondary/40"
                }`}
              >
                <span className={`flex size-10 items-center justify-center rounded-xl transition-all shrink-0 ${
                  selectedRole === "supplier" ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
                }`}>
                  <Building2 className="size-5" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-foreground">{t.auth.supplier}</h4>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-normal">
                    {t.auth.supplierDesc}
                  </p>
                </div>
              </button>

            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveRole}
              disabled={updating || !selectedRole}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary text-xs font-extrabold text-white py-3.5 transition-all shadow-md shadow-primary/10 disabled:opacity-50"
            >
              {updating ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>{t.marketplace.loading}</span>
                </>
              ) : (
                <>
                  <span>{t.auth.saveRoleBtn}</span>
                  <ChevronRight className="size-4 rtl:rotate-180" />
                </>
              )}
            </button>

          </div>
        </div>
      )}

    </div>
  )
}

export default function AccountPage() {
  return (
    <MarketplaceShell>
      <AccountScreen />
    </MarketplaceShell>
  )
}
