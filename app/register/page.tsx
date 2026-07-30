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
  isStrongPassword,
  phoneToSyntheticEmail,
  checkEmailUnique,
  checkPhoneUnique
} from "@/lib/supabase/auth-helpers"
import { User, Mail, Phone, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle, UserPlus } from "lucide-react"

function RegisterScreen() {
  const { t, dir } = useLanguage()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"phone" | "email">("phone")

  // Fields state
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // UI states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    setValidationErrors({})

    const errors: { [key: string]: string } = {}

    // 1. Core Field Validation
    if (!fullName.trim()) {
      errors.fullName = t.auth.requiredField
    }

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
    } else if (!isStrongPassword(password)) {
      errors.password = `${t.auth.passwordLength}. ${t.auth.passwordRequirements}.`
    }

    if (!confirmPassword) {
      errors.confirmPassword = t.auth.requiredField
    } else if (password !== confirmPassword) {
      errors.confirmPassword = t.auth.passwordsDoNotMatch
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      setLoading(false)
      return
    }

    // 2. Duplicate Validation
    if (activeTab === "phone") {
      const isUnique = await checkPhoneUnique(phone)
      if (!isUnique) {
        setValidationErrors({ phone: t.auth.duplicatePhone })
        setLoading(false)
        return
      }
    } else {
      const isUnique = await checkEmailUnique(email)
      if (!isUnique) {
        setValidationErrors({ email: t.auth.duplicateEmail })
        setLoading(false)
        return
      }
    }

    // 3. Register user immediately
    const supabase = createClient()
    const finalEmail = activeTab === "phone"
      ? phoneToSyntheticEmail(phone)
      : email.trim().toLowerCase()

    const userMetadata: any = {
      full_name: fullName.trim(),
    }

    if (activeTab === "phone") {
      userMetadata.phone_number = cleanPhoneNumber(phone)
    } else {
      userMetadata.email_address = email.trim().toLowerCase()
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: finalEmail,
        password: password,
        options: {
          data: userMetadata,
        }
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      setSuccess(t.auth.signUpSuccess)

      // Delay redirect slightly to show success checkmark
      setTimeout(() => {
        router.push("/account")
        router.refresh()
      }, 1200)

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during signup.")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12 bg-gradient-to-b from-background to-secondary/20" dir={dir}>
      <div className="w-full max-w-[390px] rounded-[20px] border border-border/80 bg-card p-6 shadow-xl shadow-primary/5 transition-all animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-blue-600 font-black text-lg text-primary-foreground shadow-md shadow-primary/20 mb-4">
            A
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            {t.auth.registerTitle}
          </h1>
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

        {/* Auth Tab Switching */}
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
        <form onSubmit={handleRegister} className="space-y-4">

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground">
              {t.auth.fullName}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 start-0 flex items-center ps-3 text-muted-foreground">
                <User className="size-4" />
              </span>
              <input
                type="text"
                placeholder={t.auth.fullNamePlaceholder}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`w-full rounded-xl border bg-card py-3 pe-4 ps-10 text-xs font-medium transition-all outline-none focus:ring-2 focus:ring-primary/20 ${
                  validationErrors.fullName
                    ? "border-destructive focus:border-destructive"
                    : "border-border/80 focus:border-primary"
                }`}
              />
            </div>
            {validationErrors.fullName && (
              <p className="text-[10px] text-destructive font-semibold mt-1">
                {validationErrors.fullName}
              </p>
            )}
          </div>

          {/* Phone input */}
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
            /* Email Input */
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
            <label className="text-xs font-bold text-foreground">
              {t.auth.password}
            </label>
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

          {/* Confirm Password input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground">
              {t.auth.confirmPassword}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 start-0 flex items-center ps-3 text-muted-foreground">
                <Lock className="size-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t.auth.passwordPlaceholder}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full rounded-xl border bg-card py-3 pe-4 ps-10 text-xs font-medium transition-all outline-none focus:ring-2 focus:ring-primary/20 ${
                  validationErrors.confirmPassword
                    ? "border-destructive focus:border-destructive"
                    : "border-border/80 focus:border-primary"
                }`}
              />
            </div>
            {validationErrors.confirmPassword && (
              <p className="text-[10px] text-destructive font-semibold mt-1">
                {validationErrors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit button */}
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
                <UserPlus className="size-4" />
                <span>{t.auth.signUp}</span>
              </>
            )}
          </button>
        </form>

        {/* Account Redirect */}
        <div className="mt-8 text-center border-t border-border/60 pt-4">
          <Link
            href="/login"
            className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
          >
            {t.auth.haveAccount}
          </Link>
        </div>

      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <MarketplaceShell>
      <RegisterScreen />
    </MarketplaceShell>
  )
}
