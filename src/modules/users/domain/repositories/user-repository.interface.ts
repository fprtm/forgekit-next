import { UserEntity, UserProfile } from "../entities/user.entity"
import { UserRole } from "@/shared/config/roles"

export interface IUserRepository {
  findMany(role?: UserRole | "all"): Promise<UserEntity[]>
  create(data: Partial<UserEntity>): Promise<UserEntity>
  findByEmail(email: string): Promise<UserEntity | null>
  findById(id: string): Promise<UserEntity | null>
  update(id: string, data: Partial<UserEntity>): Promise<UserEntity>
  delete(id: string): Promise<UserEntity>
  updatePassword(id: string, hashedPassword: string): Promise<UserEntity>
  findProfileByUserId(userId: string): Promise<UserProfile | null>
  upsertProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile>
  /**
   * Updates the `users` row and upserts the `user_profiles` row for the same
   * user in a single DB transaction. Used by profile-update flows that write
   * to both tables so a failure on either write can't leave the two out of
   * sync (e.g. core fields updated but profile fields silently dropped).
   */
  updateWithProfile(
    id: string,
    userData: Partial<UserEntity>,
    profileData: Partial<UserProfile>
  ): Promise<{ user: UserEntity; profile: UserProfile }>
}
