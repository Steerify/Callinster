import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  Modal,
} from "react-native";
import { COLORS } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

const { width } = Dimensions.get("window");

interface CallinsterCarouselProps {
  visible: boolean;
  onClose: () => void;
}

const CallinsterCarousel: React.FC<CallinsterCarouselProps> = ({
  visible,
  onClose,
}) => {
  const { colors } = useTheme();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<FlatList>(null);

  const slides = [
    {
      id: "1",
      title: "Welcome to Callinster",
      description:
        "Your intelligent contact management system that helps you build and maintain valuable connections effortlessly.",
      image: {
        uri: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      },
    },
    {
      id: "2",
      title: "Smart Contact Curation",
      description:
        "We analyze your network to surface the most relevant contacts at the right time based on your preferences.",
      image: {
        uri: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      },
    },
    {
      id: "3",
      title: "Seamless Communication",
      description:
        "Integrated calling and messaging across all platforms with intelligent scheduling and reminders.",
      image: {
        uri: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      },
    },
    {
      id: "4",
      title: "Network Growth",
      description:
        "Discover new connections and opportunities through our smart recommendation engine.",
      image: {
        uri: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80",
      },
    },
  ];

  const renderItem = ({ item }: { item: (typeof slides)[0] }) => (
    <View style={[styles.slide, { backgroundColor: colors.surface }]}>
      {item.image && (
        <Image source={item.image} style={styles.image} resizeMode="contain" />
      )}
      <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {item.description}
      </Text>
    </View>
  );

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => {
          const dotWidth = scrollX.interpolate({
            inputRange: [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ],
            outputRange: [8, 16, 8],
            extrapolate: "clamp",
          });

          const dotColor = scrollX.interpolate({
            inputRange: [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ],
            outputRange: [
              colors.placeholder,
              colors.primary,
              colors.placeholder,
            ],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  backgroundColor: dotColor,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  const scrollTo = (index: number) => {
    if (carouselRef.current) {
      carouselRef.current.scrollToIndex({ index });
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            About Callinster
          </Text>
          <View style={styles.headerDivider} />
        </View>

        <FlatList
          ref={carouselRef}
          data={slides}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onMomentumScrollEnd={e => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentIndex(index);
          }}
          keyExtractor={item => item.id}
        />

        {renderDots()}

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: colors.surfaceLight }]}
            onPress={() => scrollTo(currentIndex - 1)}
            disabled={currentIndex === 0}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={currentIndex === 0 ? colors.placeholder : colors.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.ctaButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              if (currentIndex === slides.length - 1) {
                onClose();
              } else {
                scrollTo(currentIndex + 1);
              }
            }}
          >
            <Text style={[styles.ctaText, { color: colors.buttonText }]}>
              {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: colors.surfaceLight }]}
            onPress={() => scrollTo(currentIndex + 1)}
            disabled={currentIndex === slides.length - 1}
          >
            <Ionicons
              name="chevron-forward"
              size={24}
              color={
                currentIndex === slides.length - 1
                  ? colors.placeholder
                  : colors.primary
              }
            />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 20,
  },
  header: {
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginBottom:10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  headerDivider: {
    height: 3,
    width: 40,
    backgroundColor: COLORS.secondary,
    alignSelf: "center",
    marginTop: 8,
    borderRadius: 2,
  },
  slide: {
    width: width - 40,
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  ctaButton: {
    flex: 1,
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  ctaText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CallinsterCarousel;
