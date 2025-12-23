// components/ThemeSwitch.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

export const ThemeSwitch = () => {
  const { theme, toggleTheme, colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={[styles.container, { backgroundColor: colors.surfaceLight }]}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={theme === "light" ? "sunny" : "moon"}
          size={18}
          color={theme === "light" ? "#F59E0B" : "#fdf9b7ff"}
        />
        <Text style={[styles.text, { color: colors.text }]}>
          {theme === "light" ? "Light" : "Dark"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: 20,
    minWidth: 90,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
  },
});

// Default export for compatibility with Expo Router / file-based component expectations
export default ThemeSwitch;
