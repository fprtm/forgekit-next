import { DomainEvent } from "../../domain/events/domain.event";

type EventHandler<T extends DomainEvent> = (event: T) => Promise<void> | void;

export class EventDispatcher {
  private static instance: EventDispatcher;
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
