import { createClient } from "@/lib/supabase/client"

/**
 * Standardizes Tunisian phone numbers.
 * Tunisian phone numbers are typically 8 digits.
 * Canonical format: +216XXXXXXXX (where XXXXXXXX is 8 digits)
 */
export function cleanPhoneNumber(phone: string): string {
  // Remove all non-digit characters except for a leading plus sign
  let cleaned = phone.replace(/[^\d+]/g, "")

  if (cleaned.startsWith("00216")) {
    cleaned = "+" + cleaned.slice(2)
  }

  if (!cleaned.startsWith("+")) {
    // If it is 8 digits, prepend +216
    if (cleaned.length === 8) {
      cleaned = "+216" + cleaned
    } else if (cleaned.startsWith("216") && cleaned.length === 11) {
      cleaned = "+" + cleaned
    }
  }

  return cleaned
}

/**
 * Validates a Tunisian phone number.
 */
export function isValidTunisianPhone(phone: string): boolean {
  const cleaned = cleanPhoneNumber(phone)
  // Must match +216 followed by exactly 8 digits
  return /^\+216\d{8}$/.test(cleaned)
}

/**
 * Validates email address format.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Validates password strength:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
export function isStrongPassword(password: string): boolean {
  if (password.length < 8) return false
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  return hasUppercase && hasLowercase && hasNumber
}

/**
 * Maps a standardized phone number to a synthetic email address for MVP signup.
 */
export function phoneToSyntheticEmail(phone: string): string {
  const cleaned = cleanPhoneNumber(phone)
  // E.g., +21621345678 -> phone21621345678@alsouk.com
  const digitsOnly = cleaned.replace("+", "")
  return `phone${digitsOnly}@alsouk.com`
}

/**
 * Client-side helper to check if an email is already registered.
 */
export async function checkEmailUnique(email: string): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/check-unique", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()
    return data.exists !== true
  } catch (err) {
    console.error("Error checking email uniqueness:", err)
    return true // Fallback to let native Supabase handle errors if check fails
  }
}

/**
 * Client-side helper to check if a phone is already registered.
 */
export async function checkPhoneUnique(phone: string): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/check-unique", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    })
    const data = await res.json()
    return data.exists !== true
  } catch (err) {
    console.error("Error checking phone uniqueness:", err)
    return true // Fallback to let native Supabase handle errors if check fails
  }
}

/**
 * Client-side helper to trigger a secure administrative password reset.
 */
export async function adminResetPassword(params: { email?: string; phone?: string; newPassword?: string }): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    })
    const data = await res.json()
    if (data.error) {
      return { success: false, message: data.message || "Failed to reset password" }
    }
    return { success: true, message: data.message || "Password updated successfully" }
  } catch (err: any) {
    console.error("Error resetting password:", err)
    return { success: false, message: err.message || "An unexpected error occurred" }
  }
}
