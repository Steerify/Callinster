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
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS } from "../../constants/theme";
import { createProfileStyles } from "../../styles/profile.styles";
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
  const { tier } = useSubscription();
  const { user } = useUser();
  const { signOut } = useAuth();
  const { colors } = useTheme();
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [showPlanDetails, setShowPlanDetails] = useState(false);
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const pStyles = createProfileStyles();

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
      const notifListener = Notifications.addNotificationReceivedListener(() => {});
      const responseListener = Notifications.addNotificationResponseReceivedListener(() => {});
      return () => { notifListener.remove(); responseListener.remove(); };
    })();
  }, []);

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
    { label: "Help & Support", icon: "help-circle-outline", color: "#6366f1", onPress: () => Linking.openURL("mailto:support@callinster.com") },
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
            <Text style={[pStyles.subCardSubtitle, { color: colors.textSecondary }]}>
              {isPremium ? "Get unlimited contacts, favorites & no ads" : "Upgrade to Premium or Elite for extra features"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={isPremium ? "#7c3aed" : colors.primary} />
        </TouchableOpacity>
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
      <TouchableOpacity style={[pStyles.signOutBtn, { backgroundColor: colors.surface, borderColor: "#fee2e2" }]} onPress={() => signOut()}>
        <Ionicons name="log-out-outline" size={20} color="#ef4444" style={{ marginRight: 10 }} />
        <Text style={[pStyles.signOutText, { color: "#ef4444" }]}>Sign Out</Text>
      </TouchableOpacity>

      <View style={pStyles.closeSpacer} />

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
              <Text style={pStyles.doneBtnText}>Done</Text>
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
                { name: "Basic", price: "Free", color: colors.subtext, bg: colors.card, features: ["5 contacts/day", "5 deletes/day", "Avoid prefixes"], btn: false },
                { name: "Premium", price: "₦X/month", color: colors.primary, bg: "#eef2ff", features: ["Extended contacts", "10 deletes/day", "Advanced search", "Avoid prefixes"], btn: true },
                { name: "Elite ⭐", price: "₦X/month", color: "#b45309", bg: "#fffbea", features: ["Unlimited contacts", "Unlimited deletes", "Favorites", "No ads", "Advanced search"], btn: true },
              ].map((plan, i) => (
                <View key={i} style={[pStyles.planBox, { backgroundColor: plan.bg, borderColor: plan.color }]}>
                  <View style={pStyles.modalHeader}>
                    <Text style={[pStyles.planName, { color: plan.color }]}>{plan.name}</Text>
                    <Text style={[pStyles.planPrice, { color: plan.color }]}>{plan.price}</Text>
                  </View>
                  {plan.features.map(f => (
                    <View key={f} style={pStyles.planFeatureRow}>
                      <Ionicons name="checkmark-circle" size={14} color={plan.color} />
                      <Text style={[pStyles.planFeatureText, { color: colors.textSecondary }]}>{f}</Text>
                    </View>
                  ))}
                  {plan.btn && (
                    <TouchableOpacity style={[pStyles.planUpgradeBtn, { backgroundColor: plan.color }]}>
                      <Text style={pStyles.doneBtnText}>Upgrade to {plan.name.replace(" ⭐", "")}</Text>
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
            <View style={pStyles.accountBlock}>
              <Text style={[pStyles.accountLabel, { color: colors.textSecondary }]}>Full Name</Text>
              <Text style={[pStyles.accountValue, { color: colors.text }]}>{userData.name}</Text>
              
              <Text style={[pStyles.accountLabel, { color: colors.textSecondary }]}>Email Address</Text>
              <Text style={[pStyles.accountValue, { color: colors.text }]}>{userData.email}</Text>
              
              <Text style={[pStyles.accountLabel, { color: colors.textSecondary }]}>Current Plan</Text>
              <Text style={[pStyles.accountValue, { color: colors.primary, marginBottom: 0, fontWeight: "700" }]}>{tierLabel}</Text>
            </View>
            <TouchableOpacity style={[pStyles.doneBtn, { backgroundColor: colors.primary, marginTop: 24 }]} onPress={() => setAccountModalVisible(false)}>
              <Text style={pStyles.doneBtnText}>Close</Text>
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
            <Text style={[pStyles.privacyText, { color: colors.textSecondary }]}>
              Your privacy is extremely important to us. 
              {"\n\n"}
              • Callinster only requests contacts access strictly for scheduling calls on your device. {"\n"}
              • Your contacts are processed locally and are never uploaded to our servers. {"\n"}
              • All scheduled notifications and call metadata remain on your phone.
            </Text>
            <TouchableOpacity style={[pStyles.doneBtn, { backgroundColor: colors.primary }]} onPress={() => setPrivacyModalVisible(false)}>
              <Text style={pStyles.doneBtnText}>Understood</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
