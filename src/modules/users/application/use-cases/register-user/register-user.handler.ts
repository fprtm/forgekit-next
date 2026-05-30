import { IUserRepository } from "../../../domain/repositories/user-repository.interface"
import { IPasswordHasher } from "@/modules/auth/domain/services/password-hasher.interface"
import { RegisterUserCommand, registerUserSchema } from "./register-user.command"
import { RegisterUserDTO } from "./register-user.dto"

export class RegisterUserHandler {
  constructor(
    private userRepository: IUserRepository,
    private passwordHasher: IPasswordHasher
  ) {}

  async execute(command: RegisterUserCommand): Promise<RegisterUserDTO> {
    const parsed = registerUserSchema.parse(command)

    // Check if user already exists
    const existing = await this.userRepository.findByEmail(parsed.email)
    if (existing) {
      throw new Error("User with this email already exists")
    }

    // Hash password securely using the abstraction Port (IPasswordHasher)
    const hashedPassword = await this.passwordHasher.hash(parsed.password)

    // DevSecOps Security: Hardcode role to 'user' for public registration path.
    // Avoids privilege escalation completely.
    const created = await this.userRepository.create({
      name: parsed.name,
      email: parsed.email,
      password: hashedPassword,
      role: "user",
    })

    return {
      id: created.id,
      name: created.name,
      email: created.email,
      role: created.role,
      createdAt: created.createdAt,
    }
  }
}
