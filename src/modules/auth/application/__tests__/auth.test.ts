import { describe, expect, it, mock } from "bun:test"
import { ValidateCredentialsHandler } from "../use-cases/validate-credentials/validate-credentials.handler"
import { IPasswordHasher } from "../../domain/services/password-hasher.interface"
import { IUserRepository } from "@/modules/users/domain/repositories/user-repository.interface"
import { UserEntity, UserProfile } from "@/modules/users/domain/entities/user.entity"

describe("Auth Bounded Context - Unit & Validation Tests", () => {
  const dummyProfile: UserProfile = {
    id: "profile-1",
    userId: "user-1",
    bio: null,
    phoneNumber: null,
    dateOfBirth: null,
    gender: null,
    preferredPronouns: null,
    address: null,
    city: null,
    state: null,
    country: null,
    postalCode: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const dummyUser: UserEntity = UserEntity.reconstruct({
    id: "user-1",
    name: "John Doe",
    email: "john@example.com",
    emailVerified: new Date(),
    image: null,
    role: "user",
    password: "hashed-password",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  it("should validate credentials successfully", async () => {
    const mockUserRepository: IUserRepository = {
      findMany: mock(() => Promise.resolve([dummyUser])),
      findById: mock(() => Promise.resolve(dummyUser)),
      findByEmail: mock(() => Promise.resolve(dummyUser)),
      create: mock(() => Promise.resolve(dummyUser)),
      update: mock(() => Promise.resolve(dummyUser)),
      delete: mock(() => Promise.resolve(dummyUser)),
      updatePassword: mock(() => Promise.resolve(dummyUser)),
      findProfileByUserId: mock(() => Promise.resolve(null)),
      upsertProfile: mock(() => Promise.resolve(dummyProfile)),
      updateWithProfile: mock(() => Promise.resolve({ user: dummyUser, profile: dummyProfile })),
    }

    const mockPasswordHasher: IPasswordHasher = {
      hash: mock(() => Promise.resolve("hashed-password")),
      compare: mock(() => Promise.resolve(true)),
    }

    const handler = new ValidateCredentialsHandler(mockUserRepository, mockPasswordHasher)
    const command = { email: "john@example.com", password: "secure-password" }

    const result = await handler.execute(command)

    expect(result).not.toBeNull()
    expect(result?.email).toBe("john@example.com")
    expect(mockUserRepository.findByEmail).toHaveBeenCalled()
    expect(mockPasswordHasher.compare).toHaveBeenCalled()
  })

  it("should fail validation with wrong password", async () => {
    const mockUserRepository: IUserRepository = {
      findMany: mock(() => Promise.resolve([dummyUser])),
      findById: mock(() => Promise.resolve(dummyUser)),
      findByEmail: mock(() => Promise.resolve(dummyUser)),
      create: mock(() => Promise.resolve(dummyUser)),
      update: mock(() => Promise.resolve(dummyUser)),
      delete: mock(() => Promise.resolve(dummyUser)),
      updatePassword: mock(() => Promise.resolve(dummyUser)),
      findProfileByUserId: mock(() => Promise.resolve(null)),
      upsertProfile: mock(() => Promise.resolve(dummyProfile)),
      updateWithProfile: mock(() => Promise.resolve({ user: dummyUser, profile: dummyProfile })),
    }

    const mockPasswordHasher: IPasswordHasher = {
      hash: mock(() => Promise.resolve("hashed-password")),
      compare: mock(() => Promise.resolve(false)),
    }

    const handler = new ValidateCredentialsHandler(mockUserRepository, mockPasswordHasher)
    const command = { email: "john@example.com", password: "wrong-password" }

    const result = await handler.execute(command)

    expect(result).toBeNull()
    expect(mockUserRepository.findByEmail).toHaveBeenCalled()
    expect(mockPasswordHasher.compare).toHaveBeenCalled()
  })
})
