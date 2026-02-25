import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    ImageBackground,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 32;

type CarouselItem = {
  key: string;
  title: string;
  subtitle: string;
  action?: () => void;
  bgColor?: string;
  textColor?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  bgImage?: any;
};

interface CarouselProps {
  data: CarouselItem[];
}

export default function Carousel({ data }: CarouselProps) {
  const { colors } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const [current, setCurrent] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (data.length <= 1) return;
    const interval = setInterval(() => {
      const next = (current + 1) % data.length;
      Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
        scrollRef.current?.scrollTo({ x: next * CARD_WIDTH, animated: false });
        setCurrent(next);
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [current, data.length]);

  return (
    <View style={cStyles.wrapper}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onMomentumScrollEnd={e => {
            const newIndex = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
            setCurrent(newIndex);
          }}
          style={{ width: CARD_WIDTH }}
        >
          {data.map(item => {
            const CardContent = (
              <View style={[cStyles.card, { backgroundColor: item.bgColor || colors.primary, width: CARD_WIDTH }]}>
                <View style={cStyles.cardInner}>
                  {item.icon && (
                    <View style={[cStyles.iconBox, { backgroundColor: "rgba(255,255,255,0.18)" }]}>
                      <Ionicons name={item.icon} size={24} color={item.textColor || "#fff"} />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={[cStyles.title, { color: item.textColor || "#fff" }]} numberOfLines={1}>{item.title}</Text>
                    <Text style={[cStyles.subtitle, { color: item.textColor ? `${item.textColor}CC` : "rgba(255,255,255,0.82)" }]} numberOfLines={3}>{item.subtitle}</Text>
                  </View>
                  {item.action && (
                    <TouchableOpacity onPress={item.action} style={cStyles.actionBtn}>
                      <Ionicons name="arrow-forward" size={16} color={item.textColor || "#fff"} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );

            if (item.bgImage) {
              return (
                <ImageBackground key={item.key} source={item.bgImage} style={[cStyles.card, { width: CARD_WIDTH }]} imageStyle={{ borderRadius: 16, opacity: 0.55 }} resizeMode="cover">
                  <View style={cStyles.bgOverlay} />
                  <View style={cStyles.cardInner}>
                    {item.icon && (
                      <View style={[cStyles.iconBox, { backgroundColor: "rgba(255,255,255,0.18)" }]}>
                        <Ionicons name={item.icon} size={24} color={item.textColor || "#fff"} />
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={[cStyles.title, { color: item.textColor || "#fff" }]} numberOfLines={1}>{item.title}</Text>
                      <Text style={[cStyles.subtitle, { color: "rgba(255,255,255,0.85)" }]} numberOfLines={3}>{item.subtitle}</Text>
                    </View>
                    {item.action && (
                      <TouchableOpacity onPress={item.action} style={cStyles.actionBtn}>
                        <Ionicons name="arrow-forward" size={16} color="#fff" />
                      </TouchableOpacity>
                    )}
                  </View>
                </ImageBackground>
              );
            }
            return <View key={item.key}>{CardContent}</View>;
          })}
        </ScrollView>
      </Animated.View>

      {/* Dot indicators */}
      {data.length > 1 && (
        <View style={cStyles.dots}>
          {data.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => { scrollRef.current?.scrollTo({ x: i * CARD_WIDTH, animated: true }); setCurrent(i); }}>
              <View style={[cStyles.dot, { backgroundColor: i === current ? colors.primary : "#D1D5DB", width: i === current ? 18 : 6 }]} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const cStyles = StyleSheet.create({
  wrapper: { marginHorizontal: 16, marginBottom: 12 },
  card: { borderRadius: 16, overflow: "hidden", minHeight: 90 },
  cardInner: { flexDirection: "row", alignItems: "center", padding: 16, gap: 12 },
  bgOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(9,21,86,0.45)", borderRadius: 16 },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
  subtitle: { fontSize: 12, lineHeight: 18 },
  actionBtn: { padding: 8, backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 8 },
  dots: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 8, gap: 4 },
  dot: { height: 6, borderRadius: 3 },
});