import { styles } from "@/styles/auth.styles";
import { useSSO } from "@clerk/clerk-expo";
import { FontAwesome5 } from "@expo/vector-icons";
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ImageBackground,
  Animated as RNAnimated,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
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

  // Animation refs (Legacy Animated for text)
  const slideAnim = useRef(new RNAnimated.Value(-300)).current;
  const fadeAnim = useRef(new RNAnimated.Value(0)).current;

  // Reanimated shared value for button scale
  const buttonScale = useSharedValue(1);

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    // Reset animations when phrase changes
    if (charIndex === 0) {
      slideAnim.setValue(-100);
      fadeAnim.setValue(0);
      RNAnimated.parallel([
        RNAnimated.spring(slideAnim, {
          toValue: 0,
          speed: 10,
          bounciness: 10,
          useNativeDriver: true,
        }),
        RNAnimated.timing(fadeAnim, {
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

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1);
  };

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.container}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)']}
        style={styles.gradientOverlay}
      >
        <View style={styles.loginContainer}>
          {/* Brand Section */}
          <View style={styles.brandSection}></View>

          {/* Login Section with Blur */}
          <View style={styles.loginWrapper}>
            <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
              <View style={[styles.loginSection, { backgroundColor: 'transparent' }]}>
                {/* Animated Typewriter Catchy Phrase */}
                <RNAnimated.Text
                  style={[
                    styles.appName,
                    {
                      transform: [{ translateX: slideAnim }],
                      opacity: fadeAnim,
                    },
                  ]}
                >
                  {displayedText}
                </RNAnimated.Text>

                {/* Google Sign-In Button */}
                <Animated.View style={[buttonAnimatedStyle, { width: '100%', alignItems: 'center' }]}>
                  <TouchableOpacity
                    style={styles.googleButton}
                    onPress={handleGoogleSignIn}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    activeOpacity={0.9}
                  >
                    <FontAwesome5
                      name="google"
                      size={20}
                      color="#1877F3"
                      style={{ marginHorizontal: 5 }}
                    />
                    <Text style={styles.googleButtonText}>Continue with Google</Text>
                  </TouchableOpacity>
                </Animated.View>

                <Text style={styles.termsText}>
                  By continuing, you agree to our Terms and Privacy Policy
                </Text>
              </View>
            </BlurView>
          </View>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
}
