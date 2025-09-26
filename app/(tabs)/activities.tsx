import { ActivityCard } from "@/components/ActivityCard";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import React from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import activities from "../../constants/activities";

export default function ActivitiesScreen() {
const { user } = useUser();


const dbUser = useQuery(
  api.users.getUserByClerkId,
  user ? { clerkId: user.id } : "skip"
);

const relationshipType = useQuery(
  api.users.getRelationshipTypeByUser,
  dbUser?._id ? { userId: dbUser._id } : "skip"
);

  const handleActivityPress = (activity: any) => {
    router.push({
      pathname: '../camera' as any,
      params: {
        activityId: activity.id,
        activityTitle: activity.title,
      }
    });
  };

  if (relationshipType === undefined) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#ff5a5f" />
      </SafeAreaView>
    );
  }

  // Chưa có dữ liệu trong DB
  if (relationshipType === null) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Bạn chưa có type nào, hãy làm quiz!</Text>
      </SafeAreaView>
    );
  }

  // Map activity list theo type
  const activityList =
    relationshipType === "longDistance"
      ? activities.longDistance
      : relationshipType === "nearby"
      ? activities.nearby
      : [...activities.nearby, ...activities.longDistance];
  console.log("Activity List:", activityList);  
  // Subtitle
  const subtitle =
    relationshipType === "longDistance"
      ? "For long-distance couples 💌"
      : relationshipType === "nearby"
      ? "For nearby couples ❤️"
      : "For all couples 💕";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDFAF6" />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Recommended Activities</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View style={styles.activitiesContainer}>
          {activityList.map((activity) => (
            <ActivityCard
              key={activity.id}
              id={activity.id}
              title={activity.title}
              iconType={activity.iconType}
              onPress={() => handleActivityPress(activity)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFAF6" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDFAF6",
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  header: { paddingHorizontal: 26, paddingTop: 40, paddingBottom: 20 },
  title: { fontSize: 20, fontWeight: "700", color: "#0C092A" },
  subtitle: { fontSize: 16, color: "#555", marginTop: 5 },
  activitiesContainer: { paddingHorizontal: 20, gap: 12 },
});
