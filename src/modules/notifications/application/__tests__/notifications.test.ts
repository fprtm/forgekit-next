import { describe, expect, it, mock, beforeEach } from "bun:test";
import { SendNotificationHandler } from "../use-cases/send-notification/send-notification.handler";
import { UpdateUserSettingHandler } from "../use-cases/update-user-setting/update-user-setting.handler";
import { NotificationRepository } from "@/modules/notifications/domain/repositories/notification.repository";
import { ISettingRepository } from "@/modules/setting/domain/repositories/setting-repository.interface";
import { NotificationEntity, UserNotificationSettingsEntity } from "@/modules/notifications/domain/entities/notification.entity";
import { Setting, SettingsValueMap, SettingKey } from "@/modules/setting/domain/entities/setting.entity";

// Mock server-only
mock.module("server-only", () => { return {} });

describe("Notifications - Unit Tests", () => {
  let mockNotificationRepository: NotificationRepository;
  let mockSettingRepository: ISettingRepository;

  const dummyNotification: NotificationEntity = {
    id: "notif-1",
    userId: "user-1",
    title: "Test Title",
    message: "Test Message",
    read: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const dummySettings: UserNotificationSettingsEntity = {
    id: "settings-1",
    userId: "user-1",
    email: true,
    push: true,
    whatsapp: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockNotificationRepository = {
      save: mock(() => Promise.resolve(dummyNotification)),
      findById: mock(() => Promise.resolve(dummyNotification)),
      findByUserId: mock(() => Promise.resolve([dummyNotification])),
      markAsRead: mock(() => Promise.resolve()),
      markAllAsRead: mock(() => Promise.resolve()),
      deleteAllByUserId: mock(() => Promise.resolve()),
      findSettingsByUserId: mock(() => Promise.resolve(dummySettings)),
      saveSettings: mock((data) => Promise.resolve({ ...dummySettings, ...data })),
      updateSettings: mock((userId, data) => Promise.resolve({ ...dummySettings, ...data })),
    };

    mockSettingRepository = {
      findByKey: mock(<K extends SettingKey>(key: K) => Promise.resolve({
        id: "global-1",
        key,
        category: "notification" as const,
        value: { email: true, push: true, whatsapp: true } as SettingsValueMap[K],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Setting<K>)) as <K extends SettingKey>(key: K) => Promise<Setting<K>>,
      findAll: mock(() => Promise.resolve([])),
      findByCategory: mock(() => Promise.resolve([])),
      upsert: mock(<K extends SettingKey>(key: K, value: SettingsValueMap[K]) => Promise.resolve({
        id: "global-1",
        key,
        category: "notification" as const,
        value,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Setting<K>)) as <K extends SettingKey>(key: K, value: SettingsValueMap[K]) => Promise<Setting<K>>,
      delete: mock(() => Promise.resolve(undefined)),
    };
  });

  describe("SendNotificationHandler", () => {
    it("should successfully send and save a notification when channels are active", async () => {
      const handler = new SendNotificationHandler(mockNotificationRepository, mockSettingRepository);
      const result = await handler.execute({
        userId: "user-1",
        title: "Hello",
        message: "World",
      });

      expect(result).not.toBeNull();
      expect(result?.title).toBe("Test Title");
      expect(mockNotificationRepository.save).toHaveBeenCalled();
    });

    it("should skip saving when global settings disable all channels", async () => {
      mockSettingRepository.findByKey = mock(<K extends SettingKey>(key: K) => Promise.resolve({
        id: "global-1",
        key,
        category: "notification" as const,
        value: { email: false, push: false, whatsapp: false } as SettingsValueMap[K],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Setting<K>)) as <K extends SettingKey>(key: K) => Promise<Setting<K>>;

      const handler = new SendNotificationHandler(mockNotificationRepository, mockSettingRepository);
      const result = await handler.execute({
        userId: "user-1",
        title: "Hello",
        message: "World",
      });

      expect(result).toBeNull();
      expect(mockNotificationRepository.save).not.toHaveBeenCalled();
    });

    it("should skip saving when user settings disable all channels", async () => {
      mockNotificationRepository.findSettingsByUserId = mock(() => Promise.resolve({
        id: "settings-1",
        userId: "user-1",
        email: false,
        push: false,
        whatsapp: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const handler = new SendNotificationHandler(mockNotificationRepository, mockSettingRepository);
      const result = await handler.execute({
        userId: "user-1",
        title: "Hello",
        message: "World",
      });

      expect(result).toBeNull();
      expect(mockNotificationRepository.save).not.toHaveBeenCalled();
    });
  });

  describe("UpdateUserSettingHandler", () => {
    it("should update existing user settings successfully", async () => {
      const handler = new UpdateUserSettingHandler(mockNotificationRepository);
      const result = await handler.execute({
        userId: "user-1",
        email: false,
      });

      expect(result).not.toBeNull();
      expect(mockNotificationRepository.updateSettings).toHaveBeenCalled();
    });

    it("should create new settings if none exist", async () => {
      mockNotificationRepository.findSettingsByUserId = mock(() => Promise.resolve(null));

      const handler = new UpdateUserSettingHandler(mockNotificationRepository);
      const result = await handler.execute({
        userId: "user-1",
        email: true,
        push: true,
      });

      expect(result).not.toBeNull();
      expect(mockNotificationRepository.saveSettings).toHaveBeenCalled();
    });
  });
});
