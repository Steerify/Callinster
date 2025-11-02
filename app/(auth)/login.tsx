import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  ImageBackground,
} from "react-native";
import { styles } from "@/styles/auth.styles";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { useSSO } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useTheme } from "../../contexts/ThemeContext";

const backgroundImage = require("../../assets/images/CallinsterBg.png");

const phrases = [
  "Think Smart, Grow Your Horizon.",
  "Forge Connections, Fuel Success.",
  "Unlock Your Contacts, Own Your Network.",
  "Engage Boldly, Prosper Wildly.",
  "Rise Higher, Network Stronger.",
  "Your Circle, Your Fortune.",
  "Unlock Doors, Command the Stage.",
  "Genuine Links, Real Growth.",
  "Connect Deep, Expand Wide.",
  "Million-Dollar Networks Start Here.",
  "Bridge Worlds, Build Empires.",
  "Join the Dots, Score Big Wins.",
  "Sharp Links, Giant Leaps.",
  "One Tap, Infinite Paths.",
  "Contacts That Truly Matter.",
  "Turn Digits Into Dynasties.",
  "Start Small, Dream Monumental.",
  "Connect Fearlessly, Thrive Daily.",
  "Link Up, Level Beyond.",
  "Swipe Right to Success.",
  "Contacts In, Opportunities Unleashed.",
  "Tap In, Rise Up.",
  "Network Today, Win Tomorrow.",
  "Grow Circles, Harvest Gold.",
  "Meet, Match, Multiply Magic.",
  "From Hello to Hero.",
  "Unlock, Link, Lead Boldly.",
];

export default function Login() {
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const colors = useTheme();

  // Typewriter effect state
  const [displayedText, setDisplayedText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  // Animation refs
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    // Reset animations when phrase changes
    if (charIndex === 0) {
      slideAnim.setValue(-100);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          speed: 10,
          bounciness: 10,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 5,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    }

    if (charIndex < phrases[phraseIndex].length) {
      timeout = setTimeout(() => {
        setDisplayedText(prev => prev + phrases[phraseIndex][charIndex]);
        setCharIndex(prev => prev + 1);
      }, 50);
    } else {
      timeout = setTimeout(() => {
        setDisplayedText("");
        setCharIndex(0);
        setPhraseIndex(prev => (prev + 1) % phrases.length);
      }, 2000);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, phraseIndex, fadeAnim, slideAnim]);

  const handleGoogleSignIn = async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (error) {
      console.error("Error during Google Sign-In:", error);
    }
  };

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.loginContainer}>
        {/* Brand Section */}
        <View style={styles.brandSection}></View>

        {/* Login Section */}
        <View style={styles.loginSection}>
          {/* Animated Typewriter Catchy Phrase */}
          <Animated.Text
            style={[
              styles.appName,
              {
                transform: [{ translateX: slideAnim }],
                opacity: fadeAnim,
              },
            ]}
          >
            {displayedText}
          </Animated.Text>

          {/* Google Sign-In Button */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            activeOpacity={0.7}
          >
            <FontAwesome5
              name="google"
              size={20}
              color="#1877F3"
              style={{ marginHorizontal: 5 }}
            />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            By continuing, you agree to our Terms and Privacy Policy
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
}
