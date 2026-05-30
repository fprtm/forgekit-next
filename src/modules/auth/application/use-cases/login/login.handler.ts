import { signIn } from "@/shared/lib/auth"
import { LoginCommand } from "./login.command"
import { loginSchema } from "../../../domain/validations"

export class LoginHandler {
  async execute(command: LoginCommand): Promise<{ success: boolean }> {
    const parsed = loginSchema.safeParse(command)
    if (!parsed.success) {
      throw new Error("Invalid input data")
    }

    try {
      await signIn("credentials", {
        email: command.email,
        password: command.password,
        redirect: false,
      })
      return { success: true }
    } catch (error) {
      throw new Error("Invalid credentials or authentication failed")
    }
  }
}
