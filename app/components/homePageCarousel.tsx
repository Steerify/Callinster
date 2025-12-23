import React, { useRef, useEffect } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { carouselStyles } from "../../styles/carousel.styles";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type CarouselItem = {
  key: string;
  title: string;
  subtitle: string;
  action: () => void;
  bgColor: string;
  textColor: string;
  icon: string;
  bgImage?: any; // Only added this line
};

type CarouselProps = {
  data: CarouselItem[];
  interval?: number;
};

export default function Carousel({ data, interval = 8000 }: CarouselProps) {
  const carouselRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const currentIndexRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (data.length > 1) {
      startAutoScroll();
    }
    return () => stopAutoScroll();
  }, [data]);

  const startAutoScroll = () => {
    stopAutoScroll();
    timerRef.current = setInterval(() => {
      const nextIndex = (currentIndexRef.current + 1) % data.length;
      carouselRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      currentIndexRef.current = nextIndex;
    }, interval) as unknown as number;
  };

  const stopAutoScroll = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const contentOffset = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffset / SCREEN_WIDTH);
        currentIndexRef.current = index;
      },
    }
  );

  // Modified render function
  const renderCarouselItem = ({ item, index }: { item: CarouselItem; index: number }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={item.action}
      style={[carouselStyles.itemContainer, { backgroundColor: item.bgColor }]}
    >
      {/* Only added this conditional background image */}
      {index === 0 && item.bgImage && (
        <Image 
          source={item.bgImage} 
          style={{
            position: 'absolute',
            width: 300,
            height: '200%',
            opacity: 0.7,
             borderRadius: 70 ,
          }}
          resizeMode="cover"
        />
      )}
      <View style={carouselStyles.itemContent}>
        <Ionicons
          name={item.icon as any}
          size={28}
          color={item.textColor}
          style={carouselStyles.icon}
        />
        <View style={carouselStyles.textContainer}>
          <Text style={[carouselStyles.title, { color: item.textColor }]}>
            {item.title}
          </Text>
          <Text style={[carouselStyles.subtitle, { color: item.textColor }]}>
            {item.subtitle}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Unchanged pagination
  const renderPagination = () => {
    return (
      <View style={carouselStyles.pagination}>
        {data.map((_, index) => {
          const opacity = scrollX.interpolate({
            inputRange: [
              (index - 1) * SCREEN_WIDTH,
              index * SCREEN_WIDTH,
              (index + 1) * SCREEN_WIDTH,
            ],
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={index}
              style={[carouselStyles.dot, { opacity }]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={carouselStyles.carouselContainer}>
      <FlatList
        ref={carouselRef}
        data={data}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        renderItem={(props) => renderCarouselItem({ ...props, index: props.index })}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onTouchStart={stopAutoScroll}
        onTouchEnd={startAutoScroll}
        onMomentumScrollEnd={() => {
          startAutoScroll();
        }}
      />
      {renderPagination()}
    </View>
  );
}