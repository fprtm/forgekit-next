import { IUserRepository } from "../../../domain/repositories/user-repository.interface"
import { UpdateProfileCommand } from "./update-profile.command"
import { UpdateProfileDTO } from "./update-profile.dto"
import { updateUserSchema } from "../../validations"
import { can } from "@/modules/auth/domain/policies"

export class UpdateProfileHandler {
  constructor(private userRepository: IUserRepository) {}

  async execute(command: UpdateProfileCommand): Promise<UpdateProfileDTO> {
    const { id, currentUser, ...input } = command
    const parsed = updateUserSchema.partial().parse(input)

    if (currentUser) {
      if (!can(currentUser, "users:update", { ownerId: id })) {
        throw new Error("Forbidden")
      }

      // DevSecOps Security: Prevent privilege escalation. Only super_admin can modify user roles.
      if (parsed.role) {
        if (currentUser.role !== "super_admin") {
          throw new Error("Forbidden: You are not allowed to modify user roles")
        }
      }
    }

    const updated = await this.userRepository.update(id, { ...parsed, updatedAt: new Date() })
    if (!updated) throw new Error("User not found")
    return {
      ...updated,
      emailVerified: null,
    }
  }
}
