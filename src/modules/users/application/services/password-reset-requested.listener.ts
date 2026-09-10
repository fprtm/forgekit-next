import { eventDispatcher } from "@/shared/application/services/event-dispatcher.service";
import { PasswordResetRequestedEvent } from "@/modules/users/domain/events/user.events";
import { logger } from "@/shared/lib/logger";
import { env } from "@/shared/config/env";

/**
 * Reacts to PasswordResetRequestedEvent. There is no real email provider
 * wired up yet (see notification-email.listener.ts's TODO for the same gap),
 * so in dev/for now this logs the reset link via the shared logger — clearly
 * visible on the server console — instead of silently dropping it. Swapping
 * in a real provider later only means changing this listener; the handler
 * and event stay the same either way.
 */
export class PasswordResetRequestedListener {
  public registerListeners(): void {
    eventDispatcher.register<PasswordResetRequestedEvent>(
      "PasswordResetRequestedEvent",
      async (event) => {
        const resetLink = `${env.NEXT_PUBLIC_APP_URL}/reset-password?token=${event.token}`;

        logger.info(
          { email: event.email, resetLink },
          "Password reset requested (dev delivery — no email provider configured)"
        );
      }
    );
  }
}

export const passwordResetRequestedListener = new PasswordResetRequestedListener();
passwordResetRequestedListener.registerListeners();
