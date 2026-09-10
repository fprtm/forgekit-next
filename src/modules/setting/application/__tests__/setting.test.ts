import { describe, expect, it, mock, beforeEach } from "bun:test";
import { UpdateSettingHandler } from "../use-cases/update-setting/update-setting.handler";
import { DeleteSettingHandler } from "../use-cases/delete-setting/delete-setting.handler";
import { GetAllSettingsHandler } from "../use-cases/get-all-settings/get-all-settings.handler";
import { GetSettingsByCategoryHandler } from "../use-cases/get-settings-by-category/get-settings-by-category.handler";
import { ISettingRepository } from "../../domain/repositories/setting-repository.interface";
import { Setting, SettingKey, SettingsValueMap } from "../../domain/entities/setting.entity";
import { SettingKeyValueObject } from "../../domain/value-objects/setting-key.value-object";
import { DomainException } from "@/shared/domain/exceptions/domain.exception";
import { AuthUser } from "@/modules/auth/domain/types";
import { EventDispatcher } from "@/shared/application/services/event-dispatcher.service";
import { SettingUpdatedEvent, SettingDeletedEvent } from "../../domain/events/setting.events";

// Mock server-only to prevent client component errors in tests
mock.module("server-only", () => { return {} });

describe("Setting Bounded Context - Unit & Validation Tests", () => {
  let mockSettingRepository: ISettingRepository;
  let eventDispatcher: EventDispatcher;
  const adminUser: AuthUser = { id: "user-1", role: "admin" };
  const standardUser: AuthUser = { id: "user-2", role: "user" };

  const dummySetting: Setting<"business_name"> = Setting.reconstruct({
    id: "setting-1",
    category: "business",
    key: "business_name",
    value: { name: "Acme Inc" },
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(() => {
    eventDispatcher = EventDispatcher.getInstance();

    mockSettingRepository = {
      findByKey: mock(<K extends SettingKey>(key: K) => Promise.resolve({
        ...dummySetting,
        key,
      } as unknown as Setting<K>)) as <K extends SettingKey>(key: K) => Promise<Setting<K> | undefined>,
      findMany: mock(() => Promise.resolve([dummySetting])),
      findByCategory: mock(() => Promise.resolve([dummySetting])),
      upsert: mock(<K extends SettingKey>(key: K, value: SettingsValueMap[K]) => Promise.resolve({
        ...dummySetting,
        key,
        value,
      } as unknown as Setting<K>)) as <K extends SettingKey>(key: K, value: SettingsValueMap[K]) => Promise<Setting<K>>,
      delete: mock(() => Promise.resolve(dummySetting)),
    };
  });

  describe("Setting Entity", () => {
    it("should throw a DomainException when creating with an invalid key", () => {
      expect(() =>
        Setting.create({
          id: "setting-2",
          category: "business",
          key: "InvalidKey!" as never,
          value: { name: "Acme Inc" } as never,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      ).toThrow(DomainException);
    });

    it("should create successfully with a valid lowercase_snake_case key", () => {
      const setting = Setting.create({
        id: "setting-3",
        category: "business",
        key: "business_name",
        value: { name: "Acme Inc" },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(setting.key).toBe("business_name");
    });

    it("should not validate when reconstructing from persistence, even with a legacy-invalid key", () => {
      expect(() =>
        Setting.reconstruct({
          id: "setting-4",
          category: "business",
          key: "InvalidKey!" as never,
          value: { name: "Acme Inc" } as never,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      ).not.toThrow();
    });
  });

  describe("SettingKeyValueObject", () => {
    it("should throw a DomainException on an invalid key format", () => {
      expect(() => SettingKeyValueObject.create("Invalid Key")).toThrow(DomainException);
      expect(() => SettingKeyValueObject.create("")).toThrow(DomainException);
    });

    it("should accept a valid lowercase_snake_case key", () => {
      expect(SettingKeyValueObject.create("business_name").getValue()).toBe("business_name");
    });
  });

  describe("UpdateSettingHandler", () => {
    it("should succeed for a user with settings:write permission", async () => {
      const handler = new UpdateSettingHandler(mockSettingRepository);
      const result = await handler.execute({
        key: "business_name",
        value: { name: "New Name" },
        user: adminUser,
      });

      expect(result.value).toEqual({ name: "New Name" });
      expect(mockSettingRepository.upsert).toHaveBeenCalled();
    });

    it("should throw for a user without settings:write permission", async () => {
      const handler = new UpdateSettingHandler(mockSettingRepository);

      await expect(
        handler.execute({
          key: "business_name",
          value: { name: "New Name" },
          user: standardUser,
        })
      ).rejects.toThrow(DomainException);

      expect(mockSettingRepository.upsert).not.toHaveBeenCalled();
    });

    it("should dispatch a SettingUpdatedEvent on success", async () => {
      const capturedEvents: SettingUpdatedEvent[] = [];
      eventDispatcher.register<SettingUpdatedEvent>("SettingUpdatedEvent", (event) => {
        capturedEvents.push(event);
      });

      const handler = new UpdateSettingHandler(mockSettingRepository);
      await handler.execute({
        key: "business_name",
        value: { name: "New Name" },
        user: adminUser,
      });

      expect(capturedEvents.length).toBeGreaterThan(0);
      expect(capturedEvents[capturedEvents.length - 1].updatedByUserId).toBe(adminUser.id);
    });
  });

  describe("DeleteSettingHandler", () => {
    it("should succeed for a user with settings:write permission", async () => {
      const handler = new DeleteSettingHandler(mockSettingRepository);
      const result = await handler.execute({ key: "business_name", user: adminUser });

      expect(result).toEqual(dummySetting);
      expect(mockSettingRepository.delete).toHaveBeenCalled();
    });

    it("should throw for a user without settings:write permission", async () => {
      const handler = new DeleteSettingHandler(mockSettingRepository);

      await expect(
        handler.execute({ key: "business_name", user: standardUser })
      ).rejects.toThrow(DomainException);

      expect(mockSettingRepository.delete).not.toHaveBeenCalled();
    });

    it("should dispatch a SettingDeletedEvent on success", async () => {
      const capturedEvents: SettingDeletedEvent[] = [];
      eventDispatcher.register<SettingDeletedEvent>("SettingDeletedEvent", (event) => {
        capturedEvents.push(event);
      });

      const handler = new DeleteSettingHandler(mockSettingRepository);
      await handler.execute({ key: "business_name", user: adminUser });

      expect(capturedEvents.length).toBeGreaterThan(0);
      expect(capturedEvents[capturedEvents.length - 1].deletedByUserId).toBe(adminUser.id);
    });
  });

  describe("GetAllSettingsHandler", () => {
    it("should succeed for a user with settings:read permission", async () => {
      const handler = new GetAllSettingsHandler(mockSettingRepository);
      const result = await handler.execute({ user: adminUser });

      expect(result).toEqual([dummySetting]);
      expect(mockSettingRepository.findMany).toHaveBeenCalled();
    });

    it("should throw for a user without settings:read permission", async () => {
      const handler = new GetAllSettingsHandler(mockSettingRepository);

      await expect(handler.execute({ user: standardUser })).rejects.toThrow(DomainException);
    });
  });

  describe("GetSettingsByCategoryHandler", () => {
    it("should succeed for a user with settings:read permission", async () => {
      const handler = new GetSettingsByCategoryHandler(mockSettingRepository);
      const result = await handler.execute({ category: "business", user: adminUser });

      expect(result).toEqual([dummySetting]);
      expect(mockSettingRepository.findByCategory).toHaveBeenCalled();
    });

    it("should throw for a user without settings:read permission", async () => {
      const handler = new GetSettingsByCategoryHandler(mockSettingRepository);

      await expect(
        handler.execute({ category: "business", user: standardUser })
      ).rejects.toThrow(DomainException);
    });
  });
});
