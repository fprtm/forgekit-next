import { db } from "@/db"
import { eq } from "drizzle-orm"
import { verificationTokens } from "../drizzle/schema"
import {
  IPasswordResetTokenRepository,
  PasswordResetTokenRecord,
} from "../../../domain/repositories/password-reset-token-repository.interface"

export class DrizzlePasswordResetTokenRepository implements IPasswordResetTokenRepository {
  async create(identifier: string, token: string, expires: Date): Promise<void> {
    await db.insert(verificationTokens).values({ identifier, token, expires })
  }

  async findByToken(token: string): Promise<PasswordResetTokenRecord | null> {
    const result = await db.query.verificationTokens.findFirst({
      where: eq(verificationTokens.token, token),
    })
    return result ?? null
  }

  async deleteByToken(token: string): Promise<void> {
    await db.delete(verificationTokens).where(eq(verificationTokens.token, token))
  }

  async deleteAllForIdentifier(identifier: string): Promise<void> {
    await db.delete(verificationTokens).where(eq(verificationTokens.identifier, identifier))
  }
}
