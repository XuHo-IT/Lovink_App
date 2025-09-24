import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { styles } from "@/styles/auth.style";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useConvex, useMutation } from "convex/react";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CoupleCodeScreen() {
  const [myCode, setMyCode] = useState("");
  const [loverCode, setLoverCode] = useState("");
  const [showMyCode, setShowMyCode] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [loverConfirmModal, setLoverConfirmModal] = useState(false);
  const [loverConflictModal, setLoverConflictModal] = useState(false);
  const [selectedLover, setSelectedLover] = useState<any>(null);
  const [checking, setChecking] = useState(true);

  const convex = useConvex();
  const connectCouple = useMutation(api.users.connectCouple);
  const { isLoaded, isSignedIn, userId,signOut } = useAuth();
  const router = useRouter();
  // 🔎 Check relationship on mount
  useEffect(() => {
    const checkRelationship = async () => {
      if (!isLoaded) return;
      if (!isSignedIn) {
        router.replace("/(auth)/sign-in");
        return;
      }

      try {
        const convexUser = await convex.query(api.users.getUserByClerkId, {
          clerkId: userId!,
        });

        if (!convexUser) {
          setChecking(false);
          return;
        }

        const relationship = await convex.query(
          api.users.getRelationshipTypeByUser,
          { userId: convexUser._id }
        );

        if (relationship) {
          router.replace("/(tabs)/newsfed");
        } else {
          setChecking(false);
        }
      } catch (err) {
        console.error("Relationship check failed:", err);
        setChecking(false);
      }
    };

    checkRelationship();
  }, [isLoaded, isSignedIn, userId]);

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // ==== HANDLERS ====
  const handleGetMyCode = async () => {
    try {
      if (!userId) {
        alert("User not authenticated");
        return;
      }
      const code = await convex.query(api.users.getUserCode, { clerkId: userId });
      setMyCode(code);
    } catch (err) {
      console.error("Error fetching my code:", err);
      alert("Failed to fetch your code");
    }
  };

  const handleGetLoverCode = async () => {
    try {
      const lover = await convex.query(api.users.getUserByCode, { code: loverCode });
      if (!lover) {
        alert("Lover not found ❌");
        return;
      }

      // 🔎 check if lover already in a relationship
      const loverRelationship = await convex.query(
        api.users.getRelationshipTypeByUser,
        { userId: lover._id }
      );

      if (loverRelationship) {
        setSelectedLover(lover);
        setLoverConflictModal(true); // ❌ already has soulmate
      } else {
        setSelectedLover(lover);
        setLoverConfirmModal(true); // ✅ ask confirmation
      }
    } catch (err) {
      console.error("Error finding lover:", err);
      alert("Error finding lover");
    }
  };

  const handleConfirmConnect = async () => {
    try {
      if (!userId || !selectedLover) {
        alert("User not authenticated");
        return;
      }

      const coupleId = await connectCouple({
        myClerkId: userId,
        loverCode,
      });

      if (coupleId) {
        await AsyncStorage.setItem("coupleId", coupleId);
      }

      setLoverConfirmModal(false);
      setModalVisible(true);

      setTimeout(() => {
        setModalVisible(false);
        router.replace("/(tabs)/quiz");
      }, 2000);
    } catch (err) {
      console.error("Error connecting couple:", err);
      alert("Failed to connect 💔");
    }
  };

  // ==== UI ====
  return (
    <View style={styles.container}>
          <View style={styles.header}>
        <View style={styles.headerLeft}>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon} onPress={() => signOut()}>
            <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.title}>Couple Code</Text>

      {showMyCode ? (
        <View style={styles.section}>
          <Text style={styles.label}>Your Code</Text>
          <TextInput
            style={styles.input}
            placeholder="Your code will appear here"
            value={myCode}
            editable={false}
          />
          <TouchableOpacity style={styles.button} onPress={handleGetMyCode}>
            <Text style={styles.buttonText}>Get My Code</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowMyCode(false)}>
            <Text style={styles.linkText}>Back to Lover's Code</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.label}>Lover's Code</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter lover's code"
            value={loverCode}
            onChangeText={setLoverCode}
          />
          <TouchableOpacity style={styles.button} onPress={handleGetLoverCode}>
            <Text style={styles.buttonText}>Find Lover</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowMyCode(true)}>
            <Text style={styles.linkText}>Get your code?</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Success Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>💖 Happy for you guys! 💖</Text>
          </View>
        </View>
      </Modal>

      {/* Lover confirmation modal */}
      <Modal visible={loverConfirmModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>
              Is this your lover? 💕{"\n"}
              {selectedLover?.fullname || "Unknown"}
            </Text>
            <View style={{ flexDirection: "row", marginTop: 10 }}>
              <TouchableOpacity
                style={[styles.button, { marginRight: 10 }]}
                onPress={handleConfirmConnect}
              >
                <Text style={styles.buttonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "gray" }]}
                onPress={() => setLoverConfirmModal(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Conflict modal */}
      <Modal visible={loverConflictModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>
              Sorry 😢{"\n"}
              {selectedLover?.name || "This person"} already has another soulmate 💔
            </Text>
            <TouchableOpacity
              style={[styles.button, { marginTop: 10 }]}
              onPress={() => setLoverConflictModal(false)}
            >
              <Text style={styles.buttonText}>Okay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
