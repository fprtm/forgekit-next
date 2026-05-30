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
    const { id, currentUser, ...input } = command
    const parsed = updateUserSchema.partial().parse(input)

    if (currentUser) {
      if (!can(currentUser, "users:update", { ownerId: id })) {
        throw new UnauthorizedException()
      }

      // DevSecOps Security: Prevent privilege escalation. Only super_admin can modify user roles.
      if (parsed.role) {
        if (currentUser.role !== "super_admin") {
          throw new InvalidRoleException(parsed.role)
        }
      }
    }

    const updated = await this.userRepository.update(id, { ...parsed, updatedAt: new Date() })
    if (!updated) throw new UserNotFoundException(id)
    
    await eventDispatcher.dispatch(
      new UserUpdatedEvent(updated as UserEntity, currentUser?.id || null)
    )

    return {
      ...updated,
      emailVerified: null,
    }
  }
}
