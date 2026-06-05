import { RefreshTokenCommand } from "./refresh-token.command"

export class RefreshTokenHandler {
  async execute(command: RefreshTokenCommand): Promise<{ token: string }> {
    if (!command.token) {
      throw new Error("Token is required")
    }
    // Return same token as a basic standard placeholder implementation for NextAuth JWT
    return { token: command.token }
  }
}
