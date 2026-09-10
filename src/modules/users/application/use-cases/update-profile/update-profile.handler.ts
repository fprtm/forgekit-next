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

export class UpdateProfileHandler {
  constructor(private userRepository: IUserRepository) {}

  async execute(command: UpdateProfileCommand): Promise<UpdateProfileDTO> {
    const { id, user: currentUser, ...input } = command
    const parsed = updateUserSchema.parse(input)

    if (!can(currentUser, "users:update", { ownerId: id })) {
      throw new UnauthorizedException()
    }

    if (parsed.role) {
      if (currentUser.role !== "super_admin") {
        throw new InvalidRoleException(parsed.role)
      }
    }

    const existing = await this.userRepository.findById(id)
    if (!existing) throw new UserNotFoundException(id)

    const {
      bio, phoneNumber, dateOfBirth, gender, preferredPronouns,
      address, city, state, country, postalCode,
      ...userData
    } = parsed

    // Both the `users` row and the `user_profiles` row are written together
    // in a single DB transaction (see DrizzleUserRepository.updateWithProfile)
    // so a failure partway through can't update core fields while silently
    // dropping profile fields (or vice versa).
    const { user: updated, profile } = await this.userRepository.updateWithProfile(
      id,
      { ...userData, updatedAt: new Date() },
      {
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
      }
    )
    if (!updated) throw new UserNotFoundException(id)

    await eventDispatcher.dispatch(
      new UserUpdatedEvent(updated as UserEntity, currentUser.id)
    )

    return UserEntity.reconstruct({
      ...updated,
      emailVerified: null,
      profile: profile || null,
    })
  }
}
