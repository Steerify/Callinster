import { Dimensions, StyleSheet } from "react-native";

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loginContainer: {
    flex: 1,
  },
  brandSection: {
    alignItems: "center",
    marginTop: height * 0.12,
  },
  logo: {
    width: 100,
    height: 100,
  },
  name: {
    fontSize: 15,
    fontWeight: "400",
    fontFamily: "JetBrainsMono-Medium",
    color: "#ffffff",
    letterSpacing: 0,
    textAlign: "center",
    marginTop: 90,
    alignSelf: "center",
  },
  appName: {
    fontSize: 17,
    fontWeight: "600",
    fontFamily: "JetBrainsMono-Medium",
    color: "#ffffff",
    letterSpacing: 0.5,
    textAlign: "center",
    marginTop: 90,
    alignSelf: "center",
    lineHeight: 26,
    textShadowColor: "rgba(124,58,237,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  tagline: {
    fontSize: 16,
    color: "#a3a4a8",
    letterSpacing: 1,
    textTransform: "lowercase",
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  illustration: {
    width: width * 1,
    height: width * 1,
    maxHeight: 280,
  },
  loginSection: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 24,
    paddingBottom: 80,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginBottom: 20,
    marginTop: 30,
    width: "100%",
    maxWidth: 300,
    shadowColor: "#091556",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 5,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#091556",
    marginLeft: 8,
  },
  termsText: {
    textAlign: "center",
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    maxWidth: 280,
  },
});
