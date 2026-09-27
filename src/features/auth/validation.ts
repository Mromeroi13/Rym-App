export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export type PasswordStrength = 'empty' | 'weak' | 'medium' | 'strong'

export function getPasswordStrength(password: string): PasswordStrength {
  if (password.length === 0) return 'empty'
  if (password.length < 8) return 'weak'

  let variety = 0
  if (/[a-z]/.test(password)) variety++
  if (/[A-Z]/.test(password)) variety++
  if (/[0-9]/.test(password)) variety++
  if (/[^A-Za-z0-9]/.test(password)) variety++

  if (password.length >= 10 && variety >= 3) return 'strong'
  return 'medium'
}
