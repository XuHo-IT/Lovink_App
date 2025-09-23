// app/force-logout.tsx
import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function ForceLogout() {
  const { isLoaded, isSignedIn, signOut } = useAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      signOut(); // remove cached session
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Redirect href="/(auth)/sign-in" />;
}
