import { describe, expect, it, mock, beforeEach } from "bun:test";
import { createUserSchema, updateUserSchema } from "../validations";
import { GetUsersHandler } from "../use-cases/get-users/get-users.handler";
import { CreateUserHandler } from "../use-cases/create-user/create-user.handler";
import { GetUserProfileHandler } from "../use-cases/get-user-profile/get-user-profile.handler";
import { UpdateProfileHandler } from "../use-cases/update-profile/update-profile.handler";
import { DeleteUserHandler } from "../use-cases/delete-user/delete-user.handler";
import { RegisterUserHandler } from "../use-cases/register-user/register-user.handler";
import { IUserRepository } from "../../domain/repositories/user-repository.interface";
import { UserEntity } from "../../domain/entities/user.entity";
import { IPasswordHasher } from "@/modules/auth/domain/services/password-hasher.interface";

// Mock server-only to prevent client component errors in tests
mock.module("server-only", () => { return {} });

describe("Users Bounded Context - Unit & Validation Tests", () => {
  let mockUserRepository: IUserRepository;
  const dummyUser: UserEntity = {
    id: "user-1",
    name: "John Doe",
    email: "john@example.com",
    emailVerified: new Date(),
    image: null,
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockUserRepository = {
      findMany: mock(() => Promise.resolve([dummyUser])),
      findById: mock(() => Promise.resolve(dummyUser)),
      findByEmail: mock(() => Promise.resolve(dummyUser)),
      create: mock((data) => Promise.resolve({ ...dummyUser, ...data })),
      update: mock((id, data) => Promise.resolve({ ...dummyUser, ...data })),
      delete: mock(() => Promise.resolve(dummyUser)),
    };
  });

  describe("Validations (Zod Schemas)", () => {
    it("should accept valid user creation data", () => {
      const validData = {
        name: "Admin User",
        email: "admin@example.com",
        role: "admin" as const,
      };
      const result = createUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email formatting", () => {
      const invalidData = {
        name: "Bad User",
        email: "bad-email",
        role: "user" as const,
      };
      const result = createUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("Use Cases (Business Logic)", () => {
    it("should get all users and mask emailVerified via GetUsersHandler", async () => {
      const handler = new GetUsersHandler(mockUserRepository);
      const result = await handler.execute({});

      expect(result[0].emailVerified).toBeNull();
      expect(mockUserRepository.findMany).toHaveBeenCalled();
    });

    it("should create a user via CreateUserHandler", async () => {
      const handler = new CreateUserHandler(mockUserRepository);
      const input = { name: "Alice", email: "alice@example.com", role: "user" as const };
      const result = await handler.execute(input);

      expect(result.name).toBe("Alice");
      expect(result.emailVerified).toBeNull();
      expect(mockUserRepository.create).toHaveBeenCalled();
    });

    it("should get user profile via GetUserProfileHandler", async () => {
      const handler = new GetUserProfileHandler(mockUserRepository);
      const result = await handler.execute({ id: "user-1" });

      expect(result.id).toBe("user-1");
      expect(result.emailVerified).toBeNull();
      expect(mockUserRepository.findById).toHaveBeenCalled();
    });

    it("should update user profile via UpdateProfileHandler", async () => {
      const handler = new UpdateProfileHandler(mockUserRepository);
      const input = { id: "user-1", name: "John Updated" };
      const result = await handler.execute(input);

      expect(result.name).toBe("John Updated");
      expect(mockUserRepository.update).toHaveBeenCalled();
    });

    it("should delete user via DeleteUserHandler", async () => {
      const handler = new DeleteUserHandler(mockUserRepository);
      const result = await handler.execute({ id: "user-1" });

      expect(result.id).toBe("user-1");
      expect(mockUserRepository.delete).toHaveBeenCalled();
    });

    it("should register a user securely and force role to user", async () => {
      const mockPasswordHasher: IPasswordHasher = {
        hash: mock(() => Promise.resolve("hashed-password")),
        compare: mock(() => Promise.resolve(true)),
      };

      // Mock findByEmail to return null so it allows new registration
      mockUserRepository.findByEmail = mock(() => Promise.resolve(null));

      const handler = new RegisterUserHandler(mockUserRepository, mockPasswordHasher);
      const input = {
        name: "New Registered User",
        email: "new@example.com",
        password: "Secure@123",
      };

      const result = await handler.execute(input);

      expect(result.email).toBe("new@example.com");
      expect(result.role).toBe("user"); // Asserts role forcing
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockPasswordHasher.hash).toHaveBeenCalled();
    });
  });
});
