import { signOut } from "@/shared/lib/auth"
import { LogoutCommand } from "./logout.command"

export class LogoutHandler {
  async execute(command: LogoutCommand = {}): Promise<{ success: boolean }> {
    await signOut({ redirect: false })
    return { success: true }
  }
}
