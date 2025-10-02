import { Loader } from "@/components/Loader";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { styles } from "@/styles/profile.style";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function UserProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>(); // ✅ Get user id from URL

  const currentUser = useQuery(api.users.getAuthenticatedUserQuery);

 const profile = useQuery(
  api.users.getUserProfile,
  id ? { id: id as Id<"users"> } : "skip"
);

  const handleBack = () => {
    router.replace("/(tabs)/newsfed");
  };
const posts = useQuery(
  api.posts.getPostsByUser,
  id ? { userId: id as Id<"users"> } : "skip"
);

  // Loader state
  if (profile === undefined) {
    return <Loader />;
  }

  // User not found
  if (profile === null) {
    return (
      <View style={styles.container}>
        <Text>User not found</Text>
        <TouchableOpacity onPress={handleBack}>
          <Text>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
  <View style={styles.container}>
    <View style={styles.header}>
      <TouchableOpacity onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color={COLORS.white} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{profile.fullname}</Text>
      <View style={{ width: 24 }} />
    </View>

    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.profileInfo}>
        <View style={styles.avatarAndStats}>
          <Image
            source={profile.image}
            style={styles.avatar}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        </View>
        {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
      </View>

      {/* User's Posts */}
      {posts === undefined ? (
        <Loader />
      ) : posts?.length === 0 ? (
        <Text style={styles.emptyText}>No posts yet</Text>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.postCard}>
              <Image
                source={item.imageUrl}
                style={styles.postImage}
                contentFit="cover"
              />
              {item.caption && <Text style={styles.postCaption}>{item.caption}</Text>}
            </View>
          )}
          scrollEnabled={false} // disable scrolling, handled by ScrollView
        />
      )}
    </ScrollView>
  </View>
)}