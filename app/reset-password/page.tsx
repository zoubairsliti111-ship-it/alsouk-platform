"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { MarketplaceShell } from "@/components/marketplace/shell"
import { useLanguage } from "@/components/language-provider"
import { isStrongPassword } from "@/lib/supabase/auth-helpers"
import { Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle, KeyRound } from "lucide-react"

/**
 * Landing page for Supabase password-recovery links. Forces the user to set
 * a new password before continuing, instead of the recovery link silently
 * dropping them into the normal /account dashboard.
 */
function ResetPasswordScreen() {
  const { t, dir } = useLanguage()
  const router = useRouter()

  const [checkingSession, setCheckingSession] = useState(true)
  const [hasSession, setHasSession] = useState(false)

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    const supabase = createClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string) => {
      if (event === "PASSWORD_RECOVERY") {
        setHasSession(true)
        setCheckingSession(false)
      }
    })

    // A recovery link that already redirected here on a previous render (or
    // a page refresh mid-flow) still leaves a valid session behind even
    // though the PASSWORD_RECOVERY event itself already fired once.
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: unknown } }) => {
      if (session) {
        setHasSession(true)
      }
      setCheckingSession(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!checkingSession && !hasSession) {
      router.replace("/login")
    }
  }, [checkingSession, hasSession, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setValidationErrors({})

    const errors: { [key: string]: string } = {}
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
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({ password })

      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }

      setSuccess(t.auth.resetSuccess)
      setTimeout(() => {
        router.push("/account")
        router.refresh()
      }, 1200)
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.")
      setLoading(false)
    }
  }

  if (checkingSession || !hasSession) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" dir={dir}>
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 bg-gradient-to-b from-background to-secondary/20" dir={dir}>
      <div className="w-full max-w-[390px] rounded-[20px] border border-border/80 bg-card p-6 shadow-xl shadow-primary/5 transition-all animate-in fade-in zoom-in-95 duration-200">

        <div className="text-center mb-8">
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-blue-600 font-black text-lg text-primary-foreground shadow-md shadow-primary/20 mb-4">
            A
          </span>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            {t.auth.passwordRecoveryTitle}
          </h1>
          <p className="text-xs text-muted-foreground mt-2">
            {t.auth.passwordRecoveryDesc}
          </p>
        </div>

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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground">
              {t.auth.newPassword}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 start-0 flex items-center ps-3 text-muted-foreground">
                <Lock className="size-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
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
                <span>{t.auth.resetPasswordBtn}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <MarketplaceShell>
      <ResetPasswordScreen />
    </MarketplaceShell>
  )
}
