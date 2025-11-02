import { ActivityIndicator, View } from "react-native";
import React, { useEffect, useState } from "react";

type LoaderProps = {
  size?: "small" | "large" | number;
  colors?: string[];
  intervalSpeed?: number;
  style?: object;
};

// Move the color state management outside the component
let currentColorIndex = 0;
let interval: ReturnType<typeof setInterval>;

const startColorInterval = (colors: string[], intervalSpeed: number) => {
  if (interval) clearInterval(interval);
  
  interval = setInterval(() => {
    currentColorIndex = (currentColorIndex + 1) % colors.length;
  }, intervalSpeed);
};

export default function Loader({
  size = 60,
  colors = ["white", "#3700B3", "#03DAC6"],
  intervalSpeed = 1000,
  style = {},
}: LoaderProps) {
  const [_, setUpdate] = useState(0); // Used to force re-render

  useEffect(() => {
    startColorInterval(colors, intervalSpeed);
    
    const updateListener = setInterval(() => {
      setUpdate(prev => prev + 1); // Force re-render to get latest color
    }, 100); // Update frequently enough for smooth transitions
    
    return () => {
      clearInterval(updateListener);
    };
  }, [colors, intervalSpeed]);

  return (
    <View style={[{ justifyContent: "center", alignItems: "center" }, style]}>
      <ActivityIndicator 
        size={size} 
        color={colors[currentColorIndex]} 
      />
    </View>
  );
}