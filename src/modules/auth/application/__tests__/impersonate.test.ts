import { describe, expect, it, mock, beforeEach } from "bun:test";
import { ImpersonateUserHandler } from "../use-cases/impersonate-user/impersonate-user.handler";
import { IUserRepository } from "@/modules/users/domain/repositories/user-repository.interface";
import { UserEntity } from "@/modules/users/domain/entities/user.entity";
import { UnauthorizedException } from "@/shared/domain/exceptions/unauthorized.exception";
import { DomainException } from "@/shared/domain/exceptions/domain.exception";

// Mock server-only
mock.module("server-only", () => { return {} });

// Mock next/headers cookies
mock.module("next/headers", () => {
  const cookieStore = {
    set: mock(() => {}),
    delete: mock(() => {}),
    get: mock(() => ({ value: "target-user-id" })),
  };
  return {
    cookies: mock(() => Promise.resolve(cookieStore)),
  };
});

describe("Auth Impersonate - Unit Tests", () => {
  const dummySuperAdmin: UserEntity = {
    id: "superadmin-1",
    name: "Super Admin",
    email: "superadmin@example.com",
    emailVerified: new Date(),
    image: null,
    role: "super_admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const dummyUser: UserEntity = {
    id: "user-1",
    name: "Normal User",
    email: "user@example.com",
    emailVerified: new Date(),
    image: null,
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let mockUserRepository: IUserRepository;

  beforeEach(() => {
    mockUserRepository = {
      findMany: mock(() => Promise.resolve([])),
      findById: mock((id) => {
        if (id === "superadmin-1") return Promise.resolve(dummySuperAdmin);
        if (id === "user-1") return Promise.resolve(dummyUser);
        return Promise.resolve(null);
      }),
      findByEmail: mock(() => Promise.resolve(null)),
      create: mock(() => Promise.resolve(dummyUser)),
      update: mock(() => Promise.resolve(dummyUser)),
      delete: mock(() => Promise.resolve(dummyUser)),
      updatePassword: mock(() => Promise.resolve(dummyUser)),
    };
  });

  it("should permit super_admin to impersonate another user", async () => {
    const handler = new ImpersonateUserHandler(mockUserRepository);
    const command = {
      superAdminId: "superadmin-1",
      targetUserId: "user-1",
    };

    const result = await handler.execute(command);
    expect(result.success).toBe(true);
    expect(mockUserRepository.findById).toHaveBeenCalled();
  });

  it("should fail when target user does not exist", async () => {
    const handler = new ImpersonateUserHandler(mockUserRepository);
    const command = {
      superAdminId: "superadmin-1",
      targetUserId: "non-existent-user",
    };

    expect(handler.execute(command)).rejects.toThrow(DomainException);
  });

  it("should fail when non-superadmin tries to impersonate", async () => {
    const handler = new ImpersonateUserHandler(mockUserRepository);
    // user-1 is not a superadmin
    mockUserRepository.findById = mock((id) => {
      if (id === "user-1") return Promise.resolve(dummyUser);
      return Promise.resolve(null);
    });

    const command = {
      superAdminId: "user-1",
      targetUserId: "superadmin-1",
    };

    expect(handler.execute(command)).rejects.toThrow(UnauthorizedException);
  });

  it("should stop impersonation when targetUserId is null", async () => {
    const handler = new ImpersonateUserHandler(mockUserRepository);
    const command = {
      superAdminId: "superadmin-1",
      targetUserId: null,
    };

    const result = await handler.execute(command);
    expect(result.success).toBe(true);
  });
});
