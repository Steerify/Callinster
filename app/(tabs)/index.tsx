import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import * as Contacts from "expo-contacts";
import * as Device from "expo-device";
import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Drawer } from "react-native-drawer-layout";
import CallinsterCarousel from "../../components/aboutCallinster";
import { COLORS } from "../../constants/theme";
import { styles } from "../../styles/feed.styles";
import Contact from "../components/Contact";
import Loader from "../components/Loader";
import { useSubscription } from "../components/Subsceiption";
import { ThemeSwitch } from "../components/ThemeSwitch";
import Carousel from "../components/homePageCarousel";
import { useTheme } from "../contexts/ThemeContext";

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

type DayPreference = { calls: boolean; messages: boolean };
type WeeklyPreferences = {
  [key in "monday"|"tuesday"|"wednesday"|"thursday"|"friday"|"saturday"|"sunday"]: DayPreference;
};

const callingApps: CallingApp[] = [
  { id: "phone", name: "Phone", icon: "call-outline" },
  { id: "whatsapp", name: "WhatsApp", icon: "logo-whatsapp" },
  { id: "messenger", name: "Messenger", icon: "logo-facebook", requiresUsername: true },
  { id: "telegram", name: "Telegram", icon: "paper-plane-outline" },
  { id: "skype", name: "Skype", icon: "logo-skype", requiresUsername: true },
  { id: "meet", name: "Google Meet", icon: "videocam-outline" },
  { id: "zoom", name: "Zoom", icon: "videocam-outline", requiresUsername: true },
  { id: "teams", name: "Microsoft Teams", icon: "people-outline", requiresUsername: true },
  { id: "discord", name: "Discord", icon: "game-controller-outline", requiresUsername: true },
  { id: "snapchat", name: "Snapchat", icon: "camera-outline", requiresUsername: true },
];

const cleanContact = (contact: string, isUsername: boolean): string => {
  if (isUsername) return contact.trim();
  let phone = contact.replace(/[^\d+]/g, "");
  if (!phone.startsWith("+")) {
    if (/^0\d{7,10}$/.test(phone)) phone = "+234" + phone.substring(1);
  }
  return phone;
};

const getFallbackLink = (appId: string, contact: string): string => {
  const cleaned = cleanContact(contact, callingApps.some(a => a.id === appId && a.requiresUsername));
  switch (appId) {
    case "whatsapp": return `https://wa.me/${cleaned.replace(/\+/g, "")}`;
    case "telegram": return `https://t.me/${cleaned.replace(/^@/, "")}`;
    case "skype": return `https://join.skype.com/invite/${cleaned}`;
    case "zoom": return `https://zoom.us/j/${encodeURIComponent(cleaned)}`;
    case "discord": return `https://discord.com/users/${cleaned}`;
    case "messenger": return `https://m.me/${cleaned}`;
    case "snapchat": return `https://snapchat.com/add/${cleaned}`;
    default: return getAppStoreLink(appId);
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

const getAppStoreLink = (appId: string): string => {
  const links: Record<string, string> = {
    whatsapp: Platform.OS === "ios" ? "https://apps.apple.com/app/whatsapp-messenger/id310633997" : "https://play.google.com/store/apps/details?id=com.whatsapp",
    messenger: Platform.OS === "ios" ? "https://apps.apple.com/app/facebook-messenger/id454638411" : "https://play.google.com/store/apps/details?id=com.facebook.orca",
    telegram: Platform.OS === "ios" ? "https://apps.apple.com/app/telegram-messenger/id686449807" : "https://play.google.com/store/apps/details?id=org.telegram.messenger",
    skype: Platform.OS === "ios" ? "https://apps.apple.com/app/skype/id304878510" : "https://play.google.com/store/apps/details?id=com.skype.raider",
    zoom: Platform.OS === "ios" ? "https://apps.apple.com/app/zoom-cloud-meetings/id546505307" : "https://play.google.com/store/apps/details?id=us.zoom.videomeetings",
  };
  return links[appId] || "https://www.google.com";
};

const formatDisplayDateTime = (date: Date): string =>
  date.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });

const formatAppName = (appId: string) => callingApps.find(a => a.id === appId)?.name || "Unknown App";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Avatar color palette based on first letter
const AVATAR_COLORS = [
  "#7c3aed","#091556","#1940bd","#0ea5e9","#10b981",
  "#f59e0b","#ef4444","#8b5cf6","#06b6d4","#ec4899",
];
function getAvatarColor(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

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
  const [contactPickerMode, setContactPickerMode] = useState<ContactPickerMode>("manual");
  const [contactSearchQuery, setContactSearchQuery] = useState("");
  const [filteredContacts, setFilteredContacts] = useState<MyContact[]>([]);
  const [weeklyPreferences, setWeeklyPreferences] = useState<WeeklyPreferences>({
    monday: { calls: true, messages: true },
    tuesday: { calls: true, messages: true },
    wednesday: { calls: true, messages: true },
    thursday: { calls: true, messages: true },
    friday: { calls: true, messages: true },
    saturday: { calls: true, messages: true },
    sunday: { calls: true, messages: true },
  });
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);

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
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      Alert.alert("Permission Required", "Please enable notifications to schedule calls");
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
        "To ensure notifications work reliably, please disable battery optimization for this app.",
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
      textColor: "#c090f1ff",
      icon: "information-circle",
      bgImage: require("../../assets/images/Callinsterlogo(2).jpg"),
    },
    {
      key: "quote1",
      title: "Inspiration",
      subtitle: "The best way to get started is to quit talking and begin doing. – Walt Disney",
      bgColor: "#f0eaff",
      textColor: "#7c3aed",
      icon: "bulb",
    },
    {
      key: "quote2",
      title: "Motivation",
      subtitle: "Success is not final, failure is not fatal: It is the courage to continue that counts. – Churchill",
      bgColor: "#eaf0ff",
      textColor: "#091556",
      icon: "rocket",
    },
  ];

  const initiateCall = useCallback(async (appId: string, contact: string) => {
    const app = callingApps.find(a => a.id === appId);
    if (!app) { Alert.alert("Error", "Selected calling app not found"); return; }
    const cleaned = cleanContact(contact, app.requiresUsername || false);
    if (!cleaned) { Alert.alert("Error", `Invalid ${app.requiresUsername ? "username" : "phone number"}`); return; }
    let url = "";
    switch (appId) {
      case "phone": url = `tel:${cleaned}`; break;
      case "whatsapp": url = `whatsapp://send?phone=${cleaned.replace("+", "")}`; break;
      case "messenger": url = `fb-messenger://user/${cleaned}`; break;
      case "telegram": url = `tg://resolve?domain=${cleaned.replace(/^@/, "")}`; break;
      case "skype": url = `skype:${cleaned}?call`; break;
      case "zoom": url = cleaned.match(/^\d+$/) ? `zoomus://zoom.us/join?confno=${cleaned}` : `zoomus://zoom.us/join?confname=${encodeURIComponent(cleaned)}`; break;
      case "teams": url = `msteams://teams.microsoft.com/l/call/0/0?users=${cleaned}`; break;
      case "discord": url = `discord://discord.com/users/${cleaned}`; break;
      case "snapchat": url = `snapchat://add/${cleaned}`; break;
      default: url = `tel:${cleaned}`;
    }
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) { await Linking.openURL(url); }
      else { throw new Error("App not installed"); }
    } catch (error) {
      const fallbackUrl = getFallbackLink(appId, cleaned);
      Alert.alert("Error", `${app.name} is not installed. Would you like to install it?`, [
        { text: "Cancel", style: "cancel" },
        { text: "Install App", onPress: () => Linking.openURL(fallbackUrl) },
      ]);
    }
  }, []);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(async response => {
      const data = response.notification.request.content.data as NotificationData;
      if (data.type === "scheduled-call") {
        await initiateCall(data.app, data.contact);
        const updatedCalls = scheduledCalls.filter(
          call => call.notificationId !== response.notification.request.identifier
        );
        setScheduledCalls(updatedCalls);
        await AsyncStorage.setItem("scheduledCalls", JSON.stringify(updatedCalls));
      }
    });
    return () => { subscription.remove(); };
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
        const savedPrefs = await AsyncStorage.getItem("weeklyPreferences");
        if (savedPrefs) setWeeklyPreferences(JSON.parse(savedPrefs));
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadData();
    const notifSub = Notifications.addNotificationReceivedListener(notification => {
      const data = notification.request.content.data as NotificationData;
      if (data.type === "scheduled-call") {
        Alert.alert(
          notification.request.content.title || "Call Time!",
          notification.request.content.body || "Time to make your scheduled call",
          [
            { text: "Later", style: "cancel" },
            { text: "Call Now", onPress: () => initiateCall(data.app, data.contact) },
          ]
        );
      }
    });
    return () => { notifSub.remove(); };
  }, [initiateCall]);

  // Load contacts and pick 5 (with 1-3 favorites included)
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === "granted") {
        const { data } = await Contacts.getContactsAsync({ fields: [Contacts.Fields.PhoneNumbers] });

        if (data.length === 0) {
          Alert.alert("No Contacts Found", "Please add contacts to your device.");
          setLoading(false);
          return;
        }

        const validContacts = data.filter(
          contact =>
            contact.phoneNumbers &&
            contact.phoneNumbers.length > 0 &&
            !avoidPrefixes.some(prefix =>
              contact.phoneNumbers?.some(p => p.number?.replace(/\s+/g, "").startsWith(prefix))
            ) &&
            contact.name &&
            !avoidNamePrefixes.some(prefix =>
              contact.name.trim().toLowerCase().startsWith(prefix.toLowerCase())
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

        const shuffled = [...mappedContacts].sort(() => 0.5 - Math.random());

        // Load stored favorites
        const storedFavs = await AsyncStorage.getItem("favoriteContacts");
        const favList: MyContact[] = storedFavs ? JSON.parse(storedFavs) : [];

        setFavoriteContacts(favList);
        setAllContacts(shuffled);

        // Build 5-contact display: 1-3 random favorites + fill rest with random contacts
        if (favList.length > 0) {
          const favCount = Math.min(3, Math.max(1, Math.floor(Math.random() * 3) + 1));
          const shuffledFavs = [...favList].sort(() => 0.5 - Math.random());
          const chosenFavs = shuffledFavs.slice(0, Math.min(favCount, favList.length));
          const favIds = new Set(chosenFavs.map(f => f.id));
          const remaining = shuffled.filter(c => !favIds.has(c.id)).slice(0, 5 - chosenFavs.length);
          setFiveContacts([...chosenFavs, ...remaining]);
        } else {
          setFiveContacts(shuffled.slice(0, 5));
        }
      } else {
        Alert.alert("Permission Denied", "Please grant contact access to view contacts.");
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
    if (!app) { Alert.alert("Error", "Invalid calling app selected"); return; }
    const permissionsGranted = await setupNotifications();
    if (!permissionsGranted) return;
    const callTime = getCombinedDateTime();
    const bufferTime = new Date(Date.now() + 60000);
    if (callTime <= bufferTime) {
      Alert.alert("Error", "Please select a future time (at least 1 minute from now)");
      return;
    }
    setIsScheduling(true);
    try {
      const cleanedContact = cleanContact(contactInput, app.requiresUsername || false);
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Time to call ${contactInput}`,
          body: `Scheduled call via ${app.name}`,
          data: { app: selectedApp, contact: cleanedContact, type: "scheduled-call" },
          sound: true,
        },
        trigger: { date: callTime, channelId: "call-notifications" },
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
      await AsyncStorage.setItem("scheduledCalls", JSON.stringify(updatedCalls));
      setCallModalVisible(false);
      Alert.alert("Success ✓", `Call scheduled for ${formatDisplayDateTime(callTime)}`);
    } catch (error) {
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
      await Notifications.cancelScheduledNotificationAsync(scheduledCall.notificationId);
      const updatedCalls = scheduledCalls.filter(call => call.id !== scheduledCall.id);
      setScheduledCalls(updatedCalls);
      await AsyncStorage.setItem("scheduledCalls", JSON.stringify(updatedCalls));
      Alert.alert("Cancelled", "Scheduled call removed");
    } catch (error) {
      Alert.alert("Error", "Failed to cancel scheduled call");
    }
  };

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || (mode === "date" ? date : time);
    if (Platform.OS === "android") { setShowDatePicker(false); setShowTimePicker(false); }
    if (event.type === "set") {
      if (mode === "date") setDate(currentDate);
      else setTime(currentDate);
    }
  };

  const showDatepicker = () => { setMode("date"); setShowDatePicker(true); };
  const showTimepicker = () => { setMode("time"); setShowTimePicker(true); };

  async function handleDelete(id: string): Promise<void> {
    let limit = 5;
    if (tier === "premium") limit = 10;
    if (tier === "elite") limit = Infinity;
    const deletesToday = await getCounter("deletes");
    if (deletesToday >= limit) { setShowSubModal(true); return; }
    await incrementCounter("deletes");
    setFiveContacts(prev => {
      const updated = prev.filter(contact => contact.id !== id);
      const remaining = allContacts.filter(c => !updated.some(fc => fc.id === c.id) && c.id !== id);
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
      setFilteredContacts(
        allContacts.filter(
          c => c.name.toLowerCase().includes(query.toLowerCase()) ||
            c.phoneNumbers?.some(p => p.number.includes(query))
        )
      );
    } else {
      setFilteredContacts([]);
    }
  };

  const savePreferences = async (newPreferences: WeeklyPreferences) => {
    try {
      await AsyncStorage.setItem("weeklyPreferences", JSON.stringify(newPreferences));
      setWeeklyPreferences(newPreferences);
    } catch (error) {
      Alert.alert("Error", "Failed to save preferences");
    }
  };

  const renderScheduledCall = ({ item }: { item: ScheduledCall }) => (
    <View style={localStyles.scheduledCallRow}>
      <View style={{ flex: 1 }}>
        <Text style={[localStyles.scheduledCallName, { color: colors.text }]}>{item.contact}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{formatAppName(item.app)}</Text>
        <Text style={{ color: colors.subtext, fontSize: 12 }}>{formatDisplayDateTime(new Date(item.time))}</Text>
      </View>
      <TouchableOpacity onPress={() => cancelScheduledCall(item)} style={localStyles.cancelCallBtn}>
        <Ionicons name="close-circle" size={24} color="#F44336" />
      </TouchableOpacity>
    </View>
  );

  return (
    <Drawer
      open={drawerOpen}
      onOpen={() => setDrawerOpen(true)}
      onClose={() => setDrawerOpen(false)}
      renderDrawerContent={() => (
        <View style={[localStyles.drawer, { backgroundColor: colors.surface }]}>
          {/* Drawer Header */}
          <View style={[localStyles.drawerHeader, { backgroundColor: colors.primary }]}>
            <Image
              source={require("../../assets/images/dashboardLogo.png")}
              style={localStyles.drawerLogo}
              resizeMode="contain"
            />
            <ThemeSwitch />
          </View>

          <Text style={[localStyles.drawerSectionLabel, { color: colors.subtext }]}>TOOLS</Text>

          <TouchableOpacity
            style={[localStyles.drawerItem, { backgroundColor: colors.card }]}
            onPress={() => { setDrawerOpen(false); setCallModalVisible(true); }}
          >
            <View style={[localStyles.drawerItemIcon, { backgroundColor: "#e8eaff" }]}>
              <Ionicons name="alarm-outline" size={20} color={colors.primary} />
            </View>
            <Text style={[localStyles.drawerItemText, { color: colors.text }]}>Schedule a Call</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.subtext} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[localStyles.drawerItem, { backgroundColor: colors.card }]}
            onPress={() => { setDrawerOpen(false); setModalVisible(true); }}
          >
            <View style={[localStyles.drawerItemIcon, { backgroundColor: "#ffe8ed" }]}>
              <Ionicons name="filter-outline" size={20} color={COLORS.heart} />
            </View>
            <Text style={[localStyles.drawerItemText, { color: colors.text }]}>Avoid Prefixes</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.subtext} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[localStyles.drawerItem, { backgroundColor: colors.card }]}
            onPress={() => { setDrawerOpen(false); setShowPreferencesModal(true); }}
          >
            <View style={[localStyles.drawerItemIcon, { backgroundColor: "#e8f5e9" }]}>
              <Ionicons name="calendar-outline" size={20} color="#2e7d32" />
            </View>
            <Text style={[localStyles.drawerItemText, { color: colors.text }]}>Weekly Preferences</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.subtext} />
          </TouchableOpacity>

          {scheduledCalls.length > 0 && (
            <View style={{ marginTop: 24 }}>
              <Text style={[localStyles.drawerSectionLabel, { color: colors.subtext }]}>UPCOMING CALLS</Text>
              <FlatList
                data={scheduledCalls}
                keyExtractor={item => item.id}
                renderItem={renderScheduledCall}
                style={{ maxHeight: 260 }}
              />
            </View>
          )}
        </View>
      )}
    >
      <View style={[styles.container, { backgroundColor: colors.background, flex: 1 }]}>
        {/* Header */}
        <SafeAreaView style={[localStyles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <TouchableOpacity onPress={() => setDrawerOpen(true)} style={localStyles.menuBtn}>
              <Ionicons name="menu" size={26} color={colors.primary} />
            </TouchableOpacity>
            <Image
              source={require("../../assets/images/icon.png")}
              style={{ width: 24, height: 24, resizeMode: "contain", marginRight: 8 }}
            />
            <Text style={[localStyles.headerTitle, { color: colors.text }]}>Callinster</Text>
          </View>
          {(tier === "premium" || tier === "elite") && (
            <View style={[localStyles.searchBar, { backgroundColor: colors.input, borderColor: colors.border }]}>
              <Ionicons name="search-outline" size={16} color={colors.placeholder} style={{ marginRight: 6 }} />
              <TextInput
                placeholder="Search contacts..."
                placeholderTextColor={colors.placeholder}
                style={{ flex: 1, color: colors.text2, fontSize: 14 }}
                onChangeText={text => {
                  setSearchQuery(text);
                  setSearching(true);
                  if (text.trim()) {
                    if (searchTimeout.current) clearTimeout(searchTimeout.current);
                    searchTimeout.current = setTimeout(() => setSearching(false), 300);
                  } else {
                    setSearching(false);
                  }
                }}
                value={searchQuery}
              />
            </View>
          )}
          <TouchableOpacity style={localStyles.scheduleBell} onPress={() => setCallModalVisible(true)}>
            <Ionicons name="alarm-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        </SafeAreaView>

        <ScrollView style={{ flex: 1, marginBottom: Platform.OS === "android" ? 62 : 80 }} showsVerticalScrollIndicator={false}>
          {!loading && <Carousel data={homeCarouselData} />}
          <CallinsterCarousel visible={callinsterModalVisible} onClose={() => setCallinsterModalVisible(false)} />

          {/* Avoid Prefixes Modal */}
          <Modal visible={modalVisible} transparent animationType="slide">
            <View style={[localStyles.modalOverlay, { backgroundColor: colors.overlay }]}>
              <View style={[localStyles.modalCard, { backgroundColor: colors.surface }]}>
                <View style={localStyles.modalHeader}>
                  <Text style={[localStyles.modalTitle, { color: colors.text }]}>Avoid Prefixes</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color={colors.subtext} />
                  </TouchableOpacity>
                </View>

                <Text style={[localStyles.sectionLabel, { color: colors.textSecondary }]}>Number prefixes (e.g. 080, +234)</Text>
                <View style={localStyles.inputRow}>
                  <TextInput
                    placeholder="Enter prefix..."
                    placeholderTextColor={colors.placeholder}
                    style={[localStyles.prefixInput, { borderColor: colors.border, backgroundColor: colors.input, color: colors.text2 }]}
                    value={inputPrefix}
                    onChangeText={setInputPrefix}
                  />
                  <TouchableOpacity
                    style={[localStyles.addBtn, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      if (inputPrefix.trim() && !avoidPrefixes.includes(inputPrefix.trim())) {
                        const newPrefixes = [...avoidPrefixes, inputPrefix.trim()];
                        setAvoidPrefixes(newPrefixes);
                        AsyncStorage.setItem("avoidPrefixes", JSON.stringify(newPrefixes));
                        setInputPrefix("");
                      }
                    }}
                  >
                    <Ionicons name="add" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
                <View style={{ marginBottom: 12 }}>
                  {avoidPrefixes.map((prefix, idx) => (
                    <View key={idx} style={localStyles.tagRow}>
                      <Text style={[localStyles.tagText, { color: colors.text }]}>{prefix}</Text>
                      <TouchableOpacity onPress={() => {
                        const updated = avoidPrefixes.filter(p => p !== prefix);
                        setAvoidPrefixes(updated);
                        AsyncStorage.setItem("avoidPrefixes", JSON.stringify(updated));
                      }}>
                        <Ionicons name="close-circle" size={18} color={COLORS.heart} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>

                <Text style={[localStyles.sectionLabel, { color: colors.textSecondary }]}>Name prefixes (e.g. KC, Cashflow)</Text>
                <View style={localStyles.inputRow}>
                  <TextInput
                    placeholder="Enter name prefix..."
                    placeholderTextColor={colors.placeholder}
                    style={[localStyles.prefixInput, { borderColor: colors.border, backgroundColor: colors.input, color: colors.text2 }]}
                    value={inputNamePrefix}
                    onChangeText={setInputNamePrefix}
                  />
                  <TouchableOpacity
                    style={[localStyles.addBtn, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      if (inputNamePrefix.trim() && !avoidNamePrefixes.includes(inputNamePrefix.trim())) {
                        const newPrefixes = [...avoidNamePrefixes, inputNamePrefix.trim()];
                        setAvoidNamePrefixes(newPrefixes);
                        AsyncStorage.setItem("avoidNamePrefixes", JSON.stringify(newPrefixes));
                        setInputNamePrefix("");
                      }
                    }}
                  >
                    <Ionicons name="add" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
                <View style={{ marginBottom: 16 }}>
                  {avoidNamePrefixes.map((prefix, idx) => (
                    <View key={idx} style={localStyles.tagRow}>
                      <Text style={[localStyles.tagText, { color: colors.text }]}>{prefix}</Text>
                      <TouchableOpacity onPress={() => {
                        const updated = avoidNamePrefixes.filter(p => p !== prefix);
                        setAvoidNamePrefixes(updated);
                        AsyncStorage.setItem("avoidNamePrefixes", JSON.stringify(updated));
                      }}>
                        <Ionicons name="close-circle" size={18} color={COLORS.heart} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>

                <TouchableOpacity style={[localStyles.doneBtn, { backgroundColor: colors.primary }]} onPress={() => setModalVisible(false)}>
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Upgrade Modal */}
          <Modal visible={showSubModal} transparent animationType="slide">
            <View style={[localStyles.modalOverlay, { backgroundColor: colors.overlay }]}>
              <View style={[localStyles.upgradeCard, { backgroundColor: colors.surface }]}>
                <Text style={[localStyles.upgradeTitle, { color: colors.primary }]}>Daily Limit Reached</Text>
                <Text style={{ color: colors.textSecondary, marginBottom: 20, textAlign: "center" }}>
                  You've reached your daily delete limit. Upgrade for more!
                </Text>
                <TouchableOpacity
                  style={[localStyles.upgradePrimaryBtn, { backgroundColor: colors.primary }]}
                  onPress={() => { setShowSubModal(false); setShowPlanDetails(true); }}
                >
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>See Plans</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={localStyles.upgradeSecondaryBtn}
                  onPress={() => setShowSubModal(false)}
                >
                  <Text style={{ color: colors.subtext, fontWeight: "600" }}>Maybe Later</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Plan Details Modal */}
          <Modal visible={showPlanDetails} transparent animationType="fade">
            <View style={[localStyles.modalOverlay, { backgroundColor: colors.overlay }]}>
              <View style={[localStyles.planCard, { backgroundColor: colors.surface }]}>
                <View style={localStyles.modalHeader}>
                  <Text style={[localStyles.modalTitle, { color: colors.text }]}>Subscription Plans</Text>
                  <TouchableOpacity onPress={() => setShowPlanDetails(false)}>
                    <Ionicons name="close" size={24} color={colors.subtext} />
                  </TouchableOpacity>
                </View>

                {/* Basic */}
                <View style={[localStyles.planTier, { borderColor: colors.border }]}>
                  <Text style={[localStyles.planName, { color: colors.subtext }]}>Basic</Text>
                  <Text style={[localStyles.planPrice, { color: colors.subtext }]}>Free</Text>
                  {["View 5 contacts daily","Avoid prefixes","5 deletes/day"].map(f => (
                    <View key={f} style={localStyles.planFeatureRow}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                      <Text style={[localStyles.planFeature, { color: colors.textSecondary }]}>{f}</Text>
                    </View>
                  ))}
                </View>

                {/* Premium */}
                <View style={[localStyles.planTier, { borderColor: colors.primary, borderWidth: 2 }]}>
                  <Text style={[localStyles.planName, { color: colors.primary }]}>Premium</Text>
                  <View style={localStyles.popularBadge}>
                    <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>POPULAR</Text>
                  </View>
                  {["Extended contact list","10 deletes/day","Advanced search","Avoid prefixes"].map(f => (
                    <View key={f} style={localStyles.planFeatureRow}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                      <Text style={[localStyles.planFeature, { color: colors.textSecondary }]}>{f}</Text>
                    </View>
                  ))}
                  <TouchableOpacity style={[localStyles.planBtn, { backgroundColor: colors.primary }]}>
                    <Text style={{ color: "#fff", fontWeight: "700" }}>Upgrade to Premium</Text>
                  </TouchableOpacity>
                </View>

                {/* Elite */}
                <View style={[localStyles.planTier, { borderColor: COLORS.gold, borderWidth: 2, backgroundColor: "#fffbea" }]}>
                  <Text style={[localStyles.planName, { color: "#b45309" }]}>Elite ⭐</Text>
                  {["Unlimited contacts","Unlimited deletes","Favorites feature","No ads","Advanced search"].map(f => (
                    <View key={f} style={localStyles.planFeatureRow}>
                      <Ionicons name="checkmark-circle" size={16} color="#b45309" />
                      <Text style={[localStyles.planFeature, { color: "#78350f" }]}>{f}</Text>
                    </View>
                  ))}
                  <TouchableOpacity style={[localStyles.planBtn, { backgroundColor: "#b45309" }]}>
                    <Text style={{ color: "#fff", fontWeight: "700" }}>Upgrade to Elite</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Contact List */}
          {loading && !searchQuery.trim() ? (
            <Loader size="large" style={{ flex: 1, backgroundColor: colors.background }} />
          ) : searching ? (
            <Loader size="large" style={{ flex: 1, backgroundColor: colors.background }} />
          ) : (
            <View style={{ paddingHorizontal: 4 }}>
              {(searchQuery.trim() ? allContacts : fiveContacts)
                .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(contact => (
                  <Contact
                    key={contact.id}
                    contact={contact}
                    onDelete={() => { void handleDelete(contact.id); }}
                    showHeart={tier === "elite"}
                    weeklyPreferences={weeklyPreferences}
                  />
                ))}
            </View>
          )}
        </ScrollView>

        {/* Schedule Call Bottom Sheet Modal */}
        <Modal animationType="slide" transparent={true} visible={callModalVisible} onRequestClose={() => setCallModalVisible(false)}>
          <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" }}>
            <View style={[localStyles.callModal, { backgroundColor: colors.surface }]}>
              <View style={localStyles.modalHeader}>
                <Text style={[localStyles.modalTitle, { color: colors.text }]}>Schedule a Call</Text>
                <TouchableOpacity onPress={() => setCallModalVisible(false)} style={localStyles.closeBtn}>
                  <Ionicons name="close" size={24} color={colors.subtext} />
                </TouchableOpacity>
              </View>
              <View style={localStyles.sheetHandle} />

              <Text style={[localStyles.sectionLabel, { color: colors.textSecondary, marginTop: 8 }]}>Choose App</Text>
              <FlatList
                data={callingApps}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 16 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[localStyles.appChip, { backgroundColor: selectedApp === item.id ? colors.primary : colors.card, borderColor: selectedApp === item.id ? colors.primary : colors.border }]}
                    onPress={() => { setSelectedApp(item.id); setContactInput(""); }}
                  >
                    <Ionicons name={item.icon} size={20} color={selectedApp === item.id ? "#fff" : colors.textSecondary} />
                    <Text style={[localStyles.appChipText, { color: selectedApp === item.id ? "#fff" : colors.textSecondary }]}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />

              <Text style={[localStyles.sectionLabel, { color: colors.textSecondary }]}>Contact Details</Text>
              <View style={{ flexDirection: "row", marginBottom: 12 }}>
                {(["manual", "contacts"] as ContactPickerMode[]).map(m => (
                  <TouchableOpacity
                    key={m}
                    style={[localStyles.modeTab, { backgroundColor: contactPickerMode === m ? colors.primary : colors.card, borderColor: colors.border }]}
                    onPress={() => setContactPickerMode(m)}
                  >
                    <Text style={{ color: contactPickerMode === m ? "#fff" : colors.textSecondary, fontWeight: "600", fontSize: 13 }}>
                      {m === "manual" ? "Manual Input" : "Pick Contact"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {contactPickerMode === "manual" ? (
                <TextInput
                  style={[localStyles.contactInput, { borderColor: colors.border, backgroundColor: colors.input, color: colors.text2 }]}
                  onChangeText={setContactInput}
                  value={contactInput}
                  placeholder={selectedApp && callingApps.find(a => a.id === selectedApp)?.requiresUsername ? "Enter username or ID" : "Enter phone number"}
                  placeholderTextColor={colors.placeholder}
                  keyboardType={selectedApp && callingApps.find(a => a.id === selectedApp)?.requiresUsername ? "default" : "phone-pad"}
                />
              ) : (
                <View>
                  <TextInput
                    style={[localStyles.contactInput, { borderColor: colors.border, backgroundColor: colors.input, color: colors.text2 }]}
                    onChangeText={handleContactSearch}
                    value={contactSearchQuery}
                    placeholder="Search contacts..."
                    placeholderTextColor={colors.placeholder}
                  />
                  {contactSearchQuery.trim() && (
                    <ScrollView style={[localStyles.contactDropdown, { borderColor: colors.border }]} showsVerticalScrollIndicator={false}>
                      {filteredContacts.map(contact => (
                        <TouchableOpacity
                          key={contact.id}
                          style={[localStyles.contactDropdownItem, { borderBottomColor: colors.divider }]}
                          onPress={() => { setContactInput(contact.phoneNumbers?.[0]?.number || ""); setContactSearchQuery(""); setContactPickerMode("manual"); }}
                        >
                          <View style={[localStyles.miniAvatar, { backgroundColor: getAvatarColor(contact.name) }]}>
                            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>{contact.name.charAt(0).toUpperCase()}</Text>
                          </View>
                          <View>
                            <Text style={{ color: colors.text, fontWeight: "500" }}>{contact.name}</Text>
                            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{contact.phoneNumbers?.[0]?.number}</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>
              )}

              <Text style={[localStyles.sectionLabel, { color: colors.textSecondary, marginTop: 12 }]}>Schedule Time</Text>
              {showDatePicker && <DateTimePicker testID="datePicker" value={date} mode="date" is24Hour={true} display="default" onChange={onChangeDate} minimumDate={new Date()} />}
              {showTimePicker && <DateTimePicker testID="timePicker" value={time} mode="time" is24Hour={false} display="default" onChange={onChangeDate} />}
              <View style={{ flexDirection: "row", marginBottom: 16 }}>
                <TouchableOpacity style={[localStyles.timeBtn, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={showDatepicker}>
                  <Ionicons name="calendar-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text style={{ color: colors.text }}>{date.toLocaleDateString()}</Text>
                </TouchableOpacity>
                <View style={{ width: 10 }} />
                <TouchableOpacity style={[localStyles.timeBtn, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={showTimepicker}>
                  <Ionicons name="time-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text style={{ color: colors.text }}>{time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[localStyles.scheduleBtn, { backgroundColor: colors.primary, opacity: (isScheduling || !selectedApp || !contactInput.trim()) ? 0.6 : 1 }]}
                onPress={scheduleCall}
                disabled={isScheduling || !selectedApp || !contactInput.trim()}
              >
                {isScheduling ? <ActivityIndicator color="white" /> : (
                  <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>Schedule Call</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Weekly Preferences Modal */}
        <Modal visible={showPreferencesModal} transparent animationType="slide" onRequestClose={() => setShowPreferencesModal(false)}>
          <View style={[localStyles.modalOverlay, { backgroundColor: colors.overlay }]}>
            <View style={[localStyles.modalCard, { backgroundColor: colors.surface }]}>
              <View style={localStyles.modalHeader}>
                <Text style={[localStyles.modalTitle, { color: colors.text }]}>Weekly Preferences</Text>
                <TouchableOpacity onPress={() => setShowPreferencesModal(false)}>
                  <Ionicons name="close" size={24} color={colors.subtext} />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {Object.entries(weeklyPreferences).map(([day, prefs]) => (
                  <View key={day} style={[localStyles.prefRow, { borderBottomColor: colors.divider }]}>
                    <Text style={[localStyles.dayText, { color: colors.text }]}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <TouchableOpacity
                        style={[localStyles.prefChip, { backgroundColor: prefs.calls ? colors.primary : colors.card, borderColor: colors.border }]}
                        onPress={() => {
                          const updated = { ...weeklyPreferences, [day]: { ...weeklyPreferences[day as keyof WeeklyPreferences], calls: !prefs.calls } };
                          setWeeklyPreferences(updated);
                        }}
                      >
                        <Ionicons name="call-outline" size={14} color={prefs.calls ? "#fff" : colors.textSecondary} />
                        <Text style={{ color: prefs.calls ? "#fff" : colors.textSecondary, fontSize: 12, marginLeft: 4 }}>Calls</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[localStyles.prefChip, { backgroundColor: prefs.messages ? colors.secondary : colors.card, borderColor: colors.border }]}
                        onPress={() => {
                          const updated = { ...weeklyPreferences, [day]: { ...weeklyPreferences[day as keyof WeeklyPreferences], messages: !prefs.messages } };
                          setWeeklyPreferences(updated);
                        }}
                      >
                        <Ionicons name="chatbubble-outline" size={14} color={prefs.messages ? "#fff" : colors.textSecondary} />
                        <Text style={{ color: prefs.messages ? "#fff" : colors.textSecondary, fontSize: 12, marginLeft: 4 }}>Msg</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
              <View style={{ flexDirection: "row", marginTop: 16, gap: 10 }}>
                <TouchableOpacity style={[localStyles.cancelPrefsBtn, { borderColor: colors.border }]} onPress={() => setShowPreferencesModal(false)}>
                  <Text style={{ color: colors.textSecondary, fontWeight: "600" }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[localStyles.savePrefsBtn, { backgroundColor: colors.primary }]}
                  onPress={async () => { await savePreferences(weeklyPreferences); setShowPreferencesModal(false); }}
                >
                  <Text style={{ color: "#fff", fontWeight: "700" }}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Drawer>
  );
}

const localStyles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  menuBtn: { marginRight: 8, padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "700", fontFamily: "JetBrainsMono-Medium", flex: 1 },
  searchBar: { flexDirection: "row", alignItems: "center", flex: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, marginRight: 8 },
  scheduleBell: { padding: 6 },
  drawer: { flex: 1, paddingBottom: 20 },
  drawerHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 20, paddingTop: 50, marginBottom: 16 },
  drawerLogo: { width: 110, height: 48 },
  drawerSectionLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1.2, paddingHorizontal: 16, marginBottom: 8, marginTop: 4 },
  drawerItem: { flexDirection: "row", alignItems: "center", marginHorizontal: 12, marginBottom: 8, borderRadius: 12, padding: 14 },
  drawerItemIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", marginRight: 12 },
  drawerItemText: { flex: 1, fontSize: 15, fontWeight: "600" },
  scheduledCallRow: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 10 },
  scheduledCallName: { fontSize: 14, fontWeight: "600" },
  cancelCallBtn: { padding: 4 },
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalCard: { width: "92%", borderRadius: 20, padding: 20, maxHeight: "85%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: "700" },
  sectionLabel: { fontSize: 12, fontWeight: "600", letterSpacing: 0.5, marginBottom: 8, textTransform: "uppercase" },
  inputRow: { flexDirection: "row", marginBottom: 10 },
  prefixInput: { flex: 1, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 15, marginRight: 8 },
  addBtn: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  tagRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, marginBottom: 4, backgroundColor: "rgba(124,58,237,0.07)" },
  tagText: { fontSize: 14, fontWeight: "500" },
  doneBtn: { borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  upgradeCard: { width: "88%", borderRadius: 20, padding: 24, alignItems: "center", alignSelf: "center" },
  upgradeTitle: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  upgradePrimaryBtn: { width: "100%", borderRadius: 12, paddingVertical: 14, alignItems: "center", marginBottom: 10 },
  upgradeSecondaryBtn: { paddingVertical: 10, alignItems: "center" },
  planCard: { width: "95%", borderRadius: 20, padding: 20, maxHeight: "90%" },
  planTier: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 12 },
  planName: { fontSize: 16, fontWeight: "700", marginBottom: 2 },
  planPrice: { fontSize: 12, marginBottom: 8 },
  planFeatureRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  planFeature: { fontSize: 13, marginLeft: 6 },
  planBtn: { borderRadius: 8, paddingVertical: 10, alignItems: "center", marginTop: 10 },
  popularBadge: { backgroundColor: "#091556", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, alignSelf: "flex-start", marginBottom: 6 },
  callModal: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, maxHeight: "90%" },
  sheetHandle: { width: 40, height: 4, backgroundColor: "#E2E8F0", borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  closeBtn: { padding: 4 },
  appChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  appChipText: { fontSize: 12, fontWeight: "500", marginLeft: 6 },
  modeTab: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, alignItems: "center", marginRight: 8 },
  contactInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, marginBottom: 8 },
  contactDropdown: { maxHeight: 180, borderWidth: 1, borderRadius: 12, marginBottom: 8 },
  contactDropdownItem: { flexDirection: "row", alignItems: "center", padding: 10, borderBottomWidth: 1 },
  miniAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", marginRight: 10 },
  timeBtn: { flex: 1, flexDirection: "row", alignItems: "center", padding: 12, borderWidth: 1, borderRadius: 12 },
  scheduleBtn: { borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  prefRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1 },
  dayText: { fontSize: 15, fontWeight: "600", textTransform: "capitalize" },
  prefChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  cancelPrefsBtn: { flex: 1, borderWidth: 1, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  savePrefsBtn: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
});
