import { db } from "@/db"
import { eq, inArray } from "drizzle-orm"
import { users, userProfiles } from "../drizzle/schema"
import { IUserRepository } from "../../../domain/repositories/user-repository.interface"
import {
  UserEntity,
  UserEntityProps,
  UserProfile,
} from "../../../domain/entities/user.entity"
import { UserRole } from "@/shared/config/roles"

/**
 * Adapts a raw drizzle `users` row to `UserEntityProps`. The `users` table has
 * no `is_active` column yet, so it defaults to `true` here at the
 * infrastructure boundary rather than inside the (validation-free) entity.
 */
function toEntityProps(row: typeof users.$inferSelect): UserEntityProps {
  return { ...row, isActive: true } as UserEntityProps
}

export class DrizzleUserRepository implements IUserRepository {
  async findMany(role?: UserRole | "all"): Promise<UserEntity[]> {
    if (!role || role === "all") {
      const results = await db.query.users.findMany()
      return results.map((row) => UserEntity.reconstruct(toEntityProps(row)))
    }

    const roleFilters: UserRole[] = role === "admin" ? ["admin", "super_admin"] : [role]
    const results = await db.query.users.findMany({
      where: inArray(users.role, roleFilters),
    })
    return results.map((row) => UserEntity.reconstruct(toEntityProps(row)))
  }

  async create(data: Partial<UserEntity>): Promise<UserEntity> {
    const [created] = await db.insert(users).values(data).returning()
    return UserEntity.reconstruct(toEntityProps(created))
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const result = await db.query.users.findFirst({
      where: eq(users.email, email),
    })
    return result ? UserEntity.reconstruct(toEntityProps(result)) : null
  }

  async findById(id: string): Promise<UserEntity | null> {
    const result = await db.query.users.findFirst({
      where: eq(users.id, id),
    })
    return result ? UserEntity.reconstruct(toEntityProps(result)) : null
  }

  async update(id: string, data: Partial<UserEntity>): Promise<UserEntity> {
    const [updated] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning()
    return UserEntity.reconstruct(toEntityProps(updated))
  }

  async delete(id: string): Promise<UserEntity> {
    const [deleted] = await db.delete(users).where(eq(users.id, id)).returning()
    return UserEntity.reconstruct(toEntityProps(deleted))
  }

  async updatePassword(id: string, hashedPassword: string): Promise<UserEntity> {
    const [updated] = await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning()
    return UserEntity.reconstruct(toEntityProps(updated))
  }

  async findProfileByUserId(userId: string): Promise<UserProfile | null> {
    const result = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1)
    return (result[0] as unknown as UserProfile) ?? null
  }

  async upsertProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    return db.transaction(async (tx) => {
      const existingProfile = await tx
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, userId))
        .limit(1)

      const profilePayload = {
        bio: data.bio ?? null,
        phoneNumber: data.phoneNumber ?? null,
        dateOfBirth: data.dateOfBirth ?? null,
        gender: data.gender ?? null,
        preferredPronouns: data.preferredPronouns ?? null,
        address: data.address ?? null,
        city: data.city ?? null,
        state: data.state ?? null,
        country: data.country ?? null,
        postalCode: data.postalCode ?? null,
        updatedAt: new Date(),
      }

      if (existingProfile.length > 0) {
        await tx
          .update(userProfiles)
          .set(profilePayload)
          .where(eq(userProfiles.userId, userId))
      } else {
        await tx.insert(userProfiles).values({ userId, ...profilePayload })
      }

      const [profile] = await tx
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, userId))
        .limit(1)

      return profile as unknown as UserProfile
    })
  }

  async updateWithProfile(
    id: string,
    userData: Partial<UserEntity>,
    profileData: Partial<UserProfile>
  ): Promise<{ user: UserEntity; profile: UserProfile }> {
    return db.transaction(async (tx) => {
      const [updated] = await tx
        .update(users)
        .set(userData)
        .where(eq(users.id, id))
        .returning()

      const existingProfile = await tx
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, id))
        .limit(1)

      const profilePayload = {
        bio: profileData.bio ?? null,
        phoneNumber: profileData.phoneNumber ?? null,
        dateOfBirth: profileData.dateOfBirth ?? null,
        gender: profileData.gender ?? null,
        preferredPronouns: profileData.preferredPronouns ?? null,
        address: profileData.address ?? null,
        city: profileData.city ?? null,
        state: profileData.state ?? null,
        country: profileData.country ?? null,
        postalCode: profileData.postalCode ?? null,
        updatedAt: new Date(),
      }

      if (existingProfile.length > 0) {
        await tx
          .update(userProfiles)
          .set(profilePayload)
          .where(eq(userProfiles.userId, id))
      } else {
        await tx.insert(userProfiles).values({ userId: id, ...profilePayload })
      }

      const [profile] = await tx
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, id))
        .limit(1)

      return {
        user: UserEntity.reconstruct(toEntityProps(updated)),
        profile: profile as unknown as UserProfile,
      }
    })
  }
}
