export interface PasswordResetTokenRecord {
  identifier: string
  token: string
  expires: Date
}

/**
 * Port for persisting short-lived, single-use password reset tokens.
 * Backed by the pre-existing `verification_tokens` table (identifier/token/expires,
 * unique on the pair) — reused as-is rather than adding a new table, since no
 * email-provider/magic-link flow in this app currently populates it.
 */
export interface IPasswordResetTokenRepository {
  create(identifier: string, token: string, expires: Date): Promise<void>
  findByToken(token: string): Promise<PasswordResetTokenRecord | null>
  deleteByToken(token: string): Promise<void>
  deleteAllForIdentifier(identifier: string): Promise<void>
}
