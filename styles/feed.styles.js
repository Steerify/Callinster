import { Dimensions, StyleSheet } from "react-native";
import { COLORS } from "../constants/theme";
import { patterns, radius, spacing, typography } from "./tokens";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: spacing.md,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.xs,
    backgroundColor: COLORS.white,
    borderRadius: radius.pill,
    alignSelf: "center",
    marginTop: spacing.sm,
    marginLeft: spacing.md,
    marginBottom: -6,
    width: Math.min(270, width * 0.82),
  },
  menuButton: {
    marginRight: spacing.sm,
    marginLeft: spacing.sm,
    color: COLORS.primary,
  },
  header: {
    ...patterns.header,
    justifyContent: "space-between",
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: radius.pill,
    padding: spacing.sm,
    fontSize: typography.body.fontSize,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  text: {
    color: COLORS.white,
    ...typography.bodyStrong,
    fontFamily: "JetBrainsMono-Medium",
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: radius.lg,
    marginVertical: spacing.xs,
    padding: spacing.md,
    shadowColor: "#091556",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  name: {
    color: COLORS.primary,
    ...typography.title,
    fontFamily: "JetBrainsMono-Medium",
    marginBottom: spacing.xs,
    flex: 1,
  },
  appName: {
    color: COLORS.primary,
    ...typography.title,
    fontFamily: "JetBrainsMono-Medium",
    alignContent: "center",
    flex: 1,
  },
  phone: {
    color: "#4A5568",
    fontSize: typography.body.fontSize,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  button: {
    ...patterns.button,
    backgroundColor: COLORS.secondary,
    marginVertical: spacing.xs,
  },
  buttonText: {
    color: COLORS.white,
    ...typography.bodyStrong,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(9,21,86,0.07)",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    padding: spacing.xl,
    borderRadius: radius.xl,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.sm,
    fontSize: typography.body.fontSize,
    backgroundColor: "#F7FAFC",
    color: "#1b3872",
  },
  prefixRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
    marginBottom: 2,
  },
  prefixText: {
    color: "#1b3872",
    fontSize: typography.body.fontSize,
  },
  removeText: {
    color: COLORS.heart,
    marginLeft: spacing.sm,
    ...typography.bodyStrong,
  },
});
