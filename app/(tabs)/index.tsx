import { api } from "@/convex/_generated/api";
import { styles } from "@/styles/auth.style";
import { useAuth } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useConvex, useMutation } from "convex/react";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";

const CoupleCodeScreen: React.FC = () => {
  const [myCode, setMyCode] = useState("");
  const [loverCode, setLoverCode] = useState("");
  const [showMyCode, setShowMyCode] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const convex = useConvex();
  const connectCouple = useMutation(api.users.connectCouple);
  const { userId } = useAuth();
  const router = useRouter();

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
      alert("Lover found ✅");
    } catch (err) {
      console.error("Error finding lover:", err);
      alert("Error finding lover");
    }
  };

const handleConnect = async () => {
  try {
    if (!userId) {
      alert("User not authenticated");
      return;
    }

    // Gọi mutation và nhận về coupleId (string)
    const coupleId = await connectCouple({ myClerkId: userId, loverCode });

    if (coupleId) {
      // Lưu coupleId
      await AsyncStorage.setItem("coupleId", coupleId);
    }

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


  return (
    <View style={styles.container}>
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
          <TouchableOpacity
            style={[styles.button, styles.connectButton]}
            onPress={handleConnect}
          >
            <Text style={styles.buttonText}>Connect Couple</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>💖 Happy for you guys! 💖</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Add default export
export default CoupleCodeScreen;