import { Dimensions, StyleSheet } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;

export const carouselStyles = StyleSheet.create({
  carouselContainer: {
    marginVertical: 20,
    height: 120,
    overflow: "hidden",
  },
  itemContainer: {
    width: SCREEN_WIDTH * 0.83,
    marginHorizontal: SCREEN_WIDTH * 0.04,
    height: 100,
    borderRadius: 16,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#1E254B",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#D0D7F5",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#5A38F5",
    marginHorizontal: 4,
  },
});


