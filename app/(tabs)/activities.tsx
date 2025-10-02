import { ActivityCard } from "@/components/ActivityCard";
import { api } from "@/convex/_generated/api";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import activities from "../../constants/activities";
import { COLORS } from "../../constants/theme";

const ITEMS_PER_PAGE = 10;

export default function ActivitiesScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  const dbUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  const relationshipType = useQuery(
    api.users.getRelationshipTypeByUser,
    dbUser?._id ? { userId: dbUser._id } : "skip"
  );

  const [currentPage, setCurrentPage] = useState(1);

  // Map activity list theo type
  const activityList =
    relationshipType === "longDistance"
      ? activities.longDistance
      : relationshipType === "nearby"
      ? activities.nearby
      : [...activities.nearby, ...activities.longDistance];

  // Pagination
  const totalPages = Math.ceil(activityList.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = activityList.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Get completion status for current page activities
  const currentActivityIds = currentItems.map(activity => activity.id);
  const completionStatus = useQuery(
    api.activityCompletions.getActivitiesCompletionStatus,
    dbUser?._id && currentActivityIds.length > 0 
      ? { userId: dbUser._id, activityIds: currentActivityIds }
      : "skip"
  );

  if (relationshipType === undefined || completionStatus === undefined) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#ff5a5f" />
      </SafeAreaView>
    );
  }

  if (relationshipType === null) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Sorry for your lost...!</Text>
      </SafeAreaView>
    );
  }

  const handleActivityPress = (activity: any) => {
    router.push({
      pathname: '../camera' as any,
      params: {
        activityId: activity.id,
        activityTitle: activity.title,
      }
    });
  };

  // Pagination generator with ellipsis
  const generatePagination = (currentPage: number, totalPages: number) => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, 6, "...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(
          1,
          "...",
          totalPages - 5,
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }
    return pages;
  };

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
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.username}>
              Welcome {dbUser?.fullname || "User"}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerIcon} onPress={() => signOut()}>
              <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <Text style={styles.title}>Recommended Activities</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>       
        </View>

        <View style={styles.activitiesContainer}>
          {currentItems.map((activity) => (
            <ActivityCard
              key={activity.id}
              id={activity.id}
              title={activity.title}
              iconType={activity.iconType}
              onPress={() => handleActivityPress(activity)}
              isCompleted={completionStatus?.[activity.id] || false}
            />
          ))}
        </View>

        {/* Pagination bar */}
        <View style={styles.paginationContainer}>
          {generatePagination(currentPage, totalPages).map((page, index) => {
            if (page === "...") {
              return (
                <Text key={`ellipsis-${index}`} style={styles.ellipsis}>
                  ...
                </Text>
              );
            }
            return (
              <TouchableOpacity
                key={page}
                style={[
                  styles.pageButton,
                  currentPage === page && styles.activePage,
                ]}
                onPress={() => setCurrentPage(page as number)}
              >
                <Text
                  style={[
                    styles.pageText,
                    currentPage === page && styles.activePageText,
                  ]}
                >
                  {page}
                </Text>
              </TouchableOpacity>
            );
          })}
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
  title: { fontSize: 20, fontWeight: "700", color: "#0C092A" },
  subtitle: { fontSize: 16, color: "#555", marginTop: 5 },
  activitiesContainer: { paddingHorizontal: 20, gap: 12 },
header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomColor: COLORS.surface,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  username: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.white,
  },
  headerRight: {
    flexDirection: "row",
    gap: 16,
  },
  headerIcon: {
    padding: 4,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 16,
    flexWrap: "wrap",
  },
  pageButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 6,
    backgroundColor: "#eee",
  },
  activePage: {
    backgroundColor: "#ff5a5f",
  },
  pageText: {
    fontSize: 14,
    color: "#333",
  },
  activePageText: {
    color: "#fff",
    fontWeight: "bold",
  },
  ellipsis: {
    marginHorizontal: 6,
    fontSize: 16,
    color: "#666",
  },
});
