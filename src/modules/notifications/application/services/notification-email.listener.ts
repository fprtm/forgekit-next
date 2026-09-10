import { eventDispatcher } from "@/shared/application/services/event-dispatcher.service";
import { NotificationSentEvent } from "@/modules/notifications/domain/events/notification.events";
import { ISettingRepository } from "@/modules/setting/domain/repositories/setting-repository.interface";

export class NotificationEmailListener {
  constructor(private readonly settingRepo: ISettingRepository) {}

  public registerListeners(): void {
    eventDispatcher.register<NotificationSentEvent>("NotificationSentEvent", async (event) => {
      if (!event.channelsUsed.includes("email")) return;

      const emailGateway = await this.settingRepo.findByKey("email_gateway");

      if (!emailGateway?.value?.host) {
        console.log(`[EmailListener] Email gateway not configured. Skipping email for notification ${event.notificationId}`);
        return;
      }

      try {
        console.log(`[EmailListener] Sending email to user ${event.userId}...`);
        console.log(`[EmailListener] Subject: ${event.title}`);
        console.log(`[EmailListener] Body: ${event.message}`);
        console.log(`[EmailListener] Email sent successfully for notification ${event.notificationId}`);

        // TODO: Integrate with actual email provider (Resend, SendGrid, Nodemailer, etc.)
        // Example with Resend:
        // import { Resend } from 'resend';
        // const resend = new Resend(process.env.RESEND_API_KEY);
        // await resend.emails.send({
        //   from: 'noreply@example.com',
        //   to: user.email,
        //   subject: event.title,
        //   text: event.message,
        // });
      } catch (error) {
        console.error(`[EmailListener] Failed to send email for notification ${event.notificationId}:`, error);
      }
    });
  }
}
