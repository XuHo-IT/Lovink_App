import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/clerk-expo";
import { useConvex, useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import quizData from "../../constants/support";

export default function RelationshipQuiz() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const router = useRouter();
  const convex = useConvex();

  const { userId, isLoaded, isSignedIn } = useAuth();
  const [convexUser, setConvexUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ✅ fetch convex user from Clerk id
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      const user = await convex.query(api.users.getUserByClerkId, {
        clerkId: userId,
      });
      setConvexUser(user);
      setLoading(false);
    };
    fetchUser();
  }, [userId]);

  // ✅ check quiz completion only after convexUser is loaded
  const hasCompleted = useQuery(
    api.quiz.hasCompletedQuiz,
    convexUser ? { userId: convexUser._id, quizId: "relationshipQuiz1" } : "skip"
  );

  useEffect(() => {
    if (!loading && hasCompleted) {
      router.replace("/(tabs)/support");
    }
  }, [loading, hasCompleted]);

  const currentQuestion = quizData[currentIndex];
  const handleSelect = (option: string) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentIndex] = option;
    setAnswers(updatedAnswers);
  };

  const completeQuiz = useMutation(api.quiz.completeQuiz);

  const handleNext = async () => {
    if (currentIndex < quizData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      await completeQuiz({
        userId: convexUser._id,
        quizId: "relationshipQuiz1",
      });
      setShowFinishModal(true);
    }
  };

  if (loading || !convexUser) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDFAF6" />

      {/* Question */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option, index) => {
          const isSelected = answers[currentIndex] === option;
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                isSelected && styles.optionButtonSelected,
              ]}
              onPress={() => handleSelect(option)}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            !answers[currentIndex] && { backgroundColor: "#ccc" },
          ]}
          disabled={!answers[currentIndex]}
          onPress={handleNext}
        >
          <Text style={styles.footerText}>
            {currentIndex < quizData.length - 1 ? "Next" : "Finish"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ✅ Finish Modal */}
      <Modal
        visible={showFinishModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFinishModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎉 Thanks for your support!</Text>
            <Text style={styles.modalSubtitle}>
              We will develop new features according to your answers soon. Be
              ready !!
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowFinishModal(false);
                router.replace("/(tabs)/support");
              }}
            >
              <Text style={styles.modalButtonText}>Go back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: "#FDFAF6", paddingHorizontal: 20 }, questionContainer: { marginBottom: 20, marginTop: 40, marginLeft: 10,marginRight:5 }, questionText: { fontSize: 20, fontWeight: "700", color: "#0C092A" }, optionsContainer: { flex: 1, marginTop: 10 }, optionButton: { backgroundColor: "#fff", padding: 20, marginVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: "#ddd", }, optionText: { fontSize: 16, color: "#333" }, footer: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 40, paddingBottom: 340, }, cancelButton: { backgroundColor: "#F2C94C", padding: 12, borderRadius: 10, flex: 1, marginRight: 8, }, nextButton: { backgroundColor: "#27AE60", padding: 12, borderRadius: 10, flex: 1, marginLeft: 8, }, footerText: { textAlign: "center", fontSize: 16, fontWeight: "600", color: "#fff", }, modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)", }, modalContent: { backgroundColor: "#fff", padding: 25, borderRadius: 12, alignItems: "center", width: "80%", }, modalTitle: { fontSize: 22, fontWeight: "700", marginBottom: 10 }, modalSubtitle: { fontSize: 16, color: "#555", marginBottom: 20, textAlign: "center", }, modalButton: { backgroundColor: "#27AE60", paddingVertical: 12, paddingHorizontal: 25, borderRadius: 8, }, modalButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" }, optionButtonSelected: { backgroundColor: "#27AE60", borderColor: "#27AE60", }, optionTextSelected: { color: "#fff", fontWeight: "700" }, });