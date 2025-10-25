import { styles } from "@/styles/auth.styles";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as Device from "expo-device";
import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import React, { useEffect, useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import {
  Alert,
  Image,
  ImageBackground,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import NotificationSettings from "../components/NotificationSettings";
import { useSubscription } from "../components/Subsceiption";

type NotificationData = {
  app: string;
  contact: string;
};

// Image imports
const eliteBg = require("../../assets/images/Callinsterlogo(1).jpg");
const regularBg = require("../../assets/images/Callinsterlogo(2).jpg");

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
  const {colors} = useTheme()
  const [notificationModalVisible, setNotificationModalVisible] =
    useState(false);

  // Get user data from Clerk
  const userData = {
    name: user?.fullName || "Guest User",
    email: user?.primaryEmailAddress?.emailAddress || "No email available",
    imageUrl: user?.imageUrl,
    tier: tier,
  };

  const isElite = tier === "elite";
  const backgroundImage = isElite ? eliteBg : regularBg;

  // Request notification permissions on mount
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Please enable notifications to schedule calls"
        );
      }
    })();
  }, []);

  // Add this function to handle notification setup
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
        "Please enable notifications in your device settings to receive important updates."
      );
      return false;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
        name: "Profile Notifications",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
        enableVibrate: true,
      });
    }

    return true;
  };

  // Add this function to check battery optimization
  const checkBatteryOptimization = async () => {
    if (Platform.OS === "android" && Device.isDevice) {
      Alert.alert(
        "Battery Optimization",
        "To ensure reliable notifications, please disable battery optimization for this app.",
        [
          { text: "Later", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() },
        ]
      );
    }
  };

  // Update your existing useEffect
  useEffect(() => {
    const initializeNotifications = async () => {
      const permissionsGranted = await setupNotifications();
      if (permissionsGranted) {
        await checkBatteryOptimization();
      }

      // Set up notification listeners
      const notificationListener =
        Notifications.addNotificationReceivedListener(notification => {
          console.log("Received notification:", notification);
          // Handle received notification
        });

      const responseListener =
        Notifications.addNotificationResponseReceivedListener(response => {
          console.log("Notification response:", response);
          // Handle notification response
        });

      return () => {
        notificationListener.remove();
        responseListener.remove();
      };
    };

    initializeNotifications();
  }, []);

  // Add this function to test notifications
  const sendTestNotification = async () => {
    const permissionsGranted = await setupNotifications();
    if (!permissionsGranted) return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Profile Update",
          body: "This is a test notification from your profile",
          data: { screen: "profile" },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: {
          seconds: 1,
          channelId: NOTIFICATION_CHANNEL_ID,
        },
      });
      Alert.alert("Success", "Test notification sent!");
    } catch (error) {
      console.error("Error sending notification:", error);
      Alert.alert("Error", "Failed to send test notification");
    }
  };

  return (
    <View style={[styles.container, { padding: 20, justifyContent: "center",backgroundColor:colors.background }]}>
      {/* Profile Header */}
      <ImageBackground
        source={backgroundImage}
        style={{
          alignItems: "center",
          marginBottom: 24,
          padding: 24,
          borderRadius: 16,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 5,
          position: "relative",
        }}
        imageStyle={{
          borderRadius: 16,
          opacity: 0.7,
        }}
      >
        <View style={{ position: "relative", marginBottom: 12 }}>
          {userData.imageUrl ? (
            <Image
              source={{ uri: userData.imageUrl }}
              style={{
                width: 90,
                height: 90,
                borderRadius: 45,
                borderWidth: 3,
                borderColor: isElite ? "#FFD700" : "#5E72E4",
              }}
            />
          ) : (
            <View
              style={{
                width: 90,
                height: 90,
                borderRadius: 45,
                backgroundColor: "#E2E8F0",
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 3,
                borderColor: isElite ? "#FFD700" : "#5E72E4",
              }}
            >
              <Ionicons name="person" size={44} color="#7B8AAB" />
            </View>
          )}
          {/* Badge */}
          <View
            style={{
              position: "absolute",
              bottom: 6,
              right: 6,
              backgroundColor: isElite ? "#FFD700" : "#5E72E4",
              borderRadius: 16,
              padding: 4,
              borderWidth: 2,
              borderColor: "#fff",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 28,
              minHeight: 28,
            }}
          >
            {isElite ? (
              <Ionicons name="star" size={18} color="#fff" />
            ) : (
              <Ionicons name="person" size={16} color="#fff" />
            )}
          </View>
        </View>
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            color: "white",
            textShadowColor: "#0008",
            textShadowRadius: 4,
          }}
        >
          {userData.name}
        </Text>
        <Text
          style={{
            color: "#F4F6FB",
            marginTop: 4,
            textShadowColor: "#0008",
            textShadowRadius: 2,
          }}
        >
          {userData.email}
        </Text>
        {isElite && (
          <Text
            style={{
              marginTop: 8,
              color: "#FFD700",
              fontWeight: "bold",
              fontSize: 16,
              letterSpacing: 1,
              textShadowColor: "#0008",
              textShadowRadius: 2,
            }}
          >
            Elite Member
          </Text>
        )}
      </ImageBackground>

      {/* Settings Section */}
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 18,
            marginBottom: 12,
            color: "#5E72E4",
          }}
        >
          Settings
        </Text>

        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
          }}
          onPress={() => setNotificationModalVisible(true)}
        >
          <Ionicons
            name="notifications-outline"
            size={22}
            color="#7B8AAB"
            style={{ marginRight: 10 }}
          />
          <Text style={{ fontSize: 16, color: "#2D3748" }}>
            Notification Settings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Ionicons
            name="person-circle-outline"
            size={22}
            color="#7B8AAB"
            style={{ marginRight: 10 }}
          />
          <Text style={{ fontSize: 16, color: "#2D3748" }}>Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Ionicons
            name="lock-closed-outline"
            size={22}
            color="#7B8AAB"
            style={{ marginRight: 10 }}
          />
          <Text style={{ fontSize: 16, color: "#2D3748" }}>Privacy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
          }}
          onPress={sendTestNotification}
        >
          <Ionicons
            name="notifications-circle-outline"
            size={22}
            color="#7B8AAB"
            style={{ marginRight: 10 }}
          />
          <Text style={{ fontSize: 16, color: "#2D3748" }}>
            Test Notifications
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
          onPress={() => signOut()}
        >
          <Ionicons
            name="log-out-outline"
            size={22}
            color="#F44336"
            style={{ marginRight: 10 }}
          />
          <Text style={{ fontSize: 16, color: "#F44336" }}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Notification Settings Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={notificationModalVisible}
        onRequestClose={() => setNotificationModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(49, 3, 85, 0.4)",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 16,
              padding: 24,
              width: "90%",
              maxHeight: "80%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: "#2D3748",
                }}
              >
                Notification Settings
              </Text>
              <TouchableOpacity
                onPress={() => setNotificationModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#718096" />
              </TouchableOpacity>
            </View>

            <NotificationSettings tier={tier} />

            <TouchableOpacity
              style={{
                backgroundColor: "#5E72E4",
                padding: 12,
                borderRadius: 8,
                alignItems: "center",
                marginTop: 16,
              }}
              onPress={() => setNotificationModalVisible(false)}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
