import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import {
    FlatList,
    Image,
    Linking,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Carousel from "../../components/Carousel";
import Contact from "../../components/Contact";
import { useSubscription } from "../../components/Subsceiption";
import { COLORS } from "../../constants/theme";
import { useTheme } from "../../contexts/ThemeContext";

type MyContact = {
  id: string;
  name: string;
  phoneNumbers?: { number: string }[];
};

export default function Notifications() {
  const [favorites, setFavorites] = useState<MyContact[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { tier } = useSubscription();
  const [showPlanDetails, setShowPlanDetails] = useState(false);
  const { colors } = useTheme();

  const isElite = tier === "elite";
  const isPremium = tier === "premium";

  const loadFavorites = useCallback(() => {
    AsyncStorage.getItem("favoriteContacts").then(data => {
      if (data) setFavorites(JSON.parse(data));
      else setFavorites([]);
    });
  }, []);

  useEffect(() => {
    if (isElite) loadFavorites();
  }, [isElite, loadFavorites]);

  const handleRemoveFavorite = async (contactId: string) => {
    const updated = favorites.filter(c => c.id !== contactId);
    setFavorites(updated);
    await AsyncStorage.setItem("favoriteContacts", JSON.stringify(updated));
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFavorites();
    setTimeout(() => setRefreshing(false), 500);
  };

  const carouselData = [
    {
      key: "feedback",
      title: "⭐ Enjoying Callinster?",
      subtitle: "Rate us on the Play Store!",
      action: () => Linking.openURL("https://play.google.com/store/apps/details?id=your.app.id"),
      bgColor: "#eef2ff",
      textColor: "#091556",
      icon: "thumbs-up",
    },
    {
      key: "quote1",
      title: "Inspiration",
      subtitle: "The best way to get started is to quit talking and begin doing. – Walt Disney",
      bgColor: "#f5f0ff",
      textColor: "#7c3aed",
      icon: "bulb",
    },
    {
      key: "quote2",
      title: "Motivation",
      subtitle: "Success is not final, failure is not fatal: It is the courage to continue that counts. – Churchill",
      bgColor: "#fffbea",
      textColor: "#b45309",
      icon: "rocket",
    },
    ...(!isElite ? [{
      key: "ad",
      title: "🏆 Upgrade to Elite",
      subtitle: "Unlock unlimited favorites, no ads & more!",
      bgColor: "#fff7ed",
      textColor: "#ea580c",
      icon: "star",
    }] : []),
  ];

  const weeklyPreferencesDefault = {
    monday: { calls: false, messages: false },
    tuesday: { calls: false, messages: false },
    wednesday: { calls: false, messages: false },
    thursday: { calls: false, messages: false },
    friday: { calls: false, messages: false },
    saturday: { calls: false, messages: false },
    sunday: { calls: false, messages: false },
  };

  // Non-elite: show upgrade prompt
  if (!isElite) {
    return (
      <View style={[nStyles.screen, { backgroundColor: colors.background }]}>
        <SafeAreaView style={nStyles.header}>
          <Image source={require("../../assets/images/splash-icon.png")} style={nStyles.headerIcon} resizeMode="contain" />
          <Text style={[nStyles.headerTitle, { color: colors.text }]}>Favorites</Text>
        </SafeAreaView>

        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          <Carousel data={carouselData} />

          {/* Upgrade Prompt */}
          <View style={[nStyles.upgradeCard, { backgroundColor: isPremium ? "#f5f0ff" : "#eef2ff", borderColor: isPremium ? "#7c3aed" : colors.primary }]}>
            <View style={nStyles.upgradeIllustration}>
              <Image
                source={isPremium ? require("../../assets/images/elite-trophy.png") : require("../../assets/images/splash-icon.png")}
                style={{ width: 90, height: isPremium ? 200 : 90 }}
                resizeMode="contain"
              />
            </View>
            <View style={nStyles.upgradeContent}>
              <Text style={[nStyles.upgradeTitle, { color: isPremium ? "#7c3aed" : colors.primary }]}>
                {isPremium ? "Elite Awaits You! 🏆" : "Upgrade Your Experience ✨"}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 12, lineHeight: 19 }}>
                {isPremium
                  ? "Get unlimited favorites, exclusive features, and a truly distraction-free app."
                  : "Upgrade to Premium or Elite for amazing features and a smoother experience!"}
              </Text>
              {["Unlimited favorites", "Unlimited deletes", "No ads or prompts", "Advanced search"].map(f => (
                <View key={f} style={{ flexDirection: "row", alignItems: "center", marginBottom: 3 }}>
                  <Ionicons name="checkmark-circle" size={14} color={isPremium ? "#7c3aed" : colors.primary} />
                  <Text style={{ color: colors.textSecondary, fontSize: 13, marginLeft: 6 }}>{f}</Text>
                </View>
              ))}
              <TouchableOpacity
                style={[nStyles.upgradeBtn, { backgroundColor: isPremium ? "#7c3aed" : colors.primary }]}
                onPress={() => setShowPlanDetails(true)}
              >
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>
                  {isPremium ? "Upgrade to Elite" : "See Plans"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Elite with no favorites yet
  if (favorites.length === 0) {
    return (
      <View style={[nStyles.screen, { backgroundColor: colors.background }]}>
        <SafeAreaView style={nStyles.header}>
          <Image source={require("../../assets/images/splash-icon.png")} style={nStyles.headerIcon} resizeMode="contain" />
          <Text style={[nStyles.headerTitle, { color: colors.text }]}>Favorites</Text>
        </SafeAreaView>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary, colors.secondary]} />}
        >
          <Carousel data={carouselData} />
          <View style={nStyles.emptyState}>
            <View style={[nStyles.emptyIconWrap, { backgroundColor: `${COLORS.heart}15` }]}>
              <Ionicons name="heart" size={52} color={COLORS.heart} />
            </View>
            <Text style={[nStyles.emptyTitle, { color: colors.text }]}>No favorites yet</Text>
            <Text style={[nStyles.emptySubtitle, { color: colors.subtext }]}>
              Tap the ♥ icon on any contact in the Home tab to add them here.
            </Text>
            <Text style={{ color: colors.placeholder, fontSize: 13, marginTop: 8 }}>Pull to refresh</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Elite with favorites
  return (
    <View style={[nStyles.screen, { backgroundColor: colors.background }]}>
      <SafeAreaView style={nStyles.header}>
        <Image source={require("../../assets/images/splash-icon.png")} style={nStyles.headerIcon} resizeMode="contain" />
        <Text style={[nStyles.headerTitle, { color: colors.text }]}>Favorites</Text>
        <View style={[nStyles.countPill, { backgroundColor: `${COLORS.heart}18` }]}>
          <Text style={{ color: COLORS.heart, fontWeight: "700", fontSize: 12 }}>{favorites.length}</Text>
        </View>
      </SafeAreaView>
      <Carousel data={carouselData} />
      <FlatList
        data={favorites}
        keyExtractor={item => item.id}
        style={{ marginBottom: 80, paddingHorizontal: 4 }}
        contentContainerStyle={{ paddingVertical: 4 }}
        renderItem={({ item }) => (
          <Contact
            contact={item}
            showHeart={false}
            onDelete={() => handleRemoveFavorite(item.id)}
            weeklyPreferences={weeklyPreferencesDefault}
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      />
    </View>
  );
}

const nStyles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 20, paddingBottom: 10 },
  headerIcon: { width: 28, height: 28, marginRight: 8 },
  headerTitle: { fontSize: 20, fontWeight: "700", flex: 1 },
  countPill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  upgradeCard: { margin: 16, borderRadius: 16, borderWidth: 1.5, flexDirection: "row", overflow: "hidden" },
  upgradeIllustration: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  upgradeContent: { flex: 2, padding: 16 },
  upgradeTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  upgradeBtn: { borderRadius: 10, paddingVertical: 10, alignItems: "center", marginTop: 12 },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40, paddingTop: 40 },
  emptyIconWrap: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: "center", lineHeight: 20 },
});
