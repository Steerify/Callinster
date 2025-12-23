import { COLORS } from "../../constants/theme";
import {
  Entypo,
  Feather,
  FontAwesome,
  FontAwesome5,
  Ionicons,
} from "@expo/vector-icons";

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import * as React from "react";
import { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  LayoutAnimation,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";

type MyContact = {
  id: string | number;
  name: string;
  phoneNumbers?: { number: string }[];
  facebookUsername?: string;
  instagramUsername?: string;
  snapchatUsername?: string;
  tiktokUsername?: string;
  youtubeUsername?: string;
  linkedinUsername?: string;
};

type DayPreference = {
  calls: boolean;
  messages: boolean;
};

type WeeklyPreferences = {
  monday: DayPreference;
  tuesday: DayPreference;
  wednesday: DayPreference;
  thursday: DayPreference;
  friday: DayPreference;
  saturday: DayPreference;
  sunday: DayPreference;
};
interface ContactProps {
  contact: MyContact;
  onDelete: () => void;
  showHeart?: boolean;
  onFavorite?: (contact: MyContact) => void;
  weeklyPreferences: WeeklyPreferences;
}

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  Call: (
    <Ionicons
      name="call"
      size={20}
      color="#48BB78"
      style={{ marginRight: 10 }}
    />
  ),
  WhatsApp: (
    <FontAwesome
      name="whatsapp"
      size={20}
      color="#25D366"
      style={{ marginRight: 10 }}
    />
  ),
  Telegram: (
    <FontAwesome
      name="telegram"
      size={20}
      color="#229ED9"
      style={{ marginRight: 10 }}
    />
  ),
  Facebook: (
    <FontAwesome
      name="facebook"
      size={20}
      color="#1877F3"
      style={{ marginRight: 10 }}
    />
  ),
  Instagram: (
    <Entypo
      name="instagram"
      size={20}
      color="#C13584"
      style={{ marginRight: 10 }}
    />
  ),
  Snapchat: (
    <FontAwesome5
      name="snapchat-ghost"
      size={20}
      color="#FFFC00"
      style={{ marginRight: 10 }}
    />
  ),
  TikTok: (
    <FontAwesome5
      name="tiktok"
      size={20}
      color={COLORS.grey}
      style={{ marginRight: 10 }}
    />
  ),
  YouTube: (
    <Feather
      name="youtube"
      size={20}
      color="#FF0000"
      style={{ marginRight: 10 }}
    />
  ),
  LinkedIn: (
    <Feather
      name="linkedin"
      size={20}
      color="#0077B5"
      style={{ marginRight: 10 }}
    />
  ),
};

function sanitizeUsername(username: string) {
  return username.replace(/[^a-zA-Z0-9._-]/g, "");
}

export default function Contact({
  contact,
  onDelete,
  showHeart = false,
  onFavorite,
  weeklyPreferences,
}: ContactProps) {
  const { colors } = useTheme();
  const [isFavorite, setIsFavorite] = useState(false);
  const [connectModalVisible, setConnectModalVisible] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [heightAnim] = useState(new Animated.Value(0));
  const [editUsernameModal, setEditUsernameModal] = useState<null | {
    platform: string;
    field: string;
  }>(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const today = days[new Date().getDay()];
  const todayPrefs = weeklyPreferences[today as keyof WeeklyPreferences];
  const getCurrentDayPreferences = () => {
    const day = new Date()
      .toLocaleDateString("en-US", {
        weekday: "long",
      })
      .toLowerCase() as keyof WeeklyPreferences;
    return weeklyPreferences?.[day] || { calls: true, messages: true };
  };

  const openSocialMedia = async (platform: string, phoneNumber: string) => {
    const dayPrefs = getCurrentDayPreferences();
    const isCallPlatform = platform === "Call" || platform === "phone";

    if (isCallPlatform && !dayPrefs.calls) {
      Alert.alert("Not Allowed", "Calls are not allowed for today");
      return;
    }

    if (!isCallPlatform && !dayPrefs.messages) {
      Alert.alert("Not Allowed", "Messages are not allowed for today");
      return;
    }

    const number = phoneNumber.replace(/\D/g, "");
    let url = "";

    switch (platform) {
      case "Call":
        url = `tel:${number}`;
        break;
      case "WhatsApp":
        url = `https://wa.me/${formatPhoneNumber(phoneNumber)}`;
        break;
      case "Telegram":
        url = `https://t.me/${formatPhoneNumber(phoneNumber)}`;
        break;
      case "Facebook":
        if (contact.facebookUsername) {
          url = `fb://profile/${sanitizeUsername(contact.facebookUsername)}`;
        } else {
          setEditUsernameModal({
            platform: "Facebook",
            field: "facebookUsername",
          });
          return;
        }
        break;
      case "Instagram":
        if (contact.instagramUsername) {
          url = `instagram://user?username=${sanitizeUsername(
            contact.instagramUsername
          )}`;
        } else {
          setEditUsernameModal({
            platform: "Instagram",
            field: "instagramUsername",
          });
          return;
        }
        break;
      case "Snapchat":
        if (contact.snapchatUsername) {
          url = `snapchat://add/${sanitizeUsername(contact.snapchatUsername)}`;
        } else {
          setEditUsernameModal({
            platform: "Snapchat",
            field: "snapchatUsername",
          });
          return;
        }
        break;
      case "TikTok":
        if (contact.tiktokUsername) {
          url = `https://www.tiktok.com/@${sanitizeUsername(
            contact.tiktokUsername
          )}`;
        } else {
          setEditUsernameModal({
            platform: "TikTok",
            field: "tiktokUsername",
          });
          return;
        }
        break;
      case "YouTube":
        if (contact.youtubeUsername) {
          url = `https://www.youtube.com/${sanitizeUsername(
            contact.youtubeUsername
          )}`;
        } else {
          setEditUsernameModal({
            platform: "YouTube",
            field: "youtubeUsername",
          });
          return;
        }
        break;
      case "LinkedIn":
        if (contact.linkedinUsername) {
          url = `https://www.linkedin.com/in/${sanitizeUsername(
            contact.linkedinUsername
          )}`;
        } else {
          setEditUsernameModal({
            platform: "LinkedIn",
            field: "linkedinUsername",
          });
          return;
        }
        break;
      default:
        return;
    }
    Linking.openURL(url);
    setConnectModalVisible(false);
  };

  useEffect(() => {
    if (showHeart) {
      AsyncStorage.getItem("favoriteContacts").then(data => {
        if (data) {
          const favs = JSON.parse(data) as { id: string | number }[];
          setIsFavorite(favs.some(fav => fav.id === contact.id));
        }
      });
    }

    const loadUsernames = async () => {
      const key = `usernames_${contact.id}`;
      const saved = await AsyncStorage.getItem(key);
      if (saved) {
        const usernames = JSON.parse(saved);
        Object.assign(contact, usernames);
      }
    };
    loadUsernames();
  }, [contact, contact.id, showHeart]);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const handleFavorite = async () => {
    const data = await AsyncStorage.getItem("favoriteContacts");
    let favs: any[] = data ? JSON.parse(data) : [];
    if (isFavorite) {
      favs = favs.filter(fav => fav.id !== contact.id);
    } else {
      favs.push(contact);
    }
    await AsyncStorage.setItem("favoriteContacts", JSON.stringify(favs));
    setIsFavorite(!isFavorite);
    if (onFavorite) onFavorite(contact);
  };

  function formatPhoneNumber(number: string) {
    let num = number.replace(/\D/g, "");
    if (num.startsWith("0")) {
      num = "+234" + num.slice(1);
    } else if (!num.startsWith("+")) {
      num = "+" + num;
    }
    return num;
  }

  const handleSaveUsername = async () => {
    if (!editUsernameModal) return;

    // Clear previous error
    setUsernameError("");

    // Basic validation
    if (!usernameInput.trim()) {
      setUsernameError("Username cannot be empty");
      return;
    }

    // Platform-specific validation
    switch (editUsernameModal.platform) {
      case "Instagram":
        if (!/^[\w.](?!.*?\.{2})[\w.]{1,28}[\w]$/.test(usernameInput)) {
          setUsernameError("Invalid Instagram username format");
          return;
        }
        break;
      case "Twitter":
        if (!/^[A-Za-z0-9_]{1,15}$/.test(usernameInput)) {
          setUsernameError("Invalid Twitter username format");
          return;
        }
        break;
      // Add other platform-specific validations as needed
    }

    const sanitized = sanitizeUsername(usernameInput.trim());
    (contact as any)[editUsernameModal.field] = sanitized;

    const key = `usernames_${contact.id}`;
    const saved = await AsyncStorage.getItem(key);
    const usernames = saved ? JSON.parse(saved) : {};
    usernames[editUsernameModal.field] = sanitized;
    await AsyncStorage.setItem(key, JSON.stringify(usernames));

    setEditUsernameModal(null);
    setUsernameInput("");

    Alert.alert(
      "Success",
      `${editUsernameModal.platform} username ${
        usernames[editUsernameModal.field] ? "updated" : "saved"
      } successfully`
    );

    setTimeout(() => {
      if (selectedNumber) {
        openSocialMedia(editUsernameModal.platform, selectedNumber);
      }
    }, 300);
  };

  // Update the Username Edit Modal to show error message
  const handleEditUsername = async () => {
    if (!editUsernameModal) return;

    const existingUsername = (contact as any)[editUsernameModal.field];
    if (existingUsername && !usernameInput.trim()) {
      Alert.alert(
        "Delete Username",
        `Are you sure you want to delete the ${editUsernameModal.platform} username?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              // Remove the username
              (contact as any)[editUsernameModal.field] = "";

              // Update storage
              const key = `usernames_${contact.id}`;
              const saved = await AsyncStorage.getItem(key);
              const usernames = saved ? JSON.parse(saved) : {};
              delete usernames[editUsernameModal.field];
              await AsyncStorage.setItem(key, JSON.stringify(usernames));

              setEditUsernameModal(null);
              setUsernameInput("");

              Alert.alert(
                "Success",
                `${editUsernameModal.platform} username removed`
              );
            },
          },
        ]
      );
      return;
    }

    handleSaveUsername();
  };

  const { surface, background, text } = colors;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={toggleExpand}
      style={{
        backgroundColor: surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: colors.textSecondary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* Main contact info */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: expanded ? 12 : 0,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.background,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#3c1e90" }}>
            {contact.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>
            {contact.name}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {showHeart && (
            <TouchableOpacity
              onPress={handleFavorite}
              style={{ marginRight: 8 }}
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={22}
                color={isFavorite ? "#FF4D4F" : "#7B8AAB"}
              />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity onPress={onDelete}>
              <Ionicons name="trash-outline" size={18} color="#F44336" />
            </TouchableOpacity>
          )}
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="#7B8AAB"
            style={{ marginLeft: 8 }}
          />
        </View>
      </View>

      {/* Phone numbers with Connect button - Animated */}
      {expanded && (
        <Animated.View
          style={{
            overflow: "hidden",
          }}
        >
          {/* Divider */}
          <View
            style={{
              height: 1,
              backgroundColor: colors.border,
              marginVertical: 8,
            }}
          />

          {contact.phoneNumbers &&
            contact.phoneNumbers.length > 0 &&
            contact.phoneNumbers.map((phone, idx) => (
              <View
                key={idx}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 8,
                  borderBottomWidth:
                    idx === (contact.phoneNumbers?.length ?? 0) - 1 ? 0 : 1,
                  borderBottomColor: colors.border,
                }}
              >
                <Text style={{ fontSize: 14, color: "#8191adff" }}>
                  {phone.number}
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: "#40916c",
                    borderRadius: 8,
                    paddingVertical: 6,
                    paddingHorizontal: 16,
                    alignItems: "center",
                  }}
                  onPress={() => {
                    setSelectedNumber(phone.number);
                    setConnectModalVisible(true);
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "bold" }}>
                    Connect
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
        </Animated.View>
      )}

      {/* Connect Modal */}
      <Modal
        visible={connectModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setConnectModalVisible(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "#0008",
          }}
          activeOpacity={1}
          onPress={() => setConnectModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={e => e.stopPropagation()}
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
              minHeight: 320,
            }}
          >
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 18,
                marginBottom: 16,
                color: colors.textSecondary || "#fff",
              }}
            >
              Connect via
            </Text>
            {/* Main platforms */}
            {[
              "Call",
              "WhatsApp",
              "Telegram",
              "Facebook",
              "Instagram",
              "Snapchat",
              "TikTok",
              "YouTube",
              "LinkedIn",
            ].map(platform => (
              <TouchableOpacity
                key={platform}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderColor: "#cdcdcd21",
                  justifyContent: "space-between",
                }}
                onPress={() => {
                  if (selectedNumber) {
                    openSocialMedia(platform, selectedNumber);
                  }
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {PLATFORM_ICONS[platform]}
                  <Text style={{ fontSize: 16, color: colors.text }}>
                    {platform}
                    {platform === "Facebook" && contact.facebookUsername
                      ? ` (@${contact.facebookUsername.slice(0, 15)})`
                      : ""}
                    {platform === "Instagram" && contact.instagramUsername
                      ? ` (@${contact.instagramUsername.slice(0, 15) + "..."})`
                      : ""}
                    {platform === "Snapchat" && contact.snapchatUsername
                      ? ` (@${contact.snapchatUsername.slice(0, 15) + "..."})`
                      : ""}
                    {platform === "TikTok" && contact.tiktokUsername
                      ? ` (@${contact.tiktokUsername.slice(0, 15) + "..."})`
                      : ""}
                    {platform === "YouTube" && contact.youtubeUsername
                      ? ` (${contact.youtubeUsername.slice(0, 15) + "..."})`
                      : ""}
                    {platform === "LinkedIn" && contact.linkedinUsername
                      ? ` (@${contact.linkedinUsername.slice(0, 15) + "..."})`
                      : ""}
                  </Text>
                </View>

                {[
                  "Facebook",
                  "Instagram",
                  "Snapchat",
                  "TikTok",
                  "YouTube",
                  "LinkedIn",
                ].includes(platform) && (
                  <TouchableOpacity
                    style={{
                      padding: 8,
                      backgroundColor: "#542967ff",
                      borderRadius: 6,
                      marginLeft: 8,
                    }}
                    onPress={() => {
                      const field = `${platform.toLowerCase()}Username`;
                      setUsernameInput((contact as any)[field] || "");
                      setEditUsernameModal({
                        platform,
                        field,
                      });
                    }}
                  >
                    <Ionicons name="pencil" size={16} color="#f5f5f5ff" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Username Edit Modal */}
      <Modal
        visible={!!editUsernameModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setEditUsernameModal(null);
          setUsernameInput("");
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.overlay || "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: colors.background,
              borderRadius: 12,
              padding: 24,
              width: "80%",
            }}
          >
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 16,
                marginBottom: 12,
                color: colors.textSecondary || "#fff",
              }}
            >
              {editUsernameModal && (contact as any)[editUsernameModal.field]
                ? `Edit ${editUsernameModal.platform} Username`
                : `Enter ${
                    editUsernameModal ? editUsernameModal.platform : ""
                  } Username`}
            </Text>
            <TextInput
              value={usernameInput}
              onChangeText={text => {
                setUsernameInput(text);
                setUsernameError("");
              }}
              placeholder="Username"
              placeholderTextColor="#666"
              style={{
                borderWidth: 1,
                borderColor: usernameError ? "#F56565" : "#ccc",
                borderRadius: 8,
                padding: 10,
                marginBottom: usernameError ? 4 : 16,
                color: colors.subtext,
              }}
              autoCapitalize="none"
            />
            {usernameError ? (
              <Text
                style={{ color: "#F56565", fontSize: 12, marginBottom: 16 }}
              >
                {usernameError}
              </Text>
            ) : null}
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 8,
                  padding: 12,
                  alignItems: "center",
                  flex: 1,
                  marginRight: 8,
                }}
                onPress={handleEditUsername}
              >
                <Text style={{ color: COLORS.white, fontWeight: "bold" }}>
                  {editUsernameModal &&
                  (contact as any)[editUsernameModal.field]
                    ? usernameInput.trim()
                      ? "Update"
                      : "Delete"
                    : "Save"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setEditUsernameModal(null);
                  setUsernameInput("");
                }}
                style={{
                  backgroundColor: "#EDF2F7",
                  borderRadius: 8,
                  padding: 12,
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <Text style={{ color: "#2D3748", fontWeight: "bold" }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </TouchableOpacity>
  );
}
