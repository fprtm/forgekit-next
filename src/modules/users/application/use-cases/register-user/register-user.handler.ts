import { IUserRepository } from "../../../domain/repositories/user-repository.interface"
import { IPasswordHasher } from "@/modules/auth/domain/services/password-hasher.interface"
import { RegisterUserCommand, registerUserSchema } from "./register-user.command"
import { RegisterUserDTO } from "./register-user.dto"
import { DomainException } from "@/shared/domain/exceptions/domain.exception"
import { eventDispatcher } from "@/shared/application/services/event-dispatcher.service"
import { UserRegisteredEvent } from "../../../domain/events/user.events"
import { UserEntity } from "../../../domain/entities/user.entity"

export class RegisterUserHandler {
  constructor(
    private userRepository: IUserRepository,
    private passwordHasher: IPasswordHasher
  ) {}

  async execute(command: RegisterUserCommand): Promise<RegisterUserDTO> {
    const parsed = registerUserSchema.parse(command)

    // Strict Password Validation
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(parsed.password)) {
      throw new DomainException("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.", "WEAK_PASSWORD", 400)
    }

    // Check if user already exists
    const existing = await this.userRepository.findByEmail(parsed.email)
    if (existing) {
      throw new DomainException("User with this email already exists", "EMAIL_IN_USE", 409)
    }

    // Hash password securely using the abstraction Port (IPasswordHasher)
    const hashedPassword = await this.passwordHasher.hash(parsed.password)

    // Security: hardcode role to "user" for the public registration path —
    // self-registration must never be able to grant admin/super_admin privileges.
    const created = await this.userRepository.create({
      name: parsed.name,
      email: parsed.email,
      password: hashedPassword,
      role: "user",
    })

    await eventDispatcher.dispatch(
      new UserRegisteredEvent(created as UserEntity)
    )

    return {
      id: created.id,
      name: created.name,
      email: created.email,
      role: created.role,
      createdAt: created.createdAt,
    }
  }
}
