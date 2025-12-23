import { useAuth } from "@clerk/clerk-expo";
import { useSegments, useRouter, Stack } from "expo-router";
import { useEffect } from "react";
import Loader from "./Loader";

export default function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments()  ;
  const router = useRouter(); 

useEffect(() => {
  if (!isLoaded) return;
  // This will work for nested routes too
  const inAuthScreen = segments[0] ==="(auth)"

  if (!isSignedIn && !inAuthScreen) router.replace("/(auth)/login");
  else if (isSignedIn && inAuthScreen) router.replace("/(tabs)");
}, [isLoaded, isSignedIn, segments, router]);

  if (!isLoaded) return <Loader />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
