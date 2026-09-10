import { describe, expect, it, mock, beforeEach } from "bun:test";
import { SendNotificationHandler } from "../use-cases/send-notification/send-notification.handler";
import { UpdateUserSettingHandler } from "../use-cases/update-user-setting/update-user-setting.handler";
import { INotificationRepository } from "@/modules/notifications/domain/repositories/notification-repository.interface";
import { ISettingRepository } from "@/modules/setting/domain/repositories/setting-repository.interface";
import { NotificationEntity, UserNotificationSettingsEntity } from "@/modules/notifications/domain/entities/notification.entity";
import { Setting, SettingsValueMap, SettingKey } from "@/modules/setting/domain/entities/setting.entity";

// Mock server-only
mock.module("server-only", () => { return {} });

describe("Notifications - Unit Tests", () => {
  let mockNotificationRepository: INotificationRepository;
  let mockSettingRepository: ISettingRepository;

  const dummyNotification: NotificationEntity = NotificationEntity.reconstruct({
    id: "notif-1",
    userId: "user-1",
    title: "Test Title",
    message: "Test Message",
    type: "general",
    priority: "medium",
    read: false,
    readAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const dummySettings: UserNotificationSettingsEntity = {
    id: "settings-1",
    userId: "user-1",
    email: true,
    push: true,
    whatsapp: true,
    system: true,
    security: true,
    marketing: true,
    product: true,
    general: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const dummySettingsMarketingDisabled: UserNotificationSettingsEntity = {
    ...dummySettings,
    marketing: false,
  };

  beforeEach(() => {
    mockNotificationRepository = {
      create: mock(() => Promise.resolve(dummyNotification)),
      findById: mock(() => Promise.resolve(dummyNotification)),
      findByUserId: mock(() => Promise.resolve([dummyNotification])),
      markAsRead: mock(() => Promise.resolve()),
      markAllAsRead: mock(() => Promise.resolve()),
      deleteAllByUserId: mock(() => Promise.resolve()),
      findSettingsByUserId: mock(() => Promise.resolve(dummySettings)),
      saveSettings: mock((data) => Promise.resolve({ ...dummySettings, ...data })),
      updateSettings: mock((userId, data) => Promise.resolve({ ...dummySettings, ...data })),
      getUnreadCount: mock(() => Promise.resolve(0)),
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
      findMany: mock(() => Promise.resolve([])),
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
      expect(mockNotificationRepository.create).toHaveBeenCalled();
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
      expect(mockNotificationRepository.create).not.toHaveBeenCalled();
    });

    it("should skip saving when user settings disable all channels", async () => {
      mockNotificationRepository.findSettingsByUserId = mock(() => Promise.resolve({
        id: "settings-1",
        userId: "user-1",
        email: false,
        push: false,
        whatsapp: false,
        system: true,
        security: true,
        marketing: true,
        product: true,
        general: true,
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
      expect(mockNotificationRepository.create).not.toHaveBeenCalled();
    });

    it("should send notification with custom type and priority", async () => {
      const handler = new SendNotificationHandler(mockNotificationRepository, mockSettingRepository);
      const result = await handler.execute({
        userId: "user-1",
        title: "Security Alert",
        message: "Suspicious login detected",
        type: "security",
        priority: "critical",
      });

      expect(result).not.toBeNull();
      expect(mockNotificationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "security",
          priority: "critical",
          read: false,
          readAt: null,
        })
      );
    });

    it("should use default type and priority when not specified", async () => {
      const handler = new SendNotificationHandler(mockNotificationRepository, mockSettingRepository);
      await handler.execute({
        userId: "user-1",
        title: "Hello",
        message: "World",
      });

      expect(mockNotificationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "general",
          priority: "medium",
        })
      );
    });

    it("should set readAt when marking as read", async () => {
      const markAsReadMock = mock(() => Promise.resolve());
      mockNotificationRepository.markAsRead = markAsReadMock;

      await mockNotificationRepository.markAsRead("notif-1");

      expect(markAsReadMock).toHaveBeenCalledWith("notif-1");
    });

    it("should skip notification when user unsubscribed from that type", async () => {
      mockNotificationRepository.findSettingsByUserId = mock(() => Promise.resolve(dummySettingsMarketingDisabled));

      const handler = new SendNotificationHandler(mockNotificationRepository, mockSettingRepository);
      const result = await handler.execute({
        userId: "user-1",
        title: "Marketing Offer",
        message: "50% off!",
        type: "marketing",
      });

      expect(result).toBeNull();
      expect(mockNotificationRepository.create).not.toHaveBeenCalled();
    });

    it("should deliver notification for mandatory type even if not in settings", async () => {
      mockNotificationRepository.findSettingsByUserId = mock(() => Promise.resolve(dummySettingsMarketingDisabled));

      const handler = new SendNotificationHandler(mockNotificationRepository, mockSettingRepository);
      const result = await handler.execute({
        userId: "user-1",
        title: "Security Alert",
        message: "Login from new device",
        type: "security",
      });

      expect(result).not.toBeNull();
      expect(mockNotificationRepository.create).toHaveBeenCalled();
    });

    it("should deliver notification for unsubscribed mandatory type (system)", async () => {
      mockNotificationRepository.findSettingsByUserId = mock(() => Promise.resolve(dummySettingsMarketingDisabled));

      const handler = new SendNotificationHandler(mockNotificationRepository, mockSettingRepository);
      const result = await handler.execute({
        userId: "user-1",
        title: "System Maintenance",
        message: "Scheduled downtime",
        type: "system",
      });

      expect(result).not.toBeNull();
      expect(mockNotificationRepository.create).toHaveBeenCalled();
    });

    it("should deliver notification when user is subscribed to that type", async () => {
      mockNotificationRepository.findSettingsByUserId = mock(() => Promise.resolve(dummySettings));

      const handler = new SendNotificationHandler(mockNotificationRepository, mockSettingRepository);
      const result = await handler.execute({
        userId: "user-1",
        title: "Product Update",
        message: "New version available",
        type: "product",
      });

      expect(result).not.toBeNull();
      expect(mockNotificationRepository.create).toHaveBeenCalled();
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

    it("should update subscription fields while respecting mandatory types", async () => {
      const handler = new UpdateUserSettingHandler(mockNotificationRepository);
      const result = await handler.execute({
        userId: "user-1",
        subscriptions: {
          marketing: false,
          product: false,
          security: false,
          system: false,
        },
      });

      expect(result).not.toBeNull();
      expect(mockNotificationRepository.updateSettings).toHaveBeenCalledWith(
        "user-1",
        expect.objectContaining({
          marketing: false,
          product: false,
        })
      );
      // mandatory types should NOT be included in update
      const updateCall = (mockNotificationRepository.updateSettings as ReturnType<typeof mock>).mock.calls[0][1];
      expect(updateCall).not.toHaveProperty("system");
      expect(updateCall).not.toHaveProperty("security");
    });

    it("should include default subscriptions when creating new settings", async () => {
      mockNotificationRepository.findSettingsByUserId = mock(() => Promise.resolve(null));

      const handler = new UpdateUserSettingHandler(mockNotificationRepository);
      await handler.execute({
        userId: "user-1",
        subscriptions: { marketing: false },
      });

      expect(mockNotificationRepository.saveSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          system: true,
          security: true,
          marketing: false,
          product: true,
          general: true,
        })
      );
    });
  });
});
