import { IUserRepository } from "@/modules/users/domain/repositories/user-repository.interface"
import { ValidateCredentialsCommand } from "./validate-credentials.command"
import { ValidateCredentialsDTO } from "./validate-credentials.dto"
import { loginSchema } from "../../../domain/validations"
import { IPasswordHasher } from "../../../domain/services/password-hasher.interface"

export class ValidateCredentialsHandler {
  constructor(
    private userRepository: IUserRepository,
    private passwordHasher: IPasswordHasher
  ) {}

  async execute(command: ValidateCredentialsCommand): Promise<ValidateCredentialsDTO> {
    const parsed = loginSchema.safeParse(command)
    if (!parsed.success) {
      return null
    }

    const user = await this.userRepository.findByEmail(command.email)
    if (!user) {
      return null
    }

    if (!user.password) return null
    const isPasswordValid = await this.passwordHasher.compare(command.password, user.password)
    if (!isPasswordValid) return null

    return user
  }
}
