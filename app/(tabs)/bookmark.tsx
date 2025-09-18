    import { Loader } from "@/components/Loader";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { styles } from "@/styles/feed.style";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

    export default function Bookmarks() {
      const bookmarkedPosts = useQuery(api.bookmarks.getBookmarkedPosts);
        const { signOut } = useAuth();
  const router = useRouter(); // 👈 get router

      if (bookmarkedPosts === undefined) return <Loader />;
      if (bookmarkedPosts.length === 0) return <NoBookmarksFound />;

      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>BOOKMARKS</Text>
              <TouchableOpacity onPress={() => signOut()}>
              <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          {/* POSTS */}
          <ScrollView
            contentContainerStyle={{
              padding: 8,
              flexDirection: "row",
              flexWrap: "wrap",
            }}
          >
            {bookmarkedPosts.map((post) => {
              if (!post) return null;
              return (
            <TouchableOpacity
      key={post._id}
      style={{
        flexDirection: "row", 
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        alignItems: "center",
      }}
      onPress={() => router.push("/(tabs)")} 
    >
      {/* Image */}
      <Image
        source={post.imageUrl}
        style={{ width: 100, height: 100, borderRadius: 8 }}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />

      {/* Info */}
      <View style={{marginLeft: 12 }}>
        {post.caption && (
          <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
            {post.caption}
          </Text>
        )}

        <Text style={{ color: "#981414ff" }}>Likes: {post.likes}</Text>
        <Text style={{ color: "#1a2d99ff" }}>Comments: {post.comments}</Text>
      </View>
    </TouchableOpacity>

              );
            })}
          </ScrollView>
        </View>
      );
    }

    function NoBookmarksFound() {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: COLORS.background,
          }}
        >
          <Text style={{ color: COLORS.primary, fontSize: 22 }}>No bookmarked posts yet</Text>
        </View>
      );
    }