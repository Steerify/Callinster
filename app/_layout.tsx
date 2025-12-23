import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { useFonts } from "expo-font";
import { SplashScreen } from "expo-router";
import { useCallback } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import InitialLayout from "./components/initialLayout";
import { ThemeProvider } from "./contexts/ThemeContext";
// import { SubscriptionProvider } from "./components/Subsceiption";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const fontsLoaded = useFonts({
    "JetBrainsMono-Medium": require("../assets/fonts/JetBrainsMono-Medium.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}
    >
      <SafeAreaProvider>
        <SafeAreaView
          style={{ flex: 1, backgroundColor: "black" }}
          onLayout={onLayoutRootView}
        >
          <ThemeProvider>
            {/* <SubscriptionProvider > */}
            <InitialLayout />

            {/* </SubscriptionProvider> */}
          </ThemeProvider>
        </SafeAreaView>
      </SafeAreaProvider>
    </ClerkProvider>
  );
}
