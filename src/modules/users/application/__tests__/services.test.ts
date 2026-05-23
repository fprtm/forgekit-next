import { describe, expect, it, mock, beforeEach } from "bun:test";

// Mock server-only to prevent client component errors in tests
mock.module("server-only", () => { return {} });

import { UsersService } from "../services";
import { UsersRepository } from "../../infrastructure/repository";

// Mock the repository
mock.module("../../infrastructure/repository", () => {
  return {
    UsersRepository: {
      findMany: mock(),
      findById: mock(),
      update: mock(),
      delete: mock(),
    }
  };
});

type MockedFunction<T extends (...args: never[]) => unknown> = T & {
  mockClear: () => void;
  mockReset: () => void;
  mockResolvedValue: (value: Awaited<ReturnType<T>>) => void;
};

const mockFindMany = UsersRepository.findMany as unknown as MockedFunction<typeof UsersRepository.findMany>;
const mockFindById = UsersRepository.findById as unknown as MockedFunction<typeof UsersRepository.findById>;
const mockUpdate = UsersRepository.update as unknown as MockedFunction<typeof UsersRepository.update>;
const mockDelete = UsersRepository.delete as unknown as MockedFunction<typeof UsersRepository.delete>;

describe("Users Service", () => {
  beforeEach(() => {
    mockFindMany.mockClear();
    mockFindById.mockClear();
    mockUpdate.mockClear();
    mockDelete.mockClear();
  });

  it("should get all users and mask emailVerified", async () => {
    const mockUsers = [
      { id: "1", name: "User1", email: "user1@test.com", emailVerified: new Date(), image: null, role: "user" as const, createdAt: new Date(), updatedAt: new Date() }
    ];
    mockFindMany.mockResolvedValue(mockUsers);

    const result = await UsersService.getUsers();
    
    // Check that emailVerified is mapped to null for safety
    expect(result[0].emailVerified).toBeNull();
    expect(result[0].email).toBe("user1@test.com");
    expect(UsersRepository.findMany).toHaveBeenCalled();
  });

  it("should get a single user profile and mask emailVerified", async () => {
    const mockUser = { id: "1", name: "User1", email: "user1@test.com", emailVerified: new Date(), image: null, role: "user" as const, createdAt: new Date(), updatedAt: new Date() };
    mockFindById.mockResolvedValue(mockUser);

    const result = await UsersService.getUserProfile("1");
    
    expect(result.emailVerified).toBeNull();
    expect(result.name).toBe("User1");
  });

  it("should throw error if user not found", async () => {
    mockFindById.mockResolvedValue(null);
    expect(UsersService.getUserProfile("99")).rejects.toThrow("User not found");
  });
});

