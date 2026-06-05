import { eventDispatcher } from "@/shared/application/services/event-dispatcher.service";
import { UserRegisteredEvent } from "../../domain/events/user.events";

export class UserNotificationService {
  public registerListeners(): void {
    eventDispatcher.register<UserRegisteredEvent>("UserRegisteredEvent", async (event) => {
      // In a real application, this would inject an IEmailService port
      // and send an actual email.
      console.log(`[Notification Service] Sending welcome email to ${event.user.email}...`);
      
      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      console.log(`[Notification Service] Welcome email sent successfully to ${event.user.email}`);
    });
  }
}

export const userNotificationService = new UserNotificationService();
userNotificationService.registerListeners();
