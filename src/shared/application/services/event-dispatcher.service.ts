import { DomainEvent } from "../../domain/events/domain.event";
import { logger } from "@/shared/lib/logger";



type EventHandler<T extends DomainEvent> = (event: T) => Promise<void> | void;

export class EventDispatcher {
  private static instance: EventDispatcher;
  private handlers: Map<string, EventHandler<DomainEvent>[]> = new Map();

  private constructor() {}

  public static getInstance(): EventDispatcher {
    if (!EventDispatcher.instance) {
      EventDispatcher.instance = new EventDispatcher();
    }
    return EventDispatcher.instance;
  }

  public register<T extends DomainEvent>(eventName: string, handler: EventHandler<T>): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)!.push(handler as EventHandler<DomainEvent>);
  }

  public async dispatch(event: DomainEvent): Promise<void> {
    const eventHandlers = this.handlers.get(event.eventName);
    if (eventHandlers) {
      const promises = eventHandlers.map((handler) => handler(event));
      const results = await Promise.allSettled(promises); // Prevent one failed listener from crashing others
      for (const result of results) {
        if (result.status === "rejected") {
          logger.warn(
            { err: result.reason, eventName: event.eventName },
            "Domain event listener rejected"
          );
        }
      }
    }
  }

  /**
   * Composition root for listeners. Dynamically imports listener classes and their
   * concrete (Drizzle) repository dependencies, then wires them together here — the
   * one place in the app allowed to know about concrete infrastructure for listeners.
   * Dynamic imports also keep this module free of eager infrastructure imports,
   * avoiding circular dependencies at server startup.
   */
  public async initializeListeners(): Promise<void> {
    const [
      { AuthAuditListener },
      { AuditLogListener },
      { NotificationListener },
      { NotificationEmailListener },
      { NotificationWhatsAppListener },
      { PasswordResetNotificationListener },
      { DrizzleAuditLogRepository },
      { DrizzleNotificationRepository },
      { DrizzleSettingRepository },
    ] = await Promise.all([
      import("@/modules/auth/application/services/auth-audit.listener"),
      import("@/modules/audit-logs/application/services/audit-log-listener.service"),
      import("@/modules/notifications/application/services/notification.listener"),
      import("@/modules/notifications/application/services/notification-email.listener"),
      import("@/modules/notifications/application/services/notification-whatsapp.listener"),
      import("@/modules/users/application/services/password-reset-notification.listener"),
      import("@/modules/audit-logs/infrastructure/database/repositories/drizzle-audit-log.repository"),
      import("@/modules/notifications/infrastructure/database/repositories/drizzle-notification.repository"),
      import("@/modules/setting/infrastructure/database/repositories/drizzle-setting.repository"),
    ]);

    // Listeners with no repository dependencies self-register on import.
    await Promise.all([
      import("@/modules/users/application/services/user-notification.service"),
      import("@/modules/users/application/services/password-reset-requested.listener"),
      import("@/modules/products/application/services/product-inventory.service"),
    ]);

    const auditLogRepo = new DrizzleAuditLogRepository();
    const notificationRepo = new DrizzleNotificationRepository();
    const settingRepo = new DrizzleSettingRepository();

    new AuthAuditListener(auditLogRepo).registerListeners();
    new AuditLogListener(auditLogRepo).registerListeners();
    new NotificationListener(notificationRepo, settingRepo).registerListeners();
    new NotificationEmailListener(settingRepo).registerListeners();
    new NotificationWhatsAppListener(settingRepo).registerListeners();
    new PasswordResetNotificationListener(notificationRepo, settingRepo).registerListeners();
  }
}

export const eventDispatcher = EventDispatcher.getInstance();

// Initialize all listeners on server startup (never in the browser bundle).
if (typeof window === "undefined") {
  eventDispatcher
    .initializeListeners()
    .catch((err) => logger.error({ err }, "Event listener registration failed"));
}
