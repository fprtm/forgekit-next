import { DomainEvent } from "../../domain/events/domain.event";
import { logger } from "@/shared/lib/logger";



type EventHandler<T extends DomainEvent> = (event: T) => Promise<void> | void;

export class EventDispatcher {
  private static instance: EventDispatcher;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handlers: Map<string, EventHandler<any>[]> = new Map();

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
    this.handlers.get(eventName)!.push(handler);
  }

  public async dispatch(event: DomainEvent): Promise<void> {
    const eventHandlers = this.handlers.get(event.eventName);
    if (eventHandlers) {
      const promises = eventHandlers.map((handler) => handler(event));
      await Promise.allSettled(promises); // Prevent one failed listener from crashing others
    }
  }
}

export const eventDispatcher = EventDispatcher.getInstance();

// Dynamically import all listeners to register them on server startup while avoiding circular dependencies
if (typeof window === "undefined") {
  Promise.all([
    import("@/modules/auth/application/services/auth-audit.listener"),
    import("@/modules/audit-logs/application/services/audit-log-listener.service"),
    import("@/modules/users/application/services/user-notification.service"),
    import("@/modules/products/application/services/product-inventory.service"),
    import("@/modules/notifications/application/services/notification.listener"),
    import("@/modules/notifications/application/services/notification-email.listener"),
    import("@/modules/notifications/application/services/notification-whatsapp.listener"),
  ]).catch((err) => logger.error({ err }, "Event listener registration failed"));
}
