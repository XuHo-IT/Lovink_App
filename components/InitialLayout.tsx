  import { useAuth } from "@clerk/clerk-expo";
import { Slot, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";

  export default function InitialLayout() {
    const { isLoaded, isSignedIn } = useAuth();
    const segments = useSegments();
    const router = useRouter();
useEffect(() => {
  if (!isLoaded) return;
  const inAuthScreen = segments[0] === "(auth)";

  if (!isSignedIn && !inAuthScreen) {
    router.replace("/(auth)/sign-in");
  } else if (isSignedIn && inAuthScreen) {
    // ✅ force them out of /sign-in if already signed in
    router.replace("/(tabs)");
  }
}, [isLoaded, isSignedIn, segments]);


    if (!isLoaded) return null;

    return <Slot />;
  }
