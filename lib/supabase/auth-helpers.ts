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
