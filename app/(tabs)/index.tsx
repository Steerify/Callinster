import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/feed.styles";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Button } from "@react-navigation/elements";
import * as Contacts from "expo-contacts";
import * as Device from "expo-device";
import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import React, { useCallback, useEffect, useRef, useState } from "react";
import CallinsterCarousel from "../../components/aboutCallinster";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Drawer } from "react-native-drawer-layout";
import Contact from "../../components/Contact";
import Loader from "../../components/Loader";
import { useSubscription } from "../../components/Subsceiption";
import { useTheme } from "../../contexts/ThemeContext";
import { ThemeSwitch } from "../../components/ThemeSwitch";
import Carousel from "../../components/homePageCarousel";

type MyContact = {
  id: string;
  name: string;
  phoneNumbers?: { number: string }[];
};

type CallingApp = {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  requiresUsername?: boolean;
};

type ScheduledCall = {
  id: string;
  contact: string;
  app: string;
  time: string;
  notificationId: string;
};

type NotificationData = {
  app: string;
  contact: string;
  type: string;
};

const callingApps: CallingApp[] = [
  { id: "phone", name: "Phone", icon: "call-outline" },
  { id: "whatsapp", name: "WhatsApp", icon: "logo-whatsapp" },
  {
    id: "messenger",
    name: "Messenger",
    icon: "logo-facebook",
    requiresUsername: true,
  },
  { id: "telegram", name: "Telegram", icon: "paper-plane-outline" },
  { id: "skype", name: "Skype", icon: "logo-skype", requiresUsername: true },
  { id: "meet", name: "Google Meet", icon: "videocam-outline" },
  {
    id: "zoom",
    name: "Zoom",
    icon: "videocam-outline",
    requiresUsername: true,
  },
  {
    id: "teams",
    name: "Microsoft Teams",
    icon: "people-outline",
    requiresUsername: true,
  },
  {
    id: "discord",
    name: "Discord",
    icon: "game-controller-outline",
    requiresUsername: true,
  },
  {
    id: "snapchat",
    name: "Snapchat",
    icon: "camera-outline",
    requiresUsername: true,
  },
];

// Centralized contact cleaning function
const cleanContact = (contact: string, isUsername: boolean): string => {
  if (isUsername) return contact.trim();

  let phone = contact.replace(/[^\d+]/g, "");
  if (!phone.startsWith("+")) {
    if (/^0\d{7,10}$/.test(phone)) {
      phone = "+234" + phone.substring(1);
    }
  }
  return phone;
};

// Unified fallback link generation
const getFallbackLink = (appId: string, contact: string): string => {
  const cleaned = cleanContact(
    contact,
    callingApps.some(a => a.id === appId && a.requiresUsername)
  );

  switch (appId) {
    case "whatsapp":
      return `https://wa.me/${cleaned.replace(/\+/g, "")}`;
    case "telegram":
      return `https://t.me/${cleaned.replace(/^@/, "")}`;
    case "skype":
      return `https://join.skype.com/invite/${cleaned}`;
    case "zoom":
      return `https://zoom.us/j/${encodeURIComponent(cleaned)}`;
    case "discord":
      return `https://discord.com/users/${cleaned}`;
    case "messenger":
      return `https://m.me/${cleaned}`;
    case "snapchat":
      return `https://snapchat.com/add/${cleaned}`;
    default:
      return getAppStoreLink(appId);
  }
};

export async function incrementCounter(key: string) {
  const today = new Date().toISOString().slice(0, 10);
  const storageKey = `${key}_${today}`;
  const count = parseInt((await AsyncStorage.getItem(storageKey)) || "0", 10);
  await AsyncStorage.setItem(storageKey, (count + 1).toString());
}

export async function getCounter(key: string) {
  const today = new Date().toISOString().slice(0, 10);
  const storageKey = `${key}_${today}`;
  return parseInt((await AsyncStorage.getItem(storageKey)) || "0", 10);
}

export async function resetCounter(key: string) {
  const today = new Date().toISOString().slice(0, 10);
  const storageKey = `${key}_${today}`;
  await AsyncStorage.removeItem(storageKey);
}

// App store links
const getAppStoreLink = (appId: string): string => {
  const appStoreLinks: Record<string, string> = {
    whatsapp:
      Platform.OS === "ios"
        ? "https://apps.apple.com/app/whatsapp-messenger/id310633997"
        : "https://play.google.com/store/apps/details?id=com.whatsapp",
    messenger:
      Platform.OS === "ios"
        ? "https://apps.apple.com/app/facebook-messenger/id454638411"
        : "https://play.google.com/store/apps/details?id=com.facebook.orca",
    telegram:
      Platform.OS === "ios"
        ? "https://apps.apple.com/app/telegram-messenger/id686449807"
        : "https://play.google.com/store/apps/details?id=org.telegram.messenger",
    skype:
      Platform.OS === "ios"
        ? "https://apps.apple.com/app/skype/id304878510"
        : "https://play.google.com/store/apps/details?id=com.skype.raider",
    zoom:
      Platform.OS === "ios"
        ? "https://apps.apple.com/app/zoom-cloud-meetings/id546505307"
        : "https://play.google.com/store/apps/details?id=us.zoom.videomeetings",
    teams:
      Platform.OS === "ios"
        ? "https://apps.apple.com/app/microsoft-teams/id983085664"
        : "https://play.google.com/store/apps/details?id=com.microsoft.teams",
    discord:
      Platform.OS === "ios"
        ? "https://apps.apple.com/app/discord-chat-for-gamers/id985746746"
        : "https://play.google.com/store/apps/details?id=com.discord",
    snapchat:
      Platform.OS === "ios"
        ? "https://apps.apple.com/app/snapchat/id447188370"
        : "https://play.google.com/store/apps/details?id=com.snapchat.android",
  };
  return appStoreLinks[appId] || "https://www.google.com";
};

// Format date and time for display
const formatDisplayDateTime = (date: Date): string => {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// Format app name for display
const formatAppName = (appId: string) => {
  const app = callingApps.find(a => a.id === appId);
  return app ? app.name : "Unknown App";
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function Index() {
  const { signOut } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [avoidPrefixes, setAvoidPrefixes] = useState<string[]>([]);
  const [inputPrefix, setInputPrefix] = useState("");
  const [avoidNamePrefixes, setAvoidNamePrefixes] = useState<string[]>([]);
  const [inputNamePrefix, setInputNamePrefix] = useState("");
  const [allContacts, setAllContacts] = useState<MyContact[]>([]);
  const [fiveContacts, setFiveContacts] = useState<MyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubModal, setShowSubModal] = useState(false);
  const [showPlanDetails, setShowPlanDetails] = useState(false);
  const { tier } = useSubscription();
  const [favoriteContacts, setFavoriteContacts] = useState<MyContact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [callModalVisible, setCallModalVisible] = useState(false);
  const [contactInput, setContactInput] = useState("");
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [mode, setMode] = useState<"date" | "time">("date");
  const [scheduledCalls, setScheduledCalls] = useState<ScheduledCall[]>([]);
  const [isScheduling, setIsScheduling] = useState(false);
  const [callinsterModalVisible, setCallinsterModalVisible] = useState(false);

  type ContactPickerMode = "manual" | "contacts";
  const [contactPickerMode, setContactPickerMode] =
    useState<ContactPickerMode>("manual");
  const [contactSearchQuery, setContactSearchQuery] = useState("");
  const [filteredContacts, setFilteredContacts] = useState<MyContact[]>([]);

  const { colors } = useTheme();

  const getCombinedDateTime = () => {
    const combined = new Date(date);
    combined.setHours(time.getHours());
    combined.setMinutes(time.getMinutes());
    combined.setSeconds(0);
    combined.setMilliseconds(0);
    return combined;
  };

  const setupNotifications = async () => {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please enable notifications to schedule calls"
      );
      return false;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("call-notifications", {
        name: "Call Notifications",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }
    return true;
  };

  const checkBatteryOptimization = async () => {
    if (Platform.OS === "android" && Device.isDevice) {
      Alert.alert(
        "Battery Optimization",
        "To ensure notifications work reliably, please disable battery optimization for this app in your device settings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() },
        ]
      );
    }
  };

  const homeCarouselData = [
    {
      key: "about",
      title: "About Callinster",
      subtitle: "Learn more about our features",
      action: () => setCallinsterModalVisible(true),
      bgColor: "#fff0f3",
      textColor: "#d6336c",
      icon: "information-circle",
    },
    {
      key: "quote1",
      title: "Inspiration",
      subtitle:
        "The best way to get started is to quit talking and begin doing. – Walt Disney",
      bgColor: "#fff0f3",
      textColor: "#d6336c",
      icon: "bulb",
    },
    {
      key: "quote2",
      title: "Motivation",
      subtitle:
        "Success is not final, failure is not fatal: It is the courage to continue that counts. – Winston Churchill",
      bgColor: "#f0fff4",
      textColor: "#2b8a3e",
      icon: "rocket",
    },
  ];

  const initiateCall = useCallback(async (appId: string, contact: string) => {
    const app = callingApps.find(a => a.id === appId);
    if (!app) {
      Alert.alert("Error", "Selected calling app not found");
      return;
    }

    const cleaned = cleanContact(contact, app.requiresUsername || false);
    if (!cleaned) {
      Alert.alert(
        "Error",
        `Invalid ${app.requiresUsername ? "username" : "phone number"}`
      );
      return;
    }

    let url = "";
    switch (appId) {
      case "phone":
        url = `tel:${cleaned}`;
        break;
      case "whatsapp":
        url = `whatsapp://send?phone=${cleaned.replace("+", "")}`;
        break;
      case "messenger":
        url = `fb-messenger://user/${cleaned}`;
        break;
      case "telegram":
        url = `tg://resolve?domain=${cleaned.replace(/^@/, "")}`;
        break;
      case "skype":
        url = `skype:${cleaned}?call`;
        break;
      case "zoom":
        url = cleaned.match(/^\d+$/)
          ? `zoomus://zoom.us/join?confno=${cleaned}`
          : `zoomus://zoom.us/join?confname=${encodeURIComponent(cleaned)}`;
        break;
      case "teams":
        url = `msteams://teams.microsoft.com/l/call/0/0?users=${cleaned}`;
        break;
      case "discord":
        url = `discord://discord.com/users/${cleaned}`;
        break;
      case "snapchat":
        url = `snapchat://add/${cleaned}`;
        break;
      default:
        url = `tel:${cleaned}`;
    }

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        throw new Error("App not installed");
      }
    } catch (error) {
      console.error(`Failed to open ${url}:`, error);
      const fallbackUrl = getFallbackLink(appId, cleaned);
      Alert.alert(
        "Error",
        `${app.name} is not installed. Would you like to install it?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Install App", onPress: () => Linking.openURL(fallbackUrl) },
        ]
      );
    }
  }, []);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      async response => {
        const data = response.notification.request.content
          .data as NotificationData;
        if (data.type === "scheduled-call") {
          await initiateCall(data.app, data.contact);

          const updatedCalls = scheduledCalls.filter(
            call =>
              call.notificationId !== response.notification.request.identifier
          );
          setScheduledCalls(updatedCalls);
          await AsyncStorage.setItem(
            "scheduledCalls",
            JSON.stringify(updatedCalls)
          );
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, [scheduledCalls, initiateCall]);

  useEffect(() => {
    const loadData = async () => {
      await setupNotifications();
      await checkBatteryOptimization();
      try {
        const favorites = await AsyncStorage.getItem("favoriteContacts");
        if (favorites) setFavoriteContacts(JSON.parse(favorites));
        const calls = await AsyncStorage.getItem("scheduledCalls");
        if (calls) setScheduledCalls(JSON.parse(calls));
        const prefixes = await AsyncStorage.getItem("avoidPrefixes");
        if (prefixes) setAvoidPrefixes(JSON.parse(prefixes));
        const namePrefixes = await AsyncStorage.getItem("avoidNamePrefixes");
        if (namePrefixes) setAvoidNamePrefixes(JSON.parse(namePrefixes));
      } catch (error) {
        console.error("Error loading data:", error);
        Alert.alert("Error", "Failed to load saved data.");
      }
    };

    loadData();

    const notificationReceivedSubscription =
      Notifications.addNotificationReceivedListener(notification => {
        const data = notification.request.content.data as NotificationData;
        if (data.type === "scheduled-call") {
          Alert.alert(
            notification.request.content.title || "Call Time!",
            notification.request.content.body ||
              "Time to make your scheduled call",
            [
              { text: "Later", style: "cancel" },
              {
                text: "Call Now",
                onPress: () => initiateCall(data.app, data.contact),
              },
            ]
          );
        }
      });

    return () => {
      notificationReceivedSubscription.remove();
    };
  }, [initiateCall]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === "granted") {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers],
        });

        const validContacts = data.filter(
          contact =>
            contact.phoneNumbers &&
            contact.phoneNumbers.length &&
            !contact.phoneNumbers.some(
              phone =>
                avoidPrefixes.some(prefix =>
                  phone.number?.replace(/\s+/g, "").startsWith(prefix)
                ) &&
                contact.name &&
                !avoidNamePrefixes.some(prefix =>
                  contact.name
                    .trim()
                    .toLowerCase()
                    .startsWith(prefix.toLowerCase())
                )
            )
        );

        const mappedContacts: MyContact[] = validContacts.map(contact => ({
          id: contact.id ?? "",
          name: contact.name ?? "",
          phoneNumbers: contact.phoneNumbers
            ? [...new Set(contact.phoneNumbers.map(p => p.number ?? ""))]
                .filter(num => num)
                .map(num => ({ number: num }))
            : [],
        }));

        const shuffled = mappedContacts.sort(() => 0.5 - Math.random());
        setAllContacts(shuffled);
        setFiveContacts(shuffled.slice(0, 5));
      } else {
        Alert.alert(
          "Permission Denied",
          "Please grant contact access to view contacts."
        );
      }
      setLoading(false);
    })();
  }, [avoidPrefixes, avoidNamePrefixes]);

  const scheduleCall = async () => {
    if (!contactInput || !selectedApp) {
      Alert.alert("Error", "Please enter a contact and select a calling app");
      return;
    }

    const app = callingApps.find(a => a.id === selectedApp);
    if (!app) {
      Alert.alert("Error", "Invalid calling app selected");
      return;
    }

    const permissionsGranted = await setupNotifications();
    if (!permissionsGranted) return;

    const callTime = getCombinedDateTime();
    const now = new Date();
    const bufferTime = new Date(now.getTime() + 60000); // 1 minute buffer

    if (callTime <= bufferTime) {
      Alert.alert(
        "Error",
        "Please select a future time (at least 1 minute from now)"
      );
      return;
    }

    setIsScheduling(true);
    try {
      const cleanedContact = cleanContact(
        contactInput,
        app.requiresUsername || false
      );

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Time to call ${contactInput}`,
          body: `Scheduled call via ${app.name}`,
          data: {
            app: selectedApp,
            contact: cleanedContact,
            type: "scheduled-call",
          },
          sound: true,
        },
        trigger: {
          date: callTime,
          channelId: "call-notifications",
        },
      });

      const callData: ScheduledCall = {
        id: Date.now().toString(),
        contact: contactInput,
        app: selectedApp,
        time: callTime.toISOString(),
        notificationId,
      };

      const updatedCalls = [...scheduledCalls, callData];
      setScheduledCalls(updatedCalls);
      await AsyncStorage.setItem(
        "scheduledCalls",
        JSON.stringify(updatedCalls)
      );

      setCallModalVisible(false);
      Alert.alert(
        "Success",
        `Call scheduled for ${formatDisplayDateTime(callTime)}`
      );
    } catch (error) {
      console.error("Scheduling error:", error);
      Alert.alert("Error", "Failed to schedule call. Please try again.");
    } finally {
      setIsScheduling(false);
      setContactInput("");
      setSelectedApp(null);
      setDate(new Date());
      setTime(new Date());
    }
  };

  const cancelScheduledCall = async (scheduledCall: ScheduledCall) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(
        scheduledCall.notificationId
      );
      const updatedCalls = scheduledCalls.filter(
        call => call.id !== scheduledCall.id
      );
      setScheduledCalls(updatedCalls);
      await AsyncStorage.setItem(
        "scheduledCalls",
        JSON.stringify(updatedCalls)
      );
      Alert.alert("Success", "Scheduled call cancelled");
    } catch (error) {
      console.error("Error canceling notification:", error);
      Alert.alert("Error", "Failed to cancel scheduled call");
    }
  };

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || (mode === "date" ? date : time);

    if (Platform.OS === "android") {
      setShowDatePicker(false);
      setShowTimePicker(false);
    }

    if (event.type === "set") {
      if (mode === "date") {
        setDate(currentDate);
      } else {
        setTime(currentDate);
      }
    }
  };

  const showDatepicker = () => {
    setMode("date");
    setShowDatePicker(true);
  };

  const showTimepicker = () => {
    setMode("time");
    setShowTimePicker(true);
  };

  const renderScheduledCall = ({ item }: { item: ScheduledCall }) => (
    <View
      style={{
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <View>
        <Text style={{ fontWeight: "bold" }}>{item.contact}</Text>
        <Text>{formatAppName(item.app)}</Text>
        <Text>{formatDisplayDateTime(new Date(item.time))}</Text>
      </View>
      <TouchableOpacity onPress={() => cancelScheduledCall(item)}>
        <Ionicons name="close-circle" size={24} color="#F44336" />
      </TouchableOpacity>
    </View>
  );

  async function handleDelete(id: string): Promise<void> {
    let limit = 5;
    if (tier === "premium") limit = 10;
    if (tier === "elite") limit = Infinity;
    const deletesToday = await getCounter("deletes");
    if (deletesToday >= limit) {
      setShowSubModal(true);
      return;
    }
    await incrementCounter("deletes");

    setFiveContacts(prev => {
      const updated = prev.filter(contact => contact.id !== id);
      const remaining = allContacts.filter(
        c => !updated.some(fc => fc.id === c.id) && c.id !== id
      );
      if (remaining.length > 0) {
        const next = remaining[Math.floor(Math.random() * remaining.length)];
        return [...updated, next];
      }
      return updated;
    });

    setAllContacts(prev => prev.filter(contact => contact.id !== id));
  }

  const handleContactSearch = (query: string) => {
    setContactSearchQuery(query);
    if (query.trim()) {
      const filtered = allContacts.filter(
        contact =>
          contact.name.toLowerCase().includes(query.toLowerCase()) ||
          contact.phoneNumbers?.some(p => p.number.includes(query))
      );
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts([]);
    }
  };

  type DayPreference = {
    calls: boolean;
    messages: boolean;
  };

  type WeeklyPreferences = {
    [key in
      | "monday"
      | "tuesday"
      | "wednesday"
      | "thursday"
      | "friday"
      | "saturday"
      | "sunday"]: DayPreference;
  };

  const [weeklyPreferences, setWeeklyPreferences] = useState<WeeklyPreferences>(
    {
      monday: { calls: true, messages: true },
      tuesday: { calls: true, messages: true },
      wednesday: { calls: true, messages: true },
      thursday: { calls: true, messages: true },
      friday: { calls: true, messages: true },
      saturday: { calls: true, messages: true },
      sunday: { calls: true, messages: true },
    }
  );
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const saved = await AsyncStorage.getItem("weeklyPreferences");
        if (saved) {
          const parsedPrefs = JSON.parse(saved);
          setWeeklyPreferences(parsedPrefs);
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
      }
    };

    loadPreferences();
  }, []);

  const savePreferences = async (newPreferences: WeeklyPreferences) => {
    try {
      await AsyncStorage.setItem(
        "weeklyPreferences",
        JSON.stringify(newPreferences)
      );
      setWeeklyPreferences(newPreferences);
    } catch (error) {
      console.error("Error saving preferences:", error);
      Alert.alert("Error", "Failed to save preferences");
    }
  };

  return (
    <Drawer
      open={drawerOpen}
      onOpen={() => setDrawerOpen(true)}
      onClose={() => setDrawerOpen(false)}
      renderDrawerContent={() => (
        <View
          style={{
            flex: 1,
            padding: 20,
            backgroundColor: colors.surface,
          }}
        >
          <View
            style={{
              justifyContent: "space-between",
              width: 260,
              alignItems: "center",
              flexDirection: "row",
              marginVertical: 40,
              paddingHorizontal: 50,
              borderRadius: 30,
              padding: 10,
              backgroundColor: colors.primary,
            }}
          >
            <Image
              source={require("../../assets/images/dashboardLogo.png")}
              style={{
                width: 100,
                height: 50,
                resizeMode: "contain",
                marginLeft: -35,
                marginRight: 30,
              }}
            />

            <ThemeSwitch />
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: colors.secondary,
              padding: 15,
              borderRadius: 8,
              alignItems: "center",
              flexDirection: "row",
              marginBottom: 15,
            }}
            onPress={() => {
              setDrawerOpen(false);
              setModalVisible(true);
            }}
          >
            <Ionicons
              name="close-circle-outline"
              size={24}
              color={colors.buttonText}
              style={{ marginRight: 10 }}
            />
            <Text style={{ color: colors.buttonText, fontWeight: "bold" }}>
              Manage Avoid Prefixes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: colors.secondary,
              padding: 15,
              borderRadius: 8,
              marginBottom: 15,
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => {
              setDrawerOpen(false);
              setShowPreferencesModal(true);
            }}
          >
            <Ionicons
              name="calendar-outline"
              size={24}
              color={colors.buttonText}
              style={{ marginRight: 10 }}
            />
            <Text style={{ color: colors.buttonText, fontWeight: "bold" }}>
              Weekly Preferences
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: colors.secondary,
              padding: 15,
              borderRadius: 8,
              marginBottom: 15,
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => {
              setDrawerOpen(false);
              setCallModalVisible(true);
            }}
          >
            <Ionicons
              name="alarm-outline"
              size={24}
              color={colors.buttonText}
              style={{ marginRight: 10 }}
            />
            <Text style={{ color: colors.white, fontWeight: "bold" }}>
              Schedule a Call
            </Text>
          </TouchableOpacity>

          {scheduledCalls.length > 0 && (
            <View style={{ marginTop: 20 }}>
              <Text
                style={{
                  fontWeight: "bold",
                  marginBottom: 10,
                  color: colors.text,
                }}
              >
                Upcoming Calls
              </Text>
              <FlatList
                data={scheduledCalls}
                keyExtractor={item => item.id}
                renderItem={renderScheduledCall}
                style={{ maxHeight: 300 }}
              />
            </View>
          )}
        </View>
      )}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            flex: 1,
          },
        ]}
      >
        <SafeAreaView style={styles.header}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Image
              source={require("../../assets/images/icon.png")}
              style={{
                width: 25,
                height: 25,
                padding: 0,
                resizeMode: "contain",
              }}
            />
            {(tier === "premium" || tier === "elite") && (
              <View style={styles.searchContainer}>
                <TouchableOpacity
                  onPress={() => setDrawerOpen(true)}
                  style={styles.menuButton}
                >
                  <Ionicons name="menu" size={24} color={colors.primary} />
                </TouchableOpacity>
                <TextInput
                  placeholder="Search contacts..."
                  placeholderTextColor={colors.placeholder}
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: colors.input,
                      color: colors.text2,
                      borderColor: colors.input,
                    },
                  ]}
                  onChangeText={text => {
                    setSearchQuery(text);
                    setSearching(true);
                    if (text.trim()) {
                      if (searchTimeout.current) {
                        clearTimeout(searchTimeout.current);
                      }
                      searchTimeout.current = setTimeout(() => {
                        setSearching(false);
                      }, 300);
                    } else {
                      setSearching(false);
                    }
                  }}
                  value={searchQuery}
                />
              </View>
            )}
          </View>
        </SafeAreaView>
        <ScrollView style={{ flex: 1, marginBottom: 50 }}>
          {!loading && <Carousel data={homeCarouselData} />}
          
          <CallinsterCarousel
            visible={callinsterModalVisible}
            onClose={() => setCallinsterModalVisible(false)}
          />
          <Modal visible={modalVisible} transparent animationType="slide">
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: colors.overlay,
              }}
            >
              <View
                style={{
                  backgroundColor: colors.surface,
                  padding: 20,
                  borderRadius: 10,
                  width: "90%",
                }}
              >
                <Text style={{ color: colors.text, fontWeight: "bold" }}>
                  Avoid numbers starting with:
                </Text>
                <TextInput
                  placeholder="Enter number prefix (e.g. 080, +234)"
                  placeholderTextColor={colors.placeholder}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.input,
                    color: colors.text2,
                    marginBottom: 10,
                    padding: 8,
                    borderRadius: 5,
                  }}
                  value={inputPrefix}
                  onChangeText={setInputPrefix}
                />
                <Button
                  onPress={(): void => {
                    if (
                      inputPrefix.trim() &&
                      !avoidPrefixes.includes(inputPrefix.trim())
                    ) {
                      const newPrefixes = [
                        ...avoidPrefixes,
                        inputPrefix.trim(),
                      ];
                      setAvoidPrefixes(newPrefixes);
                      AsyncStorage.setItem(
                        "avoidPrefixes",
                        JSON.stringify(newPrefixes)
                      );
                      setInputPrefix("");
                    }
                  }}
                >
                  Add Number Prefix
                </Button>
                <View style={{ marginVertical: 10 }}>
                  {avoidPrefixes.map((prefix: string, idx: number) => (
                    <View
                      key={idx}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 5,
                      }}
                    >
                      <Text>{prefix}</Text>
                      <TouchableOpacity
                        onPress={(): void => {
                          const newPrefixes = avoidPrefixes.filter(
                            (p: string) => p !== prefix
                          );
                          setAvoidPrefixes(newPrefixes);
                          AsyncStorage.setItem(
                            "avoidPrefixes",
                            JSON.stringify(newPrefixes)
                          );
                        }}
                      >
                        <Text style={{ color: "red", marginLeft: 10 }}>
                          Remove
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
                <Text
                  style={{
                    fontWeight: "bold",
                    marginBottom: 10,
                    marginTop: 20,
                    color: colors.text,
                  }}
                >
                  Avoid names starting with:
                </Text>
                <TextInput
                  placeholder="Enter name prefix (e.g. KC, Cashflow)"
                  value={inputNamePrefix}
                  onChangeText={setInputNamePrefix}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.input,
                    color: colors.text2,
                    marginBottom: 10,
                    padding: 8,
                    borderRadius: 5,
                  }}
                />
                <Button
                  onPress={(): void => {
                    if (
                      inputNamePrefix.trim() &&
                      !avoidNamePrefixes.includes(inputNamePrefix.trim())
                    ) {
                      const newNamePrefixes = [
                        ...avoidNamePrefixes,
                        inputNamePrefix.trim(),
                      ];
                      setAvoidNamePrefixes(newNamePrefixes);
                      AsyncStorage.setItem(
                        "avoidNamePrefixes",
                        JSON.stringify(newNamePrefixes)
                      );
                      setInputNamePrefix("");
                    }
                  }}
                >
                  Add Name Prefix
                </Button>
                <View style={{ marginVertical: 5 }}>
                  {avoidNamePrefixes.map((prefix: string, idx: number) => (
                    <View
                      key={idx}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 5,
                      }}
                    >
                      <Text style={{ color: colors.text }}>{prefix}</Text>
                      <TouchableOpacity
                        onPress={(): void => {
                          const newNamePrefixes = avoidNamePrefixes.filter(
                            (p: string) => p !== prefix
                          );
                          setAvoidNamePrefixes(newNamePrefixes);
                          AsyncStorage.setItem(
                            "avoidNamePrefixes",
                            JSON.stringify(newNamePrefixes)
                          );
                        }}
                      >
                        <Text style={{ color: "red", marginLeft: 10 }}>
                          Remove
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
                <Button onPress={(): void => setModalVisible(false)}>
                  Done
                </Button>
              </View>
            </View>
          </Modal>
          <Modal visible={showSubModal} transparent animationType="slide">
            <View style={styles.modalContainer}>
              <View
                style={[
                  styles.modalContent,
                  {
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 0,
                  },
                ]}
              >
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#f7f7fa",
                    borderTopLeftRadius: 16,
                    borderBottomLeftRadius: 16,
                    padding: 20,
                  }}
                >
                  <Image
                    source={require("../../assets/images/upgrade.jpeg")}
                    style={{ width: 90, height: 90, marginBottom: 10 }}
                    resizeMode="contain"
                  />
                </View>
                <View style={{ flex: 2, padding: 20 }}>
                  <Text
                    style={{
                      fontWeight: "bold",
                      fontSize: 18,
                      color: colors.primary,
                      marginBottom: 8,
                    }}
                  >
                    Delete Limit Reached
                  </Text>
                  <Text
                    style={{ fontSize: 15, color: "#444", marginBottom: 16 }}
                  >
                    Upgrade to{" "}
                  </Text>
                  <TouchableOpacity
                    style={{
                      backgroundColor: colors.primary,
                      borderRadius: 8,
                      paddingVertical: 10,
                      paddingHorizontal: 18,
                      alignSelf: "flex-start",
                      marginBottom: 10,
                    }}
                    onPress={() => setShowPlanDetails(true)}
                  >
                    <Text style={{ color: "white", fontWeight: "bold" }}>
                      See Plans
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      backgroundColor: COLORS.grey,
                      borderRadius: 8,
                      paddingVertical: 10,
                      paddingHorizontal: 18,
                      alignSelf: "flex-start",
                    }}
                    onPress={() => setShowSubModal(false)}
                  >
                    <Text style={{ color: "#222", fontWeight: "bold" }}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <Modal visible={showPlanDetails} transparent animationType="fade">
              <View
                style={[
                  styles.modalContainer,
                  { justifyContent: "center", alignItems: "center" },
                ]}
              >
                <View
                  style={{
                    backgroundColor: "white",
                    borderRadius: 16,
                    padding: 24,
                    width: "90%",
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      fontSize: 20,
                      color: colors.primary,
                      marginBottom: 16,
                      textAlign: "center",
                    }}
                  >
                    Subscription Plans
                  </Text>
                  <View style={{ marginBottom: 18 }}>
                    <Text style={{ fontWeight: "bold", color: "#888" }}>
                      Basic (Free)
                    </Text>
                    <Text style={{ color: "#444", marginTop: 2 }}>
                      • View 5 contacts
                    </Text>
                    <Text style={{ color: "#444" }}>• Avoided prefixes</Text>
                    <Text style={{ color: "#444" }}>• 5 deletes/day</Text>
                  </View>
                  <View style={{ marginBottom: 18 }}>
                    <Text style={{ fontWeight: "bold", color: colors.primary }}>
                      Premium
                    </Text>
                    <Text style={{ color: "#444", marginTop: 2 }}>
                      • View more contacts
                    </Text>
                    <Text style={{ color: "#444" }}>• Avoided prefixes</Text>
                    <Text style={{ color: "#444" }}>• 10 deletes/day</Text>
                    <Text style={{ color: "#444" }}>• Advanced search</Text>
                    <TouchableOpacity
                      style={{
                        backgroundColor: colors.primary,
                        borderRadius: 6,
                        paddingVertical: 8,
                        paddingHorizontal: 16,
                        marginTop: 8,
                        alignSelf: "flex-start",
                      }}
                    >
                      <Text style={{ color: "white", fontWeight: "bold" }}>
                        Upgrade to Premium
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ marginBottom: 18 }}>
                    <Text
                      style={{ fontWeight: "bold", color: colors.secondary }}
                    >
                      Elite
                    </Text>
                    <Text style={{ color: "#444", marginTop: 2 }}>
                      • Unlimited contacts
                    </Text>
                    <Text style={{ color: "#444" }}>• Unlimited deletes</Text>
                    <Text style={{ color: "#444" }}>• Favorites feature</Text>
                    <Text style={{ color: "#444" }}>• No ads</Text>
                    <Text style={{ color: "#444" }}>• Advanced search</Text>
                    <TouchableOpacity
                      style={{
                        backgroundColor: colors.secondary,
                        borderRadius: 6,
                        paddingVertical: 8,
                        paddingHorizontal: 16,
                        marginTop: 8,
                        alignSelf: "flex-start",
                      }}
                    >
                      <Text style={{ color: "white", fontWeight: "bold" }}>
                        Upgrade to Elite
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={{
                      backgroundColor: COLORS.grey,
                      borderRadius: 8,
                      paddingVertical: 10,
                      paddingHorizontal: 18,
                      alignSelf: "center",
                    }}
                    onPress={() => setShowPlanDetails(false)}
                  >
                    <Text style={{ color: "#222", fontWeight: "bold" }}>
                      Close
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </Modal>

          {loading && !searchQuery.trim() && (
            <Loader
              size="large"
              style={{ flex: 1, backgroundColor: colors.background }}
            />
          )}

          {searching ? (
            <Loader
              size="large"
              style={{ flex: 1, backgroundColor: colors.background }}
            />
          ) : (
            (searchQuery.trim() ? allContacts : fiveContacts)
              .filter((contact: MyContact) =>
                contact.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((contact: MyContact) => (
                <View key={contact.id}>
                  <Contact
                    contact={contact}
                    onDelete={() => {
                      void handleDelete(contact.id);
                    }}
                    showHeart={tier === "elite"}
                    weeklyPreferences={weeklyPreferences}
                  />
                </View>
              ))
          )}
        </ScrollView>

        <Modal
          animationType="slide"
          transparent={true}
          visible={callModalVisible}
          onRequestClose={() => setCallModalVisible(false)}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "flex-end",
              backgroundColor: "rgba(0,0,0,0.5)",
            }}
          >
            <View
              style={{
                backgroundColor: colors.background,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                padding: 20,
                maxHeight: "85%",
              }}
            >
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "700",
                  color: colors.text,
                }}
              >
                Schedule a Call
              </Text>

              {/* App Selection */}
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  marginBottom: 10,
                  color: "#4A5568",
                }}
              >
                Choose App
              </Text>
              <FlatList
                data={callingApps}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{
                      padding: 12,
                      marginRight: 12,
                      borderRadius: 12,
                      backgroundColor:
                        selectedApp === item.id ? "#E6F0FF" : "#F7FAFC",
                      alignItems: "center",
                      minWidth: 80,
                      borderWidth: 1,
                      borderColor:
                        selectedApp === item.id ? "#5E72E4" : "#E2E8F0",
                    }}
                    onPress={() => {
                      setSelectedApp(item.id);
                      setContactInput("");
                    }}
                  >
                    <Ionicons
                      name={item.icon}
                      size={24}
                      color={selectedApp === item.id ? "#5E72E4" : "#718096"}
                    />
                    <Text
                      style={{
                        fontSize: 12,
                        marginTop: 4,
                        color: selectedApp === item.id ? "#5E72E4" : "#718096",
                        fontWeight: selectedApp === item.id ? "600" : "normal",
                      }}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
              />

              {/* Contact Input Section */}
              <View style={{ marginTop: 20 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    marginBottom: 10,
                    color: "#4A5568",
                  }}
                >
                  Contact Details
                </Text>

                {/* Toggle between manual/contacts */}
                <View style={{ flexDirection: "row", marginBottom: 12 }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      padding: 8,
                      backgroundColor:
                        contactPickerMode === "manual" ? "#5E72E4" : "#F7FAFC",
                      borderRadius: 8,
                      alignItems: "center",
                      marginRight: 8,
                    }}
                    onPress={() => setContactPickerMode("manual")}
                  >
                    <Text
                      style={{
                        color:
                          contactPickerMode === "manual" ? "white" : "#4A5568",
                      }}
                    >
                      Manual Input
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      flex: 1,
                      padding: 8,
                      backgroundColor:
                        contactPickerMode === "contacts"
                          ? "#5E72E4"
                          : "#F7FAFC",
                      borderRadius: 8,
                      alignItems: "center",
                    }}
                    onPress={() => setContactPickerMode("contacts")}
                  >
                    <Text
                      style={{
                        color:
                          contactPickerMode === "contacts"
                            ? "white"
                            : "#4A5568",
                      }}
                    >
                      Pick Contact
                    </Text>
                  </TouchableOpacity>
                </View>

                {contactPickerMode === "manual" ? (
                  <TextInput
                    style={{
                      height: 50,
                      borderColor: "#E2E8F0",
                      borderWidth: 1,
                      borderRadius: 12,
                      padding: 12,
                      fontSize: 16,
                      backgroundColor: "#F7FAFC",
                    }}
                    onChangeText={setContactInput}
                    value={contactInput}
                    placeholder={
                      selectedApp &&
                      callingApps.find(a => a.id === selectedApp)
                        ?.requiresUsername
                        ? "Enter username or ID"
                        : "Enter phone number"
                    }
                    keyboardType={
                      selectedApp &&
                      callingApps.find(a => a.id === selectedApp)
                        ?.requiresUsername
                        ? "default"
                        : "phone-pad"
                    }
                  />
                ) : (
                  <View>
                    <TextInput
                      style={{
                        height: 50,
                        borderColor: colors.primary,
                        borderWidth: 1,
                        borderRadius: 12,
                        padding: 12,
                        fontSize: 16,
                        backgroundColor: colors.primary,
                        marginBottom: 8,
                      }}
                      onChangeText={handleContactSearch}
                      value={contactSearchQuery}
                      placeholder="Search contacts..."
                    />

                    {/* Contacts List */}
                    {contactSearchQuery.trim() && (
                      <ScrollView
                        style={{
                          maxHeight: 200,
                          borderWidth: 1,
                          borderColor: "#E2E8F0",
                          borderRadius: 12,
                          backgroundColor: "white",
                        }}
                        showsVerticalScrollIndicator={false}
                      >
                        {filteredContacts.map(contact => (
                          <TouchableOpacity
                            key={contact.id}
                            style={{
                              padding: 12,
                              borderBottomWidth: 1,
                              borderBottomColor: "#E2E8F0",
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                            onPress={() => {
                              setContactInput(
                                contact.phoneNumbers?.[0]?.number || ""
                              );
                              setContactSearchQuery("");
                              setContactPickerMode("manual");
                            }}
                          >
                            <View
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                backgroundColor: "#E6F0FF",
                                alignItems: "center",
                                justifyContent: "center",
                                marginRight: 12,
                              }}
                            >
                              <Text style={{ fontSize: 18, color: "#5E72E4" }}>
                                {contact.name.charAt(0)}
                              </Text>
                            </View>
                            <View>
                              <Text
                                style={{
                                  fontSize: 16,
                                  fontWeight: "500",
                                  color: colors.text,
                                  marginBottom: 4,
                                }}
                              >
                                {contact.name}
                              </Text>
                              <Text
                                style={{
                                  color: colors.textSecondary,
                                  fontSize: 14,
                                }}
                              >
                                {contact.phoneNumbers?.[0]?.number}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    )}
                  </View>
                )}
              </View>

              {/* DateTime Selection */}
              <View style={{ marginTop: 20 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    marginBottom: 10,
                    color: "#4A5568",
                  }}
                >
                  Schedule Time
                </Text>

                {/* Date/Time Pickers */}
                {showDatePicker && (
                  <DateTimePicker
                    testID="datePicker"
                    value={date}
                    mode="date"
                    is24Hour={true}
                    display="default"
                    onChange={onChangeDate}
                    minimumDate={new Date()}
                  />
                )}

                {showTimePicker && (
                  <DateTimePicker
                    testID="timePicker"
                    value={time}
                    mode="time"
                    is24Hour={false}
                    display="default"
                    onChange={onChangeDate}
                  />
                )}

                <View style={{ flexDirection: "row", marginBottom: 12 }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      padding: 12,
                      backgroundColor: "#F7FAFC",
                      borderRadius: 12,
                      marginRight: 8,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                    onPress={showDatepicker}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color="#718096"
                      style={{ marginRight: 8 }}
                    />
                    <Text>{date.toLocaleDateString()}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      flex: 1,
                      padding: 12,
                      backgroundColor: "#F7FAFC",
                      borderRadius: 12,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                    onPress={showTimepicker}
                  >
                    <Ionicons
                      name="time-outline"
                      size={20}
                      color="#718096"
                      style={{ marginRight: 8 }}
                    />
                    <Text>
                      {time.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Schedule Button */}
              <TouchableOpacity
                style={{
                  backgroundColor: "#5E72E4",
                  padding: 16,
                  borderRadius: 12,
                  alignItems: "center",
                  marginTop: 20,
                  opacity: isScheduling ? 0.7 : 1,
                }}
                onPress={scheduleCall}
                disabled={isScheduling || !selectedApp || !contactInput.trim()}
              >
                {isScheduling ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text
                    style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
                  >
                    Schedule Call
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {/* Weekly Preferences Modal */}
        <Modal
          visible={showPreferencesModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPreferencesModal(false)}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.5)",
            }}
          >
            <View
              style={{
                backgroundColor: colors.surface,
                padding: 20,
                borderRadius: 10,
                width: "90%",
                maxHeight: "80%",
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  marginBottom: 20,
                  color: colors.text,
                  textAlign: "center",
                }}
              >
                Weekly Contact Preferences
              </Text>

              <ScrollView>
                {Object.entries(weeklyPreferences).map(([day, prefs]) => (
                  <View
                    key={day}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 15,
                      paddingBottom: 15,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: colors.text,
                        textTransform: "capitalize",
                      }}
                    >
                      {day}
                    </Text>
                    <View style={{ flexDirection: "row" }}>
                      <TouchableOpacity
                        style={{
                          padding: 8,
                          backgroundColor: prefs.calls
                            ? colors.primary
                            : colors.input,
                          borderRadius: 8,
                          marginRight: 10,
                        }}
                        onPress={() => {
                          const newPrefs = {
                            ...weeklyPreferences,
                            [day]: {
                              ...weeklyPreferences[
                                day as keyof WeeklyPreferences
                              ],
                              calls: !prefs.calls,
                            },
                          };
                          setWeeklyPreferences(newPrefs);
                        }}
                      >
                        <Text
                          style={{
                            color: prefs.calls
                              ? colors.buttonText
                              : colors.text,
                          }}
                        >
                          Calls
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          padding: 8,
                          backgroundColor: prefs.messages
                            ? colors.secondary
                            : colors.input,
                          borderRadius: 8,
                        }}
                        onPress={() => {
                          const newPrefs = {
                            ...weeklyPreferences,
                            [day]: {
                              ...weeklyPreferences[
                                day as keyof WeeklyPreferences
                              ],
                              messages: !prefs.messages,
                            },
                          };
                          setWeeklyPreferences(newPrefs);
                        }}
                      >
                        <Text
                          style={{
                            color: prefs.messages
                              ? colors.buttonText
                              : colors.text,
                          }}
                        >
                          Messages
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <TouchableOpacity
                  style={{
                    backgroundColor: colors.error,
                    padding: 12,
                    borderRadius: 8,
                    marginTop: 20,
                    flex: 1,
                    marginRight: 10,
                  }}
                  onPress={() => setShowPreferencesModal(false)}
                >
                  <Text
                    style={{
                      color: "white",
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    backgroundColor: colors.primary,
                    padding: 12,
                    borderRadius: 8,
                    marginTop: 20,
                    flex: 1,
                  }}
                  onPress={async () => {
                    await savePreferences(weeklyPreferences);
                    setShowPreferencesModal(false);
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    Save Preferences
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Drawer>
  );
}
