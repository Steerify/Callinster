import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import {
    Alert,
    Image,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS } from "../../constants/theme";
import NotificationSettings from "../components/NotificationSettings";
import { useSubscription } from "../components/Subsceiption";
import { useTheme } from "../contexts/ThemeContext";

const NOTIFICATION_CHANNEL_ID = "profile-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function Profile() {
  const { tier, status, checkoutState, error, startCheckout } = useSubscription();
  const { user } = useUser();
  const { signOut } = useAuth();
  const { colors } = useTheme();
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [showPlanDetails, setShowPlanDetails] = useState(false);
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const userData = {
    name: user?.fullName || "Guest User",
    email: user?.primaryEmailAddress?.emailAddress || "—",
    imageUrl: user?.imageUrl,
    tier,
  };
  const isElite = tier === "elite";
  const isPremium = tier === "premium";

  const tierLabel = isElite ? "Elite ⭐" : isPremium ? "Premium" : "Basic";
  const tierColor = isElite ? "#b45309" : isPremium ? colors.primary : colors.subtext;
  useEffect(() => {
    let notificationSub: Notifications.EventSubscription | undefined;
    let responseSub: Notifications.EventSubscription | undefined;

    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") return;
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
          name: "Profile Notifications",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
          enableVibrate: true,
        });
      }
      notificationSub = Notifications.addNotificationReceivedListener(() => {});
      responseSub = Notifications.addNotificationResponseReceivedListener(() => {});
    })();

    return () => {
      notificationSub?.remove();
      responseSub?.remove();
    };
  }, []);

  const openExternalUrl = async (url: string, failureMessage: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        Alert.alert("Action unavailable", failureMessage);
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert("Action failed", failureMessage);
    }
  };

  const handleHelpPress = async () => {
    await openExternalUrl("mailto:support@callinster.com", "We could not open your email app. Please email support@callinster.com manually.");
  };

  const handleUpgradePress = async (planName: "Premium" | "Elite") => {
    const subject = encodeURIComponent(`Upgrade request: ${planName}`);
    const body = encodeURIComponent(`Hi Callinster team,\n\nI want to upgrade to the ${planName} plan.\n\nAccount email: ${userData.email}`);
    await openExternalUrl(
      `mailto:support@callinster.com?subject=${subject}&body=${body}`,
      "We could not start the upgrade flow. Please email support@callinster.com and mention your preferred plan."
    );
  };

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await signOut();
    } catch {
      Alert.alert("Sign out failed", "We could not sign you out right now. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  };

  const sendTestNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Profile Update",
          body: "This is a test notification from Callinster",
          data: { screen: "profile" },
          sound: true,
        },
        trigger: { seconds: 1, channelId: NOTIFICATION_CHANNEL_ID },
      });
      Alert.alert("Sent!", "Test notification delivered.");
    } catch {
      Alert.alert("Error", "Failed to send test notification");
    }
  };

  const settingsRows = [
    { label: "Notification Settings", icon: "notifications-outline", color: "#7c3aed", onPress: () => setNotificationModalVisible(true) },
    { label: "Test Notifications", icon: "notifications-circle-outline", color: "#0ea5e9", onPress: sendTestNotification },
    { label: "Account", icon: "person-circle-outline", color: "#10b981", onPress: () => setAccountModalVisible(true) },
    { label: "Privacy", icon: "lock-closed-outline", color: "#f59e0b", onPress: () => setPrivacyModalVisible(true) },
    { label: "Help & Support", icon: "help-circle-outline", color: "#6366f1", onPress: handleHelpPress },
  ];

  return (
    <ScrollView style={[pStyles.screen, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Profile Header Card */}
      <View style={[pStyles.headerCard, { backgroundColor: colors.primary }]}>
        <View style={pStyles.avatarWrap}>
          {userData.imageUrl ? (
            <Image source={{ uri: userData.imageUrl }} style={[pStyles.avatar, { borderColor: isElite ? COLORS.gold : "#fff" }]} />
          ) : (
            <View style={[pStyles.avatarPlaceholder, { borderColor: isElite ? COLORS.gold : "#fff" }]}>
              <Ionicons name="person" size={44} color={colors.primary} />
            </View>
          )}
          {/* Tier badge */}
          <View style={[pStyles.tierBadge, { backgroundColor: isElite ? COLORS.gold : "#fff" }]}>
            <Ionicons name={isElite ? "star" : isPremium ? "diamond" : "person"} size={12} color={isElite ? "#fff" : colors.primary} />
          </View>
        </View>
        <Text style={pStyles.profileName}>{userData.name}</Text>
        <Text style={pStyles.profileEmail}>{userData.email}</Text>
        <View style={pStyles.tierPill}>
          <Text style={pStyles.tierPillText}>{tierLabel}</Text>
        </View>
      </View>

      {/* Subscription Card */}
      {!isElite && (
        <TouchableOpacity style={[pStyles.subCard, { backgroundColor: isPremium ? "#f5f0ff" : "#eef2ff", borderColor: isPremium ? "#7c3aed" : colors.primary }]} onPress={() => setShowPlanDetails(true)}>
          <View style={{ flex: 1 }}>
            <Text style={[pStyles.subCardTitle, { color: isPremium ? "#7c3aed" : colors.primary }]}>
              {isPremium ? "Upgrade to Elite ⭐" : "Unlock More Features"}
            </Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
              {isPremium ? "Get unlimited contacts, favorites & no ads" : "Upgrade to Premium or Elite for extra features"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={isPremium ? "#7c3aed" : colors.primary} />
        </TouchableOpacity>
      )}
      {checkoutState !== "idle" && (
        <View style={[pStyles.subscriptionStateBanner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={{ color: colors.text, fontWeight: "600" }}>
            {checkoutState === "pending"
              ? "Processing PayPal checkout..."
              : checkoutState === "success"
                ? "Subscription updated successfully."
                : "Subscription update failed."}
          </Text>
          <Text style={{ color: colors.subtext, marginTop: 4 }}>
            Status: {status}
          </Text>
          {!!error && <Text style={{ color: "#dc2626", marginTop: 6 }}>{error}</Text>}
        </View>
      )}

      {/* Stats Row */}
      <View style={[pStyles.statsRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {[
          { label: "Plan", value: tierLabel, color: tierColor },
          { label: "Deletes/day", value: isElite ? "∞" : isPremium ? "10" : "5", color: colors.text },
          { label: "Contacts", value: isElite ? "∞" : "5", color: colors.text },
        ].map((s, i) => (
          <View key={i} style={[pStyles.statItem, i < 2 && { borderRightWidth: 1, borderRightColor: colors.divider }]}>
            <Text style={[pStyles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={[pStyles.statLabel, { color: colors.subtext }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Settings Section */}
      <View style={[pStyles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[pStyles.sectionTitle, { color: colors.primary }]}>Settings</Text>
        {settingsRows.map((row, i) => (
          <TouchableOpacity key={i} style={[pStyles.settingRow, i < settingsRows.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.divider }]} onPress={row.onPress}>
            <View style={[pStyles.settingIconWrap, { backgroundColor: `${row.color}18` }]}>
              <Ionicons name={row.icon as any} size={20} color={row.color} />
            </View>
            <Text style={[pStyles.settingLabel, { color: colors.text }]}>{row.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.subtext} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Sign Out */}
      <TouchableOpacity
        style={[pStyles.signOutBtn, { backgroundColor: colors.surface, borderColor: "#fee2e2", opacity: isSigningOut ? 0.7 : 1 }]}
        onPress={handleSignOut}
        disabled={isSigningOut}
      >
        <Ionicons name="log-out-outline" size={20} color="#ef4444" style={{ marginRight: 10 }} />
        <Text style={{ fontSize: 16, color: "#ef4444", fontWeight: "600" }}>{isSigningOut ? "Signing Out..." : "Sign Out"}</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />

      {/* Notification Settings Modal */}
      <Modal animationType="slide" transparent visible={notificationModalVisible} onRequestClose={() => setNotificationModalVisible(false)}>
        <View style={pStyles.modalOverlay}>
          <View style={[pStyles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={pStyles.modalHeader}>
              <Text style={[pStyles.modalTitle, { color: colors.text }]}>Notification Settings</Text>
              <TouchableOpacity onPress={() => setNotificationModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.subtext} />
              </TouchableOpacity>
            </View>
            <NotificationSettings tier={tier} />
            <TouchableOpacity style={[pStyles.doneBtn, { backgroundColor: colors.primary }]} onPress={() => setNotificationModalVisible(false)}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Plan Details Modal */}
      <Modal visible={showPlanDetails} transparent animationType="fade" onRequestClose={() => setShowPlanDetails(false)}>
        <View style={pStyles.modalOverlay}>
          <View style={[pStyles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={pStyles.modalHeader}>
              <Text style={[pStyles.modalTitle, { color: colors.text }]}>Subscription Plans</Text>
              <TouchableOpacity onPress={() => setShowPlanDetails(false)}>
                <Ionicons name="close" size={24} color={colors.subtext} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {[
                { name: "Basic", tier: "basic", price: "Free", color: colors.subtext, bg: colors.card, features: ["5 contacts/day", "5 deletes/day", "Avoid prefixes"], btn: false },
                { name: "Premium", tier: "premium", price: "Configured via PayPal plan ID", color: colors.primary, bg: "#eef2ff", features: ["Extended contacts", "10 deletes/day", "Advanced search", "Avoid prefixes"], btn: true },
                { name: "Elite ⭐", tier: "elite", price: "Configured via PayPal plan ID", color: "#b45309", bg: "#fffbea", features: ["Unlimited contacts", "Unlimited deletes", "Favorites", "No ads", "Advanced search"], btn: true },
              ].map((plan, i) => (
                <View key={i} style={[pStyles.planBox, { backgroundColor: plan.bg, borderColor: plan.color }]}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={[pStyles.planName, { color: plan.color }]}>{plan.name}</Text>
                    <Text style={{ color: plan.color, fontWeight: "600", fontSize: 13 }}>{plan.price}</Text>
                  </View>
                  {plan.features.map(f => (
                    <View key={f} style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                      <Ionicons name="checkmark-circle" size={14} color={plan.color} />
                      <Text style={{ color: colors.textSecondary, fontSize: 13, marginLeft: 6 }}>{f}</Text>
                    </View>
                  ))}
                  {plan.btn && (
                    <TouchableOpacity
                      style={[pStyles.planUpgradeBtn, { backgroundColor: plan.color }]}
                      onPress={() => handleUpgradePress(plan.name.includes("Elite") ? "Elite" : "Premium")}
                    >
                      <Text style={{ color: "#fff", fontWeight: "700" }}>Upgrade to {plan.name.replace(" ⭐", "")}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Account Info Modal */}
      <Modal animationType="slide" transparent visible={accountModalVisible} onRequestClose={() => setAccountModalVisible(false)}>
        <View style={pStyles.modalOverlay}>
          <View style={[pStyles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={pStyles.modalHeader}>
              <Text style={[pStyles.modalTitle, { color: colors.text }]}>Account Information</Text>
              <TouchableOpacity onPress={() => setAccountModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.subtext} />
              </TouchableOpacity>
            </View>
            <View style={{ marginVertical: 10 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 4 }}>Full Name</Text>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: "500", marginBottom: 16 }}>{userData.name}</Text>
              
              <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 4 }}>Email Address</Text>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: "500", marginBottom: 16 }}>{userData.email}</Text>
              
              <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 4 }}>Current Plan</Text>
              <Text style={{ color: colors.primary, fontSize: 16, fontWeight: "700" }}>{tierLabel}</Text>
            </View>
            <TouchableOpacity style={[pStyles.doneBtn, { backgroundColor: colors.primary, marginTop: 24 }]} onPress={() => setAccountModalVisible(false)}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Privacy Modal */}
      <Modal animationType="slide" transparent visible={privacyModalVisible} onRequestClose={() => setPrivacyModalVisible(false)}>
        <View style={pStyles.modalOverlay}>
          <View style={[pStyles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={pStyles.modalHeader}>
              <Text style={[pStyles.modalTitle, { color: colors.text }]}>Privacy Settings</Text>
              <TouchableOpacity onPress={() => setPrivacyModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.subtext} />
              </TouchableOpacity>
            </View>
            <Text style={{ color: colors.textSecondary, marginBottom: 16, lineHeight: 22 }}>
              Your privacy is extremely important to us. 
              {"\n\n"}
              • Callinster only requests contacts access strictly for scheduling calls on your device. {"\n"}
              • Your contacts are processed locally and are never uploaded to our servers. {"\n"}
              • All scheduled notifications and call metadata remain on your phone.
            </Text>
            <TouchableOpacity style={[pStyles.doneBtn, { backgroundColor: colors.primary }]} onPress={() => setPrivacyModalVisible(false)}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>Understood</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const pStyles = StyleSheet.create({
  screen: { flex: 1 },
  headerCard: { paddingTop: 56, paddingBottom: 28, alignItems: "center", marginBottom: 16 },
  avatarWrap: { position: "relative", marginBottom: 12 },
  avatar: { width: 88, height: 88, borderRadius: 44, borderWidth: 3 },
  avatarPlaceholder: { width: 88, height: 88, borderRadius: 44, backgroundColor: "#e6eaf7", borderWidth: 3, alignItems: "center", justifyContent: "center" },
  tierBadge: { position: "absolute", bottom: 4, right: 4, width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff" },
  profileName: { color: "#ffffff", fontSize: 22, fontWeight: "700", letterSpacing: 0.3 },
  profileEmail: { color: "rgba(255,255,255,0.75)", fontSize: 14, marginTop: 4 },
  tierPill: { marginTop: 10, backgroundColor: "rgba(255,255,255,0.18)", paddingHorizontal: 16, paddingVertical: 4, borderRadius: 20 },
  tierPillText: { color: "#ffffff", fontWeight: "600", fontSize: 13 },
  subCard: { marginHorizontal: 16, marginBottom: 12, borderRadius: 14, padding: 14, flexDirection: "row", alignItems: "center", borderWidth: 1.5 },
  subscriptionStateBanner: { marginHorizontal: 16, marginBottom: 12, borderRadius: 12, borderWidth: 1, padding: 12 },
  subCardTitle: { fontSize: 15, fontWeight: "700" },
  statsRow: { marginHorizontal: 16, marginBottom: 12, borderRadius: 14, flexDirection: "row", borderWidth: 1, overflow: "hidden" },
  statItem: { flex: 1, paddingVertical: 14, alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "700" },
  statLabel: { fontSize: 11, marginTop: 2, fontWeight: "500" },
  section: { marginHorizontal: 16, marginBottom: 12, borderRadius: 14, padding: 16, borderWidth: 1 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  settingRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  settingIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", marginRight: 12 },
  settingLabel: { flex: 1, fontSize: 15 },
  signOutBtn: { marginHorizontal: 16, marginBottom: 12, borderRadius: 14, padding: 16, flexDirection: "row", alignItems: "center", borderWidth: 1 },
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalCard: { width: "92%", borderRadius: 20, padding: 20, maxHeight: "88%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: "700" },
  doneBtn: { borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 16 },
  planBox: { borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1.5 },
  planName: { fontSize: 16, fontWeight: "700" },
  planUpgradeBtn: { borderRadius: 8, paddingVertical: 10, alignItems: "center", marginTop: 10 },
});
