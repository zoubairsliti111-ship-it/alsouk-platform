"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { MarketplaceShell } from "@/components/marketplace/shell"
import { useLanguage } from "@/components/language-provider"
import {
  cleanPhoneNumber,
  isValidTunisianPhone,
  isValidEmail,
  phoneToSyntheticEmail
} from "@/lib/supabase/auth-helpers"
import { KeyRound, Mail, Phone, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from "lucide-react"

function LoginScreen() {
  const { t, dir } = useLanguage()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"phone" | "email">("phone")

  // Fields state
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // UI states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    setValidationErrors({})

    const errors: { [key: string]: string } = {}

    // 1. Validation
    if (activeTab === "phone") {
      if (!phone.trim()) {
        errors.phone = t.auth.requiredField
      } else if (phone.trim().length !== 8 || !isValidTunisianPhone(phone)) {
        errors.phone = t.auth.invalidPhone
      }
    } else {
      if (!email.trim()) {
        errors.email = t.auth.requiredField
      } else if (!isValidEmail(email)) {
        errors.email = t.auth.invalidEmail
      }
    }

    if (!password) {
      errors.password = t.auth.requiredField
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      setLoading(false)
      return
    }

    // 2. Derive authenticating credentials
    const supabase = createClient()
    const loginEmail = activeTab === "phone"
      ? phoneToSyntheticEmail(phone)
      : email.trim().toLowerCase()

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: password,
      })

      if (signInError) {
        setError(signInError.message)
        setLoading(false)
        return
      }

      setSuccess(t.auth.signInSuccess)

      // Delay redirect to allow user to see success state
      setTimeout(() => {
        router.push("/account")
        router.refresh()
      }, 1000)

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-12 bg-gradient-to-b from-background to-secondary/20" dir={dir}>
      <div className="w-full max-w-[390px] rounded-[20px] border border-border/80 bg-card p-6 shadow-xl shadow-primary/5 transition-all animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-blue-600 font-black text-lg text-primary-foreground shadow-md shadow-primary/20 mb-4 animate-bounce">
            A
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            {t.auth.loginTitle}
          </h1>
          <p className="text-xs text-muted-foreground mt-2">
            {t.auth.welcomeBack}
          </p>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mb-6 flex items-start gap-2.5 rounded-xl bg-destructive/10 p-3.5 text-xs font-semibold text-destructive animate-in fade-in duration-200">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-start gap-2.5 rounded-xl bg-green-500/10 p-3.5 text-xs font-semibold text-green-600 dark:text-green-500 animate-in fade-in duration-200">
            <CheckCircle className="size-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Auth Method Tabs */}
        <div className="flex rounded-xl bg-secondary/50 p-1.5 mb-6 border border-border/45">
          <button
            type="button"
            onClick={() => {
              setActiveTab("phone")
              setError(null)
              setValidationErrors({})
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "phone"
                ? "bg-card text-foreground shadow-md shadow-primary/5 scale-[1.02]"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Phone className="size-3.5" />
            {t.auth.phoneTab}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("email")
              setError(null)
              setValidationErrors({})
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "email"
                ? "bg-card text-foreground shadow-md shadow-primary/5 scale-[1.02]"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Mail className="size-3.5" />
            {t.auth.emailTab}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">

          {/* Phone Login Inputs */}
          {activeTab === "phone" ? (
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">
                {t.auth.phone}
              </label>
              <div className="relative flex items-center">
                <span className="absolute inset-y-0 start-0 flex items-center ps-3 text-muted-foreground">
                  <Phone className="size-4" />
                </span>
                <span className="absolute start-9 flex items-center gap-1.5 text-xs font-bold text-muted-foreground border-e pe-2 border-border h-5">
                  <span className="text-sm">🇹🇳</span>
                  <span>+216</span>
                </span>
                <input
                  type="tel"
                  maxLength={8}
                  placeholder={t.auth.phonePlaceholder}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 8))}
                  className={`w-full rounded-xl border bg-card py-3 pe-4 ps-[110px] text-xs font-medium tracking-wider transition-all outline-none focus:ring-2 focus:ring-primary/20 ${
                    validationErrors.phone
                      ? "border-destructive focus:border-destructive"
                      : "border-border/80 focus:border-primary"
                  }`}
                />
              </div>
              {validationErrors.phone && (
                <p className="text-[10px] text-destructive font-semibold mt-1">
                  {validationErrors.phone}
                </p>
              )}
            </div>
          ) : (
            /* Email Login Inputs */
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">
                {t.auth.email}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 start-0 flex items-center ps-3 text-muted-foreground">
                  <Mail className="size-4" />
                </span>
                <input
                  type="email"
                  placeholder={t.auth.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full rounded-xl border bg-card py-3 pe-4 ps-10 text-xs font-medium transition-all outline-none focus:ring-2 focus:ring-primary/20 ${
                    validationErrors.email
                      ? "border-destructive focus:border-destructive"
                      : "border-border/80 focus:border-primary"
                  }`}
                />
              </div>
              {validationErrors.email && (
                <p className="text-[10px] text-destructive font-semibold mt-1">
                  {validationErrors.email}
                </p>
              )}
            </div>
          )}

          {/* Password input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">
                {t.auth.password}
              </label>
              <Link
                href="/forgot-password"
                className="text-[10px] font-semibold text-primary hover:underline transition-colors"
              >
                {t.auth.forgotPasswordLink}
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 start-0 flex items-center ps-3 text-muted-foreground">
                <Lock className="size-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t.auth.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full rounded-xl border bg-card py-3 pe-10 ps-10 text-xs font-medium transition-all outline-none focus:ring-2 focus:ring-primary/20 ${
                  validationErrors.password
                    ? "border-destructive focus:border-destructive"
                    : "border-border/80 focus:border-primary"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 end-0 flex items-center pe-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {validationErrors.password && (
              <p className="text-[10px] text-destructive font-semibold mt-1">
                {validationErrors.password}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary text-xs font-extrabold text-white py-3.5 mt-2 transition-all active:scale-98 shadow-md shadow-primary/10 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>{t.marketplace.loading}</span>
              </>
            ) : (
              <>
                <KeyRound className="size-4" />
                <span>{t.auth.signIn}</span>
              </>
            )}
          </button>
        </form>

        {/* Account Redirect CTA Button */}
        <div className="mt-8 text-center border-t border-border/60 pt-6">
          <p className="text-xs font-bold text-muted-foreground mb-3">
            {t.auth.newToAlsouk}
          </p>
          <Link
            href="/register"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary text-xs font-extrabold text-white py-3.5 transition-all active:scale-98 shadow-md shadow-primary/10"
          >
            <span>{t.auth.createFreeAccountBtn}</span>
          </Link>
        </div>

      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <MarketplaceShell>
      <LoginScreen />
    </MarketplaceShell>
  )
}
