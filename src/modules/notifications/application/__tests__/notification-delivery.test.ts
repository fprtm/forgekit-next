import { describe, expect, it, mock, beforeEach } from "bun:test";
import { EventDispatcher } from "@/shared/application/services/event-dispatcher.service";
import { NotificationSentEvent } from "@/modules/notifications/domain/events/notification.events";

// Mock server-only
mock.module("server-only", () => { return {} });

describe("Notification Delivery - Event Listener Tests", () => {
  let eventDispatcher: EventDispatcher;
  let dispatchedEvents: NotificationSentEvent[];

  beforeEach(() => {
    eventDispatcher = EventDispatcher.getInstance();
    dispatchedEvents = [];
  });

  it("should dispatch NotificationSentEvent with all fields", async () => {
    const handler = mock(async (event: NotificationSentEvent) => {
      dispatchedEvents.push(event);
    });

    eventDispatcher.register("NotificationSentEvent", handler);

    const event = new NotificationSentEvent(
      "notif-1",
      "user-1",
      "Test Title",
      "Test Message",
      "security",
      "high",
      ["email", "push"]
    );

    await eventDispatcher.dispatch(event);

    expect(dispatchedEvents.length).toBe(1);
    expect(dispatchedEvents[0].notificationId).toBe("notif-1");
    expect(dispatchedEvents[0].userId).toBe("user-1");
    expect(dispatchedEvents[0].title).toBe("Test Title");
    expect(dispatchedEvents[0].message).toBe("Test Message");
    expect(dispatchedEvents[0].type).toBe("security");
    expect(dispatchedEvents[0].priority).toBe("high");
    expect(dispatchedEvents[0].channelsUsed).toEqual(["email", "push"]);
  });

  it("should handle multiple listeners for the same event", async () => {
    const handler1 = mock(() => Promise.resolve());
    const handler2 = mock(() => Promise.resolve());

    eventDispatcher.register("NotificationSentEvent", handler1);
    eventDispatcher.register("NotificationSentEvent", handler2);

    const event = new NotificationSentEvent(
      "notif-2",
      "user-2",
      "Multi",
      "Test",
      "general",
      "low",
      ["push"]
    );

    await eventDispatcher.dispatch(event);

    expect(handler1).toHaveBeenCalled();
    expect(handler2).toHaveBeenCalled();
  });

  it("should not call listeners for unrelated events", async () => {
    const handler = mock(() => Promise.resolve());
    eventDispatcher.register("NotificationSentEvent", handler);

    // Dispatch a different event type - unknown is safe for testing
    const unrelatedEvent = { eventName: "SomeOtherEvent", occurredOn: new Date() };
    await eventDispatcher.dispatch(unrelatedEvent as unknown as NotificationSentEvent);

    expect(handler).not.toHaveBeenCalled();
  });

  it("should filter channels correctly in email listener", async () => {
    const emailHandler = mock(async (event: NotificationSentEvent) => {
      if (!event.channelsUsed.includes("email")) {
        throw new Error("Email channel not active");
      }
    });

    eventDispatcher.register("NotificationSentEvent", emailHandler);

    // Event without email channel
    const eventNoEmail = new NotificationSentEvent(
      "notif-3",
      "user-3",
      "No Email",
      "Test",
      "system",
      "medium",
      ["push"]
    );

    await eventDispatcher.dispatch(eventNoEmail);

    // Email listener should still be called (its own logic checks channels)
    expect(emailHandler).toHaveBeenCalled();
  });

  it("should dispatch event with critical priority correctly", async () => {
    const handler = mock(async (event: NotificationSentEvent) => {
      dispatchedEvents.push(event);
    });

    eventDispatcher.register("NotificationSentEvent", handler);

    const event = new NotificationSentEvent(
      "notif-4",
      "user-4",
      "Critical Alert",
      "System is down",
      "system",
      "critical",
      ["email", "push", "whatsapp"]
    );

    await eventDispatcher.dispatch(event);

    expect(dispatchedEvents[0].priority).toBe("critical");
    expect(dispatchedEvents[0].type).toBe("system");
    expect(dispatchedEvents[0].channelsUsed).toContain("whatsapp");
  });
});
