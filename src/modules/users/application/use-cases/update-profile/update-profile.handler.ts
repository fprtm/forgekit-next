import { db } from "@/db"
import { eq } from "drizzle-orm"
import { IUserRepository } from "../../../domain/repositories/user-repository.interface"
import { UpdateProfileCommand } from "./update-profile.command"
import { UpdateProfileDTO } from "./update-profile.dto"
import { updateUserSchema } from "../../validations"
import { can } from "@/modules/auth/domain/policies"
import { UnauthorizedException } from "@/shared/domain/exceptions/unauthorized.exception"
import { UserNotFoundException, InvalidRoleException } from "../../../domain/exceptions/user.exceptions"
import { eventDispatcher } from "@/shared/application/services/event-dispatcher.service"
import { UserUpdatedEvent } from "../../../domain/events/user.events"
import { UserEntity } from "../../../domain/entities/user.entity"
import { userProfiles } from "../../../infrastructure/database/drizzle/schema"

export class UpdateProfileHandler {
  constructor(private userRepository: IUserRepository) {}

  async execute(command: UpdateProfileCommand): Promise<UpdateProfileDTO> {
    const { id, currentUser, ...input } = command
    const parsed = updateUserSchema.parse(input)

    if (currentUser) {
      if (!can(currentUser, "users:update", { ownerId: id })) {
        throw new UnauthorizedException()
      }

      if (parsed.role) {
        if (currentUser.role !== "super_admin") {
          throw new InvalidRoleException(parsed.role)
        }
      }
    }

    const existing = await this.userRepository.findById(id)
    if (!existing) throw new UserNotFoundException(id)

    const {
      bio, phoneNumber, dateOfBirth, gender, preferredPronouns,
      address, city, state, country, postalCode,
      ...userData
    } = parsed

    const updated = await this.userRepository.update(id, { ...userData, updatedAt: new Date() })
    if (!updated) throw new UserNotFoundException(id)

    const existingProfile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, id))
      .limit(1)

    const profilePayload = {
      bio: bio || null,
      phoneNumber: phoneNumber || null,
      dateOfBirth: dateOfBirth || null,
      gender: gender || null,
      preferredPronouns: preferredPronouns || null,
      address: address || null,
      city: city || null,
      state: state || null,
      country: country || null,
      postalCode: postalCode || null,
      updatedAt: new Date(),
    }

    if (existingProfile.length > 0) {
      await db
        .update(userProfiles)
        .set(profilePayload)
        .where(eq(userProfiles.userId, id))
    } else {
      await db
        .insert(userProfiles)
        .values({ userId: id, ...profilePayload })
    }

    const profileData = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, id))
      .limit(1)

    await eventDispatcher.dispatch(
      new UserUpdatedEvent(updated as UserEntity, currentUser?.id || null)
    )

    return {
      ...updated,
      emailVerified: null,
      profile: profileData[0] || null,
    } as UpdateProfileDTO
  }
}
