import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/feed.styles";
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
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Carousel from "../../components/Carousel"; // Import the new Carousel component
import Contact from "../../components/Contact";
import { useSubscription } from "../../components/Subsceiption";
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
  const [showSubModal, setShowSubModal] = useState(false);

  const loadFavorites = useCallback(() => {
    AsyncStorage.getItem("favoriteContacts").then(data => {
      if (data) setFavorites(JSON.parse(data));
      else setFavorites([]);
    });
  }, []);

  useEffect(() => {
    if (tier === "elite") {
      loadFavorites();
    }
  }, [tier, loadFavorites]);

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

  const isElite = tier === "elite";

  // Enhanced carousel data with better styling
  const carouselData = [
    {
      key: "feedback",
      title: "⭐ Enjoying the app?",
      subtitle: "Give us feedback on Play Store!",
      action: () =>
        Linking.openURL(
          "https://play.google.com/store/apps/details?id=your.app.id"
        ),
      bgColor: "#f0f7ff",
      textColor: "#0066cc",
      icon: "thumbs-up",
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
    ...(!isElite
      ? [
        {
          key: "ad",
          title: "Upgrade to Elite",
          subtitle: "Unlock all premium features!",
          bgColor: "#fff8e6",
          textColor: "#e67700",
          icon: "star",
        },
      ]
      : []),
  ];


  if (tier !== "elite") {
    const isPremium = tier === "premium";
    return (
      <View style={styles.modalContainer}>
        <Carousel data={carouselData} />

        <View
          style={[
            styles.modalContent,
            {
              flexDirection: "row",
              alignItems: "center",
              padding: 0,
              backgroundColor: isPremium ? "#f5f0ff" : "#f0f7ff",
              borderRadius: 20,
              shadowColor: "#000",
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 6,
            },
          ]}
        >
          {/* Left: Illustration */}
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              borderTopLeftRadius: 16,
              borderBottomLeftRadius: 16,
              padding: 20,
            }}
          >
            <Image
              source={
                isPremium
                  ? require("../../assets/images/elite-trophy.png")
                  : require("../../assets/images/splash-icon.png")
              }
              style={{
                width: isPremium ? 110 : 110,
                height: isPremium ? 260 : 110,
                marginBottom: 10,
                transform: [{ scale: 1.08 }],
                shadowColor: "#e67700",
                shadowOpacity: 0.4,
                shadowRadius: 16,
              }}
              resizeMode="contain"
            />
          </View>
          {/* Right: Text and actions */}
          <View style={{ flex: 2, padding: 20 }}>
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 20,
                color: isPremium ? "#7c3aed" : colors.primary,
                marginBottom: 8,
              }}
            >
              {isPremium
                ? "Elite Awaits You! 🏆"
                : "Upgrade Your Callinster Experience 🥇✨"}
            </Text>
            <Text style={{ fontSize: 15, color: "#444", marginBottom: 12 }}>
              {isPremium
                ? "Unlock the ultimate Callinster experience with Elite! Enjoy unlimited favorites, exclusive features, and a distraction-free app."
                : "Upgrade to Premium or Elite for more amazing features and a smoother experience!"}
            </Text>
            <View style={{ marginBottom: 10 }}>
              <Text
                style={{ color: "#222", fontWeight: "bold", marginBottom: 4 }}
              >
                Elite Benefits:
              </Text>
              <Text style={{ color: "#444" }}>• Unlimited favorites</Text>
              <Text style={{ color: "#444" }}>• Unlimited deletes</Text>
              <Text style={{ color: "#444" }}>• Motivational carousel</Text>
              <Text style={{ color: "#444" }}>• No ads or upgrade prompts</Text>
              <Text style={{ color: "#444" }}>• Advanced search & more!</Text>
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: isPremium ? "#7c3aed" : colors.primary,
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 24,
                alignSelf: "flex-start",
                marginBottom: 10,
                shadowColor: "#7c3aed",
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
              onPress={() => setShowPlanDetails(true)}
              activeOpacity={0.85}
            >
              <Text
                style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
              >
                Upgrade to Elite
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                marginTop: 4,
                alignSelf: "flex-start",
                padding: 6,
              }}
              onPress={() => setShowPlanDetails(true)}
            >
              <Text style={{ color: "#7c3aed", fontWeight: "bold" }}>
                See All Plans
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View
        style={[
          styles.container,
          {
            flex: 1,
            backgroundColor: colors.background,
          },
        ]}
      >
        <SafeAreaView style={styles.header}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 20,
            }}
          >
            <Image
              source={require("../../assets/images/splash-icon.png")}
              style={{ width: 30, height: 25, marginRight: 3, marginTop: 3 }}
              resizeMode="contain"
            />
            <Text style={[styles.appName, { color: colors.text }]}>
              Favorites
            </Text>
          </View>
        </SafeAreaView>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#6200EE", "#3700B3", "#03DAC6"]}
            />
          }
        >
          <Carousel data={carouselData} />

          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            {/* Heart Icon */}
            <View style={{ marginBottom: 20, marginTop: -100 }}>
              <Ionicons name="heart" size={64} color={colors.text} />
            </View>

            <Text
              style={{
                textAlign: "center",
                color: colors.text,
                fontSize: 16,
                marginVertical: 10,
              }}
            >
              No favorite contacts yet.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.header}>
        <View
          style={{ flexDirection: "row", alignItems: "center", marginTop: 20 }}
        >
          <Image
            source={require("../../assets/images/splash-icon.png")}
            style={{ width: 30, height: 25, marginRight: 3, marginTop: 3 }}
            resizeMode="contain"
          />
          <Text style={[styles.appName, { color: colors.text }]}>
            Favorites
          </Text>
          <TouchableOpacity
            style={{
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="log-out-outline" size={24} color={COLORS.grey} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Use the new Carousel component */}
      <Carousel data={carouselData} />

      {/* Favorites List */}
      <FlatList
        data={favorites}
        keyExtractor={item => item.id}
        style={{ marginBottom: 50 }}
        renderItem={({ item }) => (
          <Contact
            contact={item}
            showHeart={false}
            onDelete={() => handleRemoveFavorite(item.id)}
            weeklyPreferences={{
              monday: {
                calls: false,
                messages: false,
              },
              tuesday: {
                calls: false,
                messages: false,
              },
              wednesday: {
                calls: false,
                messages: false,
              },
              thursday: {
                calls: false,
                messages: false,
              },
              friday: {
                calls: false,
                messages: false,
              },
              saturday: {
                calls: false,
                messages: false,
              },
              sunday: {
                calls: false,
                messages: false,
              },
            }}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#6200EE", "#3700B3", "#03DAC6"]}
          />
        }
      />
    </View>
  );
}
