import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

type ReminderDiagnosticItem = {
  notificationId: string;
  targetEpochMs: number;
  targetTimeIso: string;
  targetTimeLocal: string;
  timezone: string;
};

export async function logReminderDiagnostics(
  reminders: ReminderDiagnosticItem[],
  channelId: string
): Promise<void> {
  try {
    const [permissions, scheduledNotifications] = await Promise.all([
      Notifications.getPermissionsAsync(),
      Notifications.getAllScheduledNotificationsAsync(),
    ]);

    let channelInfo: Notifications.NotificationChannel | null = null;
    if (Platform.OS === "android") {
      channelInfo = await Notifications.getNotificationChannelAsync(channelId);
    }

    console.log("[ReminderDiagnostics] Permission status:", permissions.status);
    if (Platform.OS === "android") {
      console.log("[ReminderDiagnostics] Channel status:", channelInfo ? "available" : "missing");
    }
    console.log("[ReminderDiagnostics] Stored reminder count:", reminders.length);
    console.log("[ReminderDiagnostics] Scheduled notification count:", scheduledNotifications.length);

    reminders.forEach(reminder => {
      const matchingNotification = scheduledNotifications.find(
        notification => notification.identifier === reminder.notificationId
      );
      console.log("[ReminderDiagnostics] Reminder:", {
        id: reminder.notificationId,
        targetEpochMs: reminder.targetEpochMs,
        targetTimeIso: reminder.targetTimeIso,
        targetTimeLocal: reminder.targetTimeLocal,
        timezone: reminder.timezone,
        isScheduled: Boolean(matchingNotification),
      });
    });
  } catch (error) {
    console.error("[ReminderDiagnostics] Failed to collect diagnostics:", error);
  }
}
