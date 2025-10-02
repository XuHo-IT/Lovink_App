import { COLORS } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs, useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet } from "react-native";

export default function TabLayout() {
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: "#fff",
          tabBarStyle: {
            backgroundColor: "#6daaefff",
            borderTopWidth: 0,
            position: "absolute",
            elevation: 0,
            height: 50,
            paddingBottom: 8,
            paddingTop: 15,
          },
        }}
      >
     <Tabs.Screen
  name="index"
  options={{
    href: null,
     tabBarStyle: { display: "none" }, // 👈 tab sẽ bị ẩn, nhưng vẫn navigate được
    tabBarIcon: ({ size, color }) => (
      <Ionicons name="code-slash" size={size} color={color} />
    ),
  }}
/>

        <Tabs.Screen
          name="newsfed"
          options={{
            tabBarIcon: ({ size, color }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="activities"
          options={{
            tabBarIcon: ({ size, color }) => (
              <Ionicons name="flame" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="note"
         options={{ href: null }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ size, color }) => (
              <Ionicons name="person-circle" size={size} color={color} />
            ),
          }}
        />
        {/* 🔹 Remove unsed screen */}
        <Tabs.Screen name="quiz"
        
        options={{ href: null,  tabBarStyle: { display: "none" }, }} />
        <Tabs.Screen name="flame" options={{ href: null }} />
        <Tabs.Screen name="bookmark" options={{ href: null }} />
        <Tabs.Screen name="support"  
        options={{ href: null }}/>
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  menu: {
    backgroundColor: "#6daaefff",
    paddingVertical: 20,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  menuText: {
    marginLeft: 10,
    fontSize: 16,
    color: "white",
  },
});
