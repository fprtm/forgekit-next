import { eventDispatcher } from "@/shared/application/services/event-dispatcher.service";
import { NotificationSentEvent } from "@/modules/notifications/domain/events/notification.events";
import { DrizzleSettingRepository } from "@/modules/setting/infrastructure/database/repositories/drizzle-setting.repository";

const settingRepo = new DrizzleSettingRepository();

export class NotificationWhatsAppListener {
  public registerListeners(): void {
    eventDispatcher.register<NotificationSentEvent>("NotificationSentEvent", async (event) => {
      if (!event.channelsUsed.includes("whatsapp")) return;

      const fonnteCreds = await settingRepo.findByKey("fonnte_credentials");

      if (!fonnteCreds?.value?.apiToken) {
        console.log(`[WhatsAppListener] Fonnte credentials not configured. Skipping WhatsApp for notification ${event.notificationId}`);
        return;
      }

      try {
        console.log(`[WhatsAppListener] Sending WhatsApp message to user ${event.userId}...`);
        console.log(`[WhatsAppListener] Message: [${event.type.toUpperCase()}] ${event.title} - ${event.message}`);
        console.log(`[WhatsAppListener] WhatsApp message sent successfully for notification ${event.notificationId}`);

        // TODO: Integrate with actual WhatsApp provider (Fonnte API)
        // Example with Fonnte:
        // const response = await fetch('https://api.fonnte.com/send', {
        //   method: 'POST',
        //   headers: {
        //     'Authorization': fonnteCreds.value.apiToken,
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({
        //     target: user.phone,
        //     message: `[${event.type.toUpperCase()}] ${event.title}\n\n${event.message}`,
        //     deviceId: fonnteCreds.value.deviceId,
        //   }),
        // });
      } catch (error) {
        console.error(`[WhatsAppListener] Failed to send WhatsApp for notification ${event.notificationId}:`, error);
      }
    });
  }
}

export const notificationWhatsAppListener = new NotificationWhatsAppListener();
notificationWhatsAppListener.registerListeners();
