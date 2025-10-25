import { StyleSheet, Dimensions } from "react-native";
import { COLORS } from "../constants/theme";

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    color: COLORS.white,
    letterSpacing: 0,
    textAlign: "center",
    marginTop: 90,
    alignSelf: 'center', 
},
 appName: {
    fontSize: 15,
    fontWeight: "400",
    fontFamily: "JetBrainsMono-Medium",
    color: COLORS.white,
    letterSpacing: 0,
    textAlign: "center",
    marginTop: 90,
    alignSelf: 'center', 
},
  tagline: {
    fontSize: 16,
    color: COLORS.grey,
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
    flex:1,
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
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginBottom: 20,
    marginTop: 30,

    width: "100%",
    maxWidth: 300,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
  },
  termsText: {
    textAlign: "center",
    fontSize: 12,
    color: COLORS.grey,
    maxWidth: 280,
  },
});

