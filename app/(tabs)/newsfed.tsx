import { Loader } from "@/components/Loader";
import Post from "@/components/Post";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { router, useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../constants/theme";
import { styles } from "../../styles/feed.style";

export default function Index() {
  const { signOut } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const posts = useQuery(api.posts.getFeedPosts);

  if (posts === undefined) return <Loader />;
  if (posts.length === 0) return <NoPostsFound />;

  // this does nothing
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>HOME</Text>
        <TouchableOpacity onPress={() => signOut()}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        renderItem={({ item }) => <Post post={item} />}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      />
    </View>
  );
}
const NoPostsFound = () => (
  <View
    style={{
      flex: 1,
      backgroundColor: COLORS.background,
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Text style={{ fontSize: 20, color: COLORS.primary }}>No image for your couple</Text>
    <TouchableOpacity
  onPress={() => router.push("/(tabs)/activities")}
  style={{
    marginTop: 20,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#db6fb7ff", // background ok
    alignItems: "center",
  }}
>
  <Text style={{ fontSize: 20, color:"#1500f9ff" }}>
    Create new memory and streak
  </Text>
</TouchableOpacity>

  </View>
);
