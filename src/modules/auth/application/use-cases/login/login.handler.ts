import { signIn } from "@/shared/lib/auth"
import { LoginCommand } from "./login.command"
import { loginSchema } from "../../../domain/validations"
import { InvalidInputException } from "@/shared/domain/exceptions/invalid-input.exception"
import { InvalidCredentialsException } from "../../../domain/exceptions/auth.exceptions"

export class LoginHandler {
  async execute(command: LoginCommand): Promise<{ success: boolean }> {
    const parsed = loginSchema.safeParse(command)
    if (!parsed.success) {
      throw new InvalidInputException("Invalid input data")
    }

    try {
      await signIn("credentials", {
        email: command.email,
        password: command.password,
        redirect: false,
      })
      return { success: true }
    } catch {
      throw new InvalidCredentialsException()
    }
  }
}
