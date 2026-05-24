import { can } from "@/modules/auth/domain/policies";
import { AuthUser } from "@/modules/auth/domain/types";
import { UsersRepository } from "../infrastructure/repository";
import { updateUserSchema, UpdateUserDTO, createUserSchema, CreateUserDTO } from "./validations";
import { UserEntity } from "../domain/types";

export const UsersService = {
  async getUsers(currentUser?: AuthUser): Promise<UserEntity[]> {
    if (currentUser) {
      if (!can(currentUser, "users:read")) {
        throw new Error("Forbidden");
      }
    }

    const users = await UsersRepository.findMany();
    // Remove sensitive data before sending but keep the shape for TS
    return users.map((user) => ({
      ...user,
      emailVerified: null
    })) as UserEntity[];
  },

  async createUser(input: CreateUserDTO, currentUser?: AuthUser): Promise<UserEntity> {
    const parsed = createUserSchema.parse(input);
    
    if (currentUser) {
      if (!can(currentUser, "users:create")) {
        throw new Error("Forbidden");
      }
    }

    const created = await UsersRepository.create({ ...parsed });
    return {
      ...created,
      emailVerified: null
    } as UserEntity;
  },

  async getUserProfile(id: string, currentUser?: AuthUser): Promise<UserEntity> {
    if (currentUser) {
      if (!can(currentUser, "users:read")) {
        throw new Error("Forbidden");
      }
    }

    const user = await UsersRepository.findById(id);
    if (!user) throw new Error("User not found");
    
    // Remove sensitive data before sending but keep the shape for TS
    return {
      ...user,
      emailVerified: null
    } as UserEntity;
  },

  async updateProfile(id: string, input: UpdateUserDTO, currentUser?: AuthUser): Promise<UserEntity> {
    const parsed = updateUserSchema.parse(input);
    
    if (currentUser) {
      if (!can(currentUser, "users:update", { ownerId: id })) {
        throw new Error("Forbidden");
      }
    }

    const updated = await UsersRepository.update(id, { ...parsed, updatedAt: new Date() });
    if (!updated) throw new Error("User not found");
    return {
      ...updated,
      emailVerified: null
    } as UserEntity;
  },

  async deleteUser(id: string, currentUser?: AuthUser) {
    const existing = await UsersRepository.findById(id);
    if (!existing) throw new Error("User not found");
    
    if (currentUser) {
      if (!can(currentUser, "users:delete", { ownerId: id })) {
        throw new Error("Forbidden");
      }
    }
      
    return UsersRepository.delete(id);
  }
};
