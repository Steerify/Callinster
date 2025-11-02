import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import Index from "./index";
import Notifications from "./notifications";
import Profile from "./profile";
import { useTheme } from "../../contexts/ThemeContext";

const Tab = createMaterialTopTabNavigator();

export default function TabLayout() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.primary,
        tabBarStyle: {
          height: 50,
          backgroundColor: "white",
          paddingBottom: 8,
          elevation: 0,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          borderTopWidth: 0, 
        },
        swipeEnabled: true, 
      }}
    >
      <Tab.Screen
        name="index"
        component={Index}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="notifications"
        component={Notifications}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="heart"
              size={24}
              color={focused ? COLORS.heart : COLORS.grey}
            />
          ),
        }}
      />
      <Tab.Screen
        name="profile"
        component={Profile}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
