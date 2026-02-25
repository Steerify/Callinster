import { useSSO } from "@clerk/clerk-expo";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const backgroundImage = require("../../assets/images/CallinsterBg.png");
const { height } = Dimensions.get("window");

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
  "Network Today, Win Tomorrow.",
  "Grow Circles, Harvest Gold.",
  "From Hello to Hero.",
  "Unlock, Link, Lead Boldly.",
];

export default function Login() {
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  const [displayedText, setDisplayedText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  const slideAnim = useRef(new Animated.Value(-100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (charIndex === 0) {
      slideAnim.setValue(-80);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          speed: 12,
          bounciness: 8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }

    if (charIndex < phrases[phraseIndex].length) {
      timeout = setTimeout(() => {
        setDisplayedText(prev => prev + phrases[phraseIndex][charIndex]);
        setCharIndex(prev => prev + 1);
      }, 45);
    } else {
      timeout = setTimeout(() => {
        setDisplayedText("");
        setCharIndex(0);
        setPhraseIndex(prev => (prev + 1) % phrases.length);
      }, 2400);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, phraseIndex]);

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
      {/* Subtle dark overlay */}
      <View style={styles.overlay} />

      <View style={styles.loginContainer}>
        {/* Brand Section - top spacer */}
        <View style={styles.brandSection} />

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
            <Text style={styles.cursor}>|</Text>
          </Animated.Text>

          {/* Google Sign-In Button */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            activeOpacity={0.85}
          >
            <FontAwesome5
              name="google"
              size={20}
              color="#1877F3"
              style={{ marginRight: 10 }}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(9,21,86,0.35)",
  },
  loginContainer: {
    flex: 1,
  },
  brandSection: {
    marginTop: height * 0.12,
  },
  appName: {
    fontSize: 17,
    fontWeight: "600",
    fontFamily: "JetBrainsMono-Medium",
    color: "#ffffff",
    letterSpacing: 0.5,
    textAlign: "center",
    marginBottom: 8,
    paddingHorizontal: 20,
    lineHeight: 26,
    textShadowColor: "rgba(124,58,237,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  cursor: {
    color: "#c090f1",
    fontWeight: "200",
  },
  loginSection: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 24,
    paddingBottom: 72,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 16,
    marginBottom: 20,
    marginTop: 40,
    width: "100%",
    maxWidth: 320,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#091556",
    letterSpacing: 0.3,
  },
  termsText: {
    textAlign: "center",
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
    maxWidth: 280,
    lineHeight: 18,
  },
});
