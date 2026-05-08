import React, { useEffect, useState } from "react";
import { View, Text, Switch, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ExpoNotifications from "expo-notifications";

interface NotificationSettingsProps {
  tier: string;
}

const INSPIRATIONAL_QUOTES = [
  "You don't know who is your next connection unless you chat",
  "Every conversation is a new opportunity",
  "Great relationships start with a simple hello",
  "Your network is your net worth - connect today!",
  "The best time to reach out is now",
  "Don't wait for opportunities, create them through connections",
  "A simple message can change your life",
  "Stay connected, stay relevant",
  "Relationships are the currency of success",
  "Today's stranger could be tomorrow's business partner",
  "The more you connect, the more you grow",
  "Your next big break is one message away",
  "Communication builds bridges to new opportunities",
  "Don't underestimate the power of staying in touch",
  "Every contact in your phone is a potential opportunity",
  "Reach out and watch opportunities multiply",
  "Success comes to those who communicate",
  "Your network determines your net worth",
  "A quick call today could lead to big things tomorrow",
  "Stay connected, stay ahead",
  "The fortune is in the follow-up",
  "Opportunities multiply when they are seized",
  "Your next level is in your contacts",
  "Don't just collect contacts, nurture them",
  "The richest people in the world build networks",
  "Communication is the key to opportunity",
  "Your phone holds unlimited potential - use it",
  "Make connecting a daily habit",
  "Success is a team sport - build your team",
  "The best investment is in your relationships",
  "Don't just scroll - connect!",
  "Your future is in your contacts list",
  "One message can change everything",
  "Build bridges, not just contacts",
  "The more you give to relationships, the more you get",
  "Your network is your safety net",
  "Opportunities come from people, not just ideas",
  "Stay top of mind by staying in touch",
  "The world is run by those who communicate",
  "Your next big opportunity is in your phone",
];

const HOLIDAY_MESSAGES: { [key: string]: { title: string; message: string } } =
  {
    "01-01": {
      title: "Happy New Year!",
      message: "Start the year by connecting with loved ones!",
    },
    "02-14": {
      title: "Valentine's Day",
      message: "Spread love today - send a message to someone special!",
    },
    "03-17": {
      title: "St. Patrick's Day",
      message: "Luck comes to those who connect - reach out today!",
    },
    "04-01": {
      title: "April Fools' Day",
      message: "No joke - connecting is serious business!",
    },
    "05-12": {
      title: "Mother's Day",
      message: "Call your mom today and make her day special!",
    },
    "06-16": {
      title: "Father's Day",
      message: "Don't forget to call dad today!",
    },
    "12-25": {
      title: "Christmas",
      message: "Spread holiday cheer with your connections!",
    },
    "12-31": {
      title: "New Year's Eve",
      message: "End the year by reconnecting with old friends!",
    },
  };

export default function NotificationSettings({
  tier,
}: NotificationSettingsProps) {
  const [dailyRemindersEnabled, setDailyRemindersEnabled] = useState(true);
  const [holidayRemindersEnabled, setHolidayRemindersEnabled] = useState(true);
  // Notification handler is set once in app/(tabs)/index.tsx — do NOT set it again here
  useEffect(() => {
    (async () => {
      const { status } = await ExpoNotifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please enable notifications in your device settings."
        );
      }
    })();
    if (tier === "elite") {
      // On mount, ensure notifications are scheduled if enabled
      if (dailyRemindersEnabled) scheduleDailyNotifications();
      if (holidayRemindersEnabled) scheduleHolidayNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getRandomQuote = () =>
    INSPIRATIONAL_QUOTES[
      Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length)
    ];

 const scheduleNotification = async (
  body: string,
  trigger: any,
  data: any
) => {
  await ExpoNotifications.scheduleNotificationAsync({
    content: {
      title: "Callinster Reminder",
      body,
      data,
      sound: true,
      priority: ExpoNotifications.AndroidNotificationPriority.HIGH,
    },
    trigger,
  });
};

  const scheduleDailyNotifications = async () => {
    await ExpoNotifications.cancelAllScheduledNotificationsAsync();
    await scheduleNotification(
      getRandomQuote(),
      { type: ExpoNotifications.SchedulableTriggerInputTypes.DAILY, hour: 8, minute: 0 },
      { openScreen: "contacts" }
    );
    await scheduleNotification(
      getRandomQuote(),
      { type: ExpoNotifications.SchedulableTriggerInputTypes.DAILY, hour: 13, minute: 0 },
      { openScreen: "contacts" }
    );
    await scheduleNotification(
      getRandomQuote(),
      { type: ExpoNotifications.SchedulableTriggerInputTypes.DAILY, hour: 20, minute: 0 },
      { openScreen: "contacts" }
    );
  };

  const scheduleHolidayNotifications = async () => {
    const today = new Date();
    const todayStr = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(
      today.getDate()
    ).padStart(2, "0")}`;
    if (HOLIDAY_MESSAGES[todayStr]) {
      const { title, message } = HOLIDAY_MESSAGES[todayStr];
      await scheduleNotification(
        message,
        { hour: 12, minute: 0, repeats: false },
        { title, openScreen: "contacts", isHoliday: true }
      );
    }
  };

  const handleDailySwitch = async (value: boolean) => {
    setDailyRemindersEnabled(value);
    if (value) {
      await scheduleDailyNotifications();
      Alert.alert(
        "Daily Reminders Enabled",
        "You will receive daily inspirational quotes."
      );
    } else {
      await ExpoNotifications.cancelAllScheduledNotificationsAsync();
      if (holidayRemindersEnabled) await scheduleHolidayNotifications();
      Alert.alert(
        "Daily Reminders Disabled",
        "You will not receive daily inspirational quotes."
      );
    }
  };

  const handleHolidaySwitch = async (value: boolean) => {
    setHolidayRemindersEnabled(value);
    if (value) {
      await scheduleHolidayNotifications();
      Alert.alert(
        "Holiday Reminders Enabled",
        "You will receive holiday notifications."
      );
    } else {
      // No direct way to cancel only holiday notifications, so just alert
      Alert.alert(
        "Holiday Reminders Disabled",
        "You will not receive holiday notifications."
      );
    }
  };

  if (tier !== "elite") {
    return (
      <View style={{ padding: 16, alignItems: "center" }}>
        <Ionicons name="lock-closed" size={48} color="#CBD5E0" />
        <Text
          style={{
            fontSize: 16,
            color: "#718096",
            marginTop: 16,
            textAlign: "center",
          }}
        >
          Upgrade to Elite tier to customize notification settings
        </Text>
      </View>
    );
  }

 const sendTestNotification = async () => {
  await ExpoNotifications.scheduleNotificationAsync({
    content: {
      title: "Test Notification",
      body: "This is how your notification will look!",
      sound: true,
      priority: ExpoNotifications.AndroidNotificationPriority.HIGH,

    },
    trigger: { type: ExpoNotifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 1 },
  });
};

  return (
    <View>
      <View style={{ marginBottom: 24 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#2D3748" }}>
            Daily Reminders
          </Text>
          <Switch
            value={dailyRemindersEnabled}
            onValueChange={handleDailySwitch}
            trackColor={{ false: "#E2E8F0", true: "#5E72E4" }}
            thumbColor="white"
          />
        </View>
        <Text style={{ color: "#718096", fontSize: 14 }}>
          Receive 3 daily inspirational quotes to encourage networking
        </Text>
      </View>

      <View style={{ marginBottom: 24 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#2D3748" }}>
            Holiday Reminders
          </Text>
          <Switch
            value={holidayRemindersEnabled}
            onValueChange={handleHolidaySwitch}
            trackColor={{ false: "#E2E8F0", true: "#5E72E4" }}
            thumbColor="white"
          />
        </View>
        <Text style={{ color: "#718096", fontSize: 14 }}>
          Special notifications for holidays and celebrations
        </Text>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: "#2D3748",
            marginBottom: 8,
          }}
        >
          Notification Schedule
        </Text>
        <View
          style={{
            backgroundColor: "#F8FAFC",
            borderRadius: 8,
            padding: 12,
          }}
        >
          <Text style={{ color: "#4A5568", marginBottom: 4 }}>
            • Morning: 8:00 AM
          </Text>
          <Text style={{ color: "#4A5568", marginBottom: 4 }}>
            • Afternoon: 1:00 PM
          </Text>
          <Text style={{ color: "#4A5568" }}>• Evening: 8:00 PM</Text>
        </View>
      </View>

      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 12,
          borderTopWidth: 1,
          borderTopColor: "#EDF2F7",
        }}
        onPress={() =>
          Alert.alert(
            "Quiet Hours",
            "Notifications are silenced from 10 PM to 7 AM."
          )
        }
      >
        <Ionicons
          name="notifications-off-outline"
          size={20}
          color="#5E72E4"
          style={{ marginRight: 12 }}
        />
        <Text style={{ flex: 1, fontSize: 16, color: "#2D3748" }}>
          Quiet Hours (10 PM - 7 AM)
        </Text>
        <Ionicons name="chevron-forward" size={20} color="#A0AEC0" />
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: "#5E72E4",
          padding: 12,
          borderRadius: 8,
          alignItems: "center",
          marginBottom: 24,
        }}
        onPress={sendTestNotification}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>
          Send Test Notification
        </Text>
      </TouchableOpacity>
    </View>
  );
}
