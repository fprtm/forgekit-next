import { loginSchema, LoginInput } from "../domain/validations";
import { UsersRepository } from "@/modules/users/infrastructure/repository";
import * as bcrypt from "bcrypt";

export const AuthService = {
  /**
   * Validates user credentials during credentials login.
   * Leverages Domain schema validations and Infrastructure repositories.
   *
   * @param {LoginInput} input - The login input (email and password).
   * @returns {Promise<any>} The authenticated user object or null.
   */
  async validateCredentials(input: LoginInput) {
    // 1. Validate domain schema rules
    const parsed = loginSchema.safeParse(input);
    if (!parsed.success) {
      return null;
    }

    // 2. Fetch user from infrastructure repository
    const user = await UsersRepository.findByEmail(input.email);
    if (!user) {
      return null;
    }

    if (!user.password) return null;
    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) return null;

    return user;
  },
};
