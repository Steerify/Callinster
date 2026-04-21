import { StyleSheet } from "react-native";
import { COLORS } from "@/constants/theme";
import { iconSize, patterns, radius, spacing, typography } from "./tokens";

export const createNotificationsStyles = () =>
  StyleSheet.create({
    screen: { flex: 1 },
    header: patterns.header,
    headerIcon: { width: 28, height: 28, marginRight: spacing.xs },
    headerTitle: { ...typography.title, flex: 1 },
    countPill: { paddingHorizontal: spacing.sm - 2, paddingVertical: spacing.xxs - 1, borderRadius: radius.pill },
    sectionSpacing: { paddingBottom: spacing.xl },
    listStyle: { marginBottom: 80, paddingHorizontal: spacing.xxs },
    listContent: { paddingVertical: spacing.xxs },
    upgradeCard: {
      ...patterns.card,
      margin: spacing.md,
      borderWidth: 1.5,
      flexDirection: "row",
      overflow: "hidden",
    },
    upgradeIllustration: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.md },
    upgradeContent: { flex: 2, padding: spacing.md },
    upgradeTitle: { ...typography.titleSmall, marginBottom: spacing.xs },
    upgradeText: { color: COLORS.grey, ...typography.bodySmall, marginBottom: spacing.sm, lineHeight: 19 },
    featureRow: { flexDirection: "row", alignItems: "center", marginBottom: spacing.xxs - 1 },
    featureText: { ...typography.bodySmall, marginLeft: spacing.xs - 2 },
    upgradeBtn: { ...patterns.button, borderRadius: radius.md - 2, marginTop: spacing.sm },
    upgradeBtnText: { color: COLORS.white, ...typography.bodyStrong },
    emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40, paddingTop: 40 },
    emptyIconWrap: {
      width: 96,
      height: 96,
      borderRadius: radius.pill,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.lg,
    },
    emptyTitle: { ...typography.title, marginBottom: spacing.xs },
    emptySubtitle: { ...typography.body, textAlign: "center", lineHeight: 20 },
    pullHint: { ...typography.bodySmall, marginTop: spacing.xs },
    heartIcon: { size: iconSize.xl },
  });
