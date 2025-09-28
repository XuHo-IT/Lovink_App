import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "convex/react";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import questions from "../../constants/question-data";

const quizData = questions;

export default function QuizScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [answers, setAnswers] = useState([]);
  const router = useRouter();

  const currentQuestion = quizData[currentIndex];
  const [coupleId, setCoupleId] = useState<string | null>(null);
  const updateRelationshipType = useMutation(api.users.updateRelationshipType);

  useEffect(() => {
    const loadCoupleId = async () => {
      const id = await AsyncStorage.getItem("coupleId");
      setCoupleId(id);
    };
    loadCoupleId();
  }, []);

  const handleSelect = (option) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentIndex] = option;
    setAnswers(updatedAnswers);
  };

  const handleNext = () => {
    if (currentIndex < quizData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowFinishModal(true);
    }
  };

  const handleFinish = async () => {
    setShowFinishModal(false);

    const firstAnswer = answers[0];
    let relationshipType = "nearby";
    if (firstAnswer === "Long Distance") {
      relationshipType = "longDistance";
    }

    if (!coupleId) {
      alert("❌ Couple ID not found");
      return;
    }
    await updateRelationshipType({
      coupleId: coupleId as Id<"couples">,
      relationshipType,
    });
    await AsyncStorage.setItem("relationshipType", relationshipType);

    router.replace({
      pathname: "/activities",
      params: { relationshipType },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDFAF6" />

      {/* Question */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
      </View>

      {/* Options */}
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


      {/* Footer Buttons */}
      <View style={styles.footer}>


        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
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
            <Text style={styles.modalTitle}>🎉 Quiz Completed!</Text>
            <Text style={styles.modalSubtitle}>
              Great job, you are ready now with your soulmate.
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleFinish}>
              <Text style={styles.modalButtonText}>Go to Activities</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFAF6", paddingHorizontal: 20 },
 questionContainer: { marginBottom: 20, marginTop: 40, marginLeft: 10,marginRight:5 },
  questionText: { fontSize: 20, fontWeight: "700", color: "#0C092A" },
  optionsContainer: { flex: 1, marginTop: 10 },
  optionButton: {
    backgroundColor: "#fff",
    padding: 20,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  optionText: { fontSize: 16, color: "#333" },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 105,
    paddingBottom: 430,
  },
  cancelButton: {
    backgroundColor: "#F2C94C",
    padding: 12,
    borderRadius: 10,
    flex: 1,
    marginRight: 8,
  },
  nextButton: {
    backgroundColor: "#27AE60",
    padding: 12,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 8,
  },
  quitButton: {
    backgroundColor: "#EB5757",
    padding: 12,
    borderRadius: 10,
    flex: 1,
    marginLeft: 8,
  },
  footerText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 12,
    alignItems: "center",
    width: "80%",
  },
  modalTitle: { fontSize: 22, fontWeight: "700", marginBottom: 10 },
  modalSubtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
    textAlign: "center",
  },
  modalButton: {
    backgroundColor: "#27AE60",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  modalButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },

optionButtonSelected: {
  backgroundColor: "#27AE60", // green when selected
  borderColor: "#27AE60",
},
optionTextSelected: { color: "#fff", fontWeight: "700" },
});
