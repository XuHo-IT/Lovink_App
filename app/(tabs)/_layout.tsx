import { COLORS } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
            paddingTop:15,
          },
        }}
      >
        <Tabs.Screen
  name="index"
  options={{
    tabBarButton: (props) => (
      <TouchableOpacity
        onPress={() => setMenuVisible(true)}
        style={{ alignItems: "center", justifyContent: "center", marginTop: 5 }}
      >
        <Ionicons name="home" size={24} color="#FF6B9C" />
      </TouchableOpacity>
    ),
  }}
/>
        <Tabs.Screen
          name="flame"
          options={{
            tabBarIcon: ({ size, color }) => (
              <Ionicons name="flame" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="note"
          options={{
            tabBarIcon: ({ size, color }) => (
              <Ionicons name="create" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ size, color }) => (
              <Ionicons name="person-circle" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen name="bookmark" options={{ href: null }} />
        <Tabs.Screen name="create" options={{ href: null }} />
        <Tabs.Screen name="notification" options={{ href: null }} />
      </Tabs>
      

      {/* 🔹 Popup Menu cho index */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.menu}>
              <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push("/");

              }}
            >
              <Ionicons name="home" size={22} color="#FF6B9C" />
              <Text style={styles.menuText}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push("/bookmark");
              }}
            >
              <Ionicons name="bookmarks" size={22} color="#FF6B9C" />
              <Text style={styles.menuText}>Bookmark</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push("/create");
              }}
            >
              <Ionicons name="add-circle" size={22} color="#FF6B9C" />
              <Text style={styles.menuText}>Create</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push("/notification");
              }}
            >
              <Ionicons name="heart" size={22} color="#FF6B9C" />
              <Text style={styles.menuText}>Notification</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
