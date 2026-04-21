import { Dimensions, StyleSheet } from "react-native";
import { radius, spacing, typography } from "./tokens";

const SCREEN_WIDTH = Dimensions.get("window").width;

export const carouselStyles = StyleSheet.create({
  carouselContainer: {
    marginVertical: spacing.lg,
    height: 120,
    overflow: "hidden",
  },
  itemContainer: {
    width: SCREEN_WIDTH * 0.83,
    marginHorizontal: SCREEN_WIDTH * 0.04,
    height: 100,
    borderRadius: radius.lg,
    justifyContent: "center",
    padding: spacing.md,
    backgroundColor: "#1E254B",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemContent: { flexDirection: "row", alignItems: "center" },
  icon: { marginRight: spacing.md },
  textContainer: { flex: 1 },
  title: {
    ...typography.titleSmall,
    color: "#FFFFFF",
    marginBottom: spacing.xxs,
  },
  subtitle: {
    ...typography.body,
    color: "#D0D7F5",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  dot: {
    width: spacing.xs,
    height: spacing.xs,
    borderRadius: spacing.xxs,
    backgroundColor: "#5A38F5",
    marginHorizontal: spacing.xxs,
  },
});
