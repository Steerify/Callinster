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
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS } from "../../constants/theme";
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

type DayPreference = { calls: boolean; messages: boolean };
type WeeklyPreferences = {
  monday: DayPreference; tuesday: DayPreference; wednesday: DayPreference;
  thursday: DayPreference; friday: DayPreference; saturday: DayPreference; sunday: DayPreference;
};

interface ContactProps {
  contact: MyContact;
  onDelete: () => void;
  showHeart?: boolean;
  onFavorite?: (contact: MyContact) => void;
  weeklyPreferences: WeeklyPreferences;
}

const AVATAR_PALETTE = [
  "#7c3aed","#091556","#1940bd","#0ea5e9","#10b981",
  "#f59e0b","#ef4444","#8b5cf6","#06b6d4","#ec4899",
];
function getAvatarColor(name: string): string {
  return AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length];
}

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  Call: <Ionicons name="call" size={20} color="#48BB78" style={{ marginRight: 10 }} />,
  WhatsApp: <FontAwesome name="whatsapp" size={20} color="#25D366" style={{ marginRight: 10 }} />,
  "WhatsApp Business": <FontAwesome5 name="whatsapp" size={20} color="#128C7E" style={{ marginRight: 10 }} />,
  Telegram: <FontAwesome name="telegram" size={20} color="#229ED9" style={{ marginRight: 10 }} />,
  Facebook: <FontAwesome name="facebook" size={20} color="#1877F3" style={{ marginRight: 10 }} />,
  Instagram: <Entypo name="instagram" size={20} color="#C13584" style={{ marginRight: 10 }} />,
  Snapchat: <FontAwesome5 name="snapchat-ghost" size={20} color="#FFCC00" style={{ marginRight: 10 }} />,
  TikTok: <FontAwesome5 name="tiktok" size={20} color="#010101" style={{ marginRight: 10 }} />,
  YouTube: <Feather name="youtube" size={20} color="#FF0000" style={{ marginRight: 10 }} />,
  LinkedIn: <Feather name="linkedin" size={20} color="#0077B5" style={{ marginRight: 10 }} />,
};

function sanitizeUsername(username: string) {
  return username.replace(/[^a-zA-Z0-9._-]/g, "");
}

export default function Contact({ contact, onDelete, showHeart = false, onFavorite, weeklyPreferences }: ContactProps) {
  const { colors } = useTheme();
  const [isFavorite, setIsFavorite] = useState(false);
  const [connectModalVisible, setConnectModalVisible] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [editUsernameModal, setEditUsernameModal] = useState<null | { platform: string; field: string }>(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [usernameError, setUsernameError] = useState("");

  const avatarColor = getAvatarColor(contact.name);
  const days = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
  const today = days[new Date().getDay()];
  const getCurrentDayPreferences = () => {
    const day = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase() as keyof WeeklyPreferences;
    return weeklyPreferences?.[day] || { calls: true, messages: true };
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
      if (saved) Object.assign(contact, JSON.parse(saved));
    };
    loadUsernames();
  }, [contact, showHeart]);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const handleFavorite = async () => {
    const data = await AsyncStorage.getItem("favoriteContacts");
    let favs: any[] = data ? JSON.parse(data) : [];
    if (isFavorite) favs = favs.filter(fav => fav.id !== contact.id);
    else favs.push(contact);
    await AsyncStorage.setItem("favoriteContacts", JSON.stringify(favs));
    setIsFavorite(!isFavorite);
    if (onFavorite) onFavorite(contact);
  };

  function formatPhoneNumber(number: string) {
    let num = number.replace(/\D/g, "");
    if (num.startsWith("0")) num = "+234" + num.slice(1);
    else if (!num.startsWith("+")) num = "+" + num;
    return num;
  }

  const openSocialMedia = async (platform: string, phoneNumber: string) => {
    const dayPrefs = getCurrentDayPreferences();
    const isCallPlatform = platform === "Call" || platform === "phone";
    if (isCallPlatform && !dayPrefs.calls) { Alert.alert("Not Allowed", "Calls are not enabled for today."); return; }
    if (!isCallPlatform && !dayPrefs.messages) { Alert.alert("Not Allowed", "Messages are not enabled for today."); return; }

    const number = phoneNumber.replace(/\D/g, "");
    let url = "";
    switch (platform) {
      case "Call": url = `tel:${number}`; break;
      case "WhatsApp": url = `https://wa.me/${formatPhoneNumber(phoneNumber)}`; break;
      case "WhatsApp Business": url = `https://wa.me/${formatPhoneNumber(phoneNumber)}`; break;
      case "Telegram": url = `https://t.me/${formatPhoneNumber(phoneNumber)}`; break;
      case "Facebook":
        if (contact.facebookUsername) url = `fb://profile/${sanitizeUsername(contact.facebookUsername)}`;
        else { setEditUsernameModal({ platform: "Facebook", field: "facebookUsername" }); return; }
        break;
      case "Instagram":
        if (contact.instagramUsername) url = `instagram://user?username=${sanitizeUsername(contact.instagramUsername)}`;
        else { setEditUsernameModal({ platform: "Instagram", field: "instagramUsername" }); return; }
        break;
      case "Snapchat":
        if (contact.snapchatUsername) url = `snapchat://add/${sanitizeUsername(contact.snapchatUsername)}`;
        else { setEditUsernameModal({ platform: "Snapchat", field: "snapchatUsername" }); return; }
        break;
      case "TikTok":
        if (contact.tiktokUsername) url = `https://www.tiktok.com/@${sanitizeUsername(contact.tiktokUsername)}`;
        else { setEditUsernameModal({ platform: "TikTok", field: "tiktokUsername" }); return; }
        break;
      case "YouTube":
        if (contact.youtubeUsername) url = `https://www.youtube.com/${sanitizeUsername(contact.youtubeUsername)}`;
        else { setEditUsernameModal({ platform: "YouTube", field: "youtubeUsername" }); return; }
        break;
      case "LinkedIn":
        if (contact.linkedinUsername) url = `https://www.linkedin.com/in/${sanitizeUsername(contact.linkedinUsername)}`;
        else { setEditUsernameModal({ platform: "LinkedIn", field: "linkedinUsername" }); return; }
        break;
      default: return;
    }
    Linking.openURL(url);
    setConnectModalVisible(false);
  };

  const handleSaveUsername = async () => {
    if (!editUsernameModal) return;
    setUsernameError("");
    if (!usernameInput.trim()) { setUsernameError("Username cannot be empty"); return; }
    if (editUsernameModal.platform === "Instagram" && !/^[\w.](?!.*?\.{2})[\w.]{1,28}[\w]$/.test(usernameInput)) {
      setUsernameError("Invalid Instagram username format"); return;
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
    Alert.alert("Saved!", `${editUsernameModal.platform} username saved.`);
    setTimeout(() => { if (selectedNumber) openSocialMedia(editUsernameModal.platform, selectedNumber); }, 300);
  };

  const handleEditUsername = async () => {
    if (!editUsernameModal) return;
    const existingUsername = (contact as any)[editUsernameModal.field];
    if (existingUsername && !usernameInput.trim()) {
      Alert.alert("Delete Username", `Remove ${editUsernameModal.platform} username?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete", style: "destructive",
          onPress: async () => {
            (contact as any)[editUsernameModal.field] = "";
            const key = `usernames_${contact.id}`;
            const saved = await AsyncStorage.getItem(key);
            const usernames = saved ? JSON.parse(saved) : {};
            delete usernames[editUsernameModal.field];
            await AsyncStorage.setItem(key, JSON.stringify(usernames));
            setEditUsernameModal(null);
            setUsernameInput("");
          },
        },
      ]);
      return;
    }
    handleSaveUsername();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={toggleExpand}
      style={[cStyles.card, { backgroundColor: colors.surface, shadowColor: colors.primary }]}
    >
      {/* Contact row */}
      <View style={cStyles.row}>
        {/* Avatar */}
        <View style={[cStyles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={cStyles.avatarText}>{contact.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[cStyles.name, { color: colors.text }]}>{contact.name}</Text>
          {!expanded && contact.phoneNumbers && contact.phoneNumbers.length > 0 && (
            <Text style={[cStyles.phonePreview, { color: colors.subtext }]} numberOfLines={1}>
              {contact.phoneNumbers[0].number}
            </Text>
          )}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          {showHeart && (
            <TouchableOpacity onPress={handleFavorite} style={cStyles.iconBtn} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={20} color={isFavorite ? COLORS.heart : colors.subtext} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={cStyles.iconBtn} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <Ionicons name="trash-outline" size={18} color="#ef4444" />
            </TouchableOpacity>
          )}
          <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={18} color={colors.subtext} />
        </View>
      </View>

      {/* Expanded phone numbers */}
      {expanded && (
        <Animated.View style={{ overflow: "hidden" }}>
          <View style={[cStyles.divider, { backgroundColor: colors.divider }]} />
          {contact.phoneNumbers && contact.phoneNumbers.length > 0 ? (
            contact.phoneNumbers.map((phone, idx) => (
              <View key={idx} style={[cStyles.phoneRow, idx < (contact.phoneNumbers?.length ?? 0) - 1 && { borderBottomWidth: 1, borderBottomColor: colors.divider }]}>
                <Ionicons name="call-outline" size={14} color={colors.subtext} style={{ marginRight: 6 }} />
                <Text style={[cStyles.phoneNumber, { color: colors.textSecondary }]}>{phone.number}</Text>
                <TouchableOpacity
                  style={[cStyles.connectBtn, { backgroundColor: colors.primary }]}
                  onPress={() => { setSelectedNumber(phone.number); setConnectModalVisible(true); }}
                >
                  <Text style={cStyles.connectBtnText}>Connect</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={[cStyles.noPhone, { color: colors.subtext }]}>No phone number</Text>
          )}
        </Animated.View>
      )}

      {/* Connect Modal */}
      <Modal visible={connectModalVisible} transparent animationType="slide" onRequestClose={() => setConnectModalVisible(false)}>
        <TouchableOpacity style={cStyles.modalBackdrop} activeOpacity={1} onPress={() => setConnectModalVisible(false)}>
          <TouchableOpacity activeOpacity={1} onPress={e => e.stopPropagation()} style={[cStyles.connectSheet, { backgroundColor: colors.surface }]}>
            <View style={cStyles.sheetHandle} />
            <Text style={[cStyles.connectSheetTitle, { color: colors.text }]}>Connect via</Text>
            {["Call","WhatsApp","WhatsApp Business","Telegram","Facebook","Instagram","Snapchat","TikTok","YouTube","LinkedIn"].map(platform => (
              <TouchableOpacity
                key={platform}
                style={[cStyles.platformRow, { borderBottomColor: colors.divider }]}
                onPress={() => { if (selectedNumber) openSocialMedia(platform, selectedNumber); }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                  {PLATFORM_ICONS[platform]}
                  <Text style={[cStyles.platformName, { color: colors.text }]}>
                    {platform}
                    {platform === "Facebook" && contact.facebookUsername ? ` (@${contact.facebookUsername.slice(0, 15)})` : ""}
                    {platform === "Instagram" && contact.instagramUsername ? ` (@${contact.instagramUsername.slice(0, 12)}…)` : ""}
                    {platform === "Snapchat" && contact.snapchatUsername ? ` (@${contact.snapchatUsername.slice(0, 12)}…)` : ""}
                    {platform === "TikTok" && contact.tiktokUsername ? ` (@${contact.tiktokUsername.slice(0, 12)}…)` : ""}
                    {platform === "YouTube" && contact.youtubeUsername ? ` (${contact.youtubeUsername.slice(0, 12)}…)` : ""}
                    {platform === "LinkedIn" && contact.linkedinUsername ? ` (@${contact.linkedinUsername.slice(0, 12)}…)` : ""}
                  </Text>
                </View>
                {["Facebook","Instagram","Snapchat","TikTok","YouTube","LinkedIn"].includes(platform) && (
                  <TouchableOpacity
                    style={[cStyles.editUsernameBtn, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      const field = `${platform.toLowerCase()}Username`;
                      setUsernameInput((contact as any)[field] || "");
                      setEditUsernameModal({ platform, field });
                    }}
                  >
                    <Ionicons name="pencil" size={14} color="#fff" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Username Edit Modal */}
      <Modal visible={!!editUsernameModal} transparent animationType="fade" onRequestClose={() => { setEditUsernameModal(null); setUsernameInput(""); }}>
        <View style={[cStyles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[cStyles.usernameCard, { backgroundColor: colors.surface }]}>
            <Text style={[cStyles.usernameTitle, { color: colors.text }]}>
              {editUsernameModal && (contact as any)[editUsernameModal.field]
                ? `Edit ${editUsernameModal.platform} Username`
                : `Enter ${editUsernameModal?.platform ?? ""} Username`}
            </Text>
            <TextInput
              value={usernameInput}
              onChangeText={t => { setUsernameInput(t); setUsernameError(""); }}
              placeholder="Username"
              placeholderTextColor={colors.placeholder}
              style={[cStyles.usernameInput, { borderColor: usernameError ? "#ef4444" : colors.border, color: colors.text, backgroundColor: colors.input }]}
              autoCapitalize="none"
            />
            {!!usernameError && <Text style={cStyles.usernameError}>{usernameError}</Text>}
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity style={[cStyles.usernameSaveBtn, { backgroundColor: colors.primary }]} onPress={handleEditUsername}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>
                  {editUsernameModal && (contact as any)[editUsernameModal.field] ? (usernameInput.trim() ? "Update" : "Delete") : "Save"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={cStyles.usernameCancelBtn} onPress={() => { setEditUsernameModal(null); setUsernameInput(""); }}>
                <Text style={{ color: colors.textSecondary, fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </TouchableOpacity>
  );
}

const cStyles = StyleSheet.create({
  card: { borderRadius: 14, padding: 14, marginBottom: 10, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3 },
  row: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", marginRight: 12 },
  avatarText: { fontSize: 18, fontWeight: "700", color: "#fff" },
  name: { fontSize: 16, fontWeight: "600" },
  phonePreview: { fontSize: 12, marginTop: 2 },
  iconBtn: { padding: 2 },
  divider: { height: 1, marginVertical: 10 },
  phoneRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  phoneNumber: { flex: 1, fontSize: 14 },
  connectBtn: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8 },
  connectBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  noPhone: { fontSize: 14, fontStyle: "italic", paddingVertical: 6 },
  modalBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  connectSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, minHeight: 300 },
  sheetHandle: { width: 40, height: 4, backgroundColor: "#E2E8F0", borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  connectSheetTitle: { fontSize: 17, fontWeight: "700", marginBottom: 12 },
  platformRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, justifyContent: "space-between" },
  platformName: { fontSize: 15 },
  editUsernameBtn: { padding: 8, borderRadius: 8, marginLeft: 8 },
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center" },
  usernameCard: { width: "82%", borderRadius: 16, padding: 22 },
  usernameTitle: { fontSize: 16, fontWeight: "700", marginBottom: 14 },
  usernameInput: { borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 6, fontSize: 15 },
  usernameError: { color: "#ef4444", fontSize: 12, marginBottom: 12 },
  usernameSaveBtn: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  usernameCancelBtn: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: "center", backgroundColor: "#F1F5F9" },
});
