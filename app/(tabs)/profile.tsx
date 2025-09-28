import { Loader } from "@/components/Loader";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { styles } from "@/styles/profile.style";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";

export default function Profile() {
  const { signOut, userId } = useAuth();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // get currentUser by ClerkId (returns the Convex user doc)
  const currentUser = useQuery(
    api.users.getUserByClerkId,
    userId ? { clerkId: userId } : "skip"
  );
  const posts = useQuery(api.posts.getPostsByUser, {});
  // then pass Convex user._id to couple query
  const couple = useQuery(
    api.users.getCoupleByUser,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

// streak from Convex
const streak = useQuery(
  api.streak.getStreak,
  couple?._id ? { coupleId: couple._id } : "skip"
);
const updateStreak = useMutation(api.streak.updateStreak);

useEffect(() => {
  if (couple?._id) {
    updateStreak({ coupleId: couple._id });
  }
}, [couple?._id, posts]);



  const [editedProfile, setEditedProfile] = useState({
    fullname: currentUser?.fullname || "",
    bio: currentUser?.bio || "",
  });

  const [selectedPost, setSelectedPost] = useState<Doc<"posts"> | null>(null);

  const updateProfile = useMutation(api.users.updateProfile);

  const handleSaveProfile = async () => {
    await updateProfile(editedProfile);
    setIsEditModalVisible(false);
  };
  const removeCouple = useMutation(api.users.removeCouple); // you’ll create this mutation in Convex

  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [goodbyeModalVisible, setGoodbyeModalVisible] = useState(false);

  const handleDeclineLove = async () => {
    if (!currentUser?._id) return;
    await removeCouple({ userId: currentUser._id }); // pass current user
    setConfirmModalVisible(false);
    setGoodbyeModalVisible(true);
  };
  if (!currentUser) return <Loader />;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.username}>Welcome {currentUser.fullname}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon} onPress={() => signOut()}>
            <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={styles.profileInfo}>
          {/* AVATAR */}
          <View style={{ marginBottom: 30, paddingHorizontal: 16 }}>
            {/* Row with your avatar, info, lover avatar */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              {/* Your avatar */}
              <Image
                source={currentUser.image}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  borderWidth: 2,
                  borderColor: COLORS.primary,
                }}
                contentFit="cover"
                transition={200}
              />

              {/* Info block */}
              <View style={{ flex: 1, marginHorizontal: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "700",
                      color: COLORS.white,
                      flex: 1,
                    }}
                  >
                    {currentUser.fullname}
                  </Text>
                </View>

                {/* Bio */}
                {currentUser.bio && (
                  <Text
                    style={{
                      fontSize: 14,
                      color: COLORS.gray,
                      marginTop: 4,
                    }}
                    numberOfLines={2}
                  >
                    {currentUser.bio}
                  </Text>
                )}

                {/* Small edit button */}
                <TouchableOpacity
                  style={{
                    alignSelf: "flex-start",
                    marginTop: 8,
                    backgroundColor: COLORS.primary, // fixed solid background
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 6,
                  }}
                  onPress={() => setIsEditModalVisible(true)}
                >
                  <Text style={{ fontSize: 12, color: COLORS.white }}>
                    Edit
                  </Text>
                </TouchableOpacity>
              </View>

        
              {/* Love icon + lover avatar */}
              {couple && (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name="heart"
                    size={84}
                    color={COLORS.primary}
                    style={{ marginRight: 40 }}
                  />
                  <Image
                    source={couple.soulmateImage}
                    style={{
                      width: 70,
                      height: 70,
                      borderRadius: 35,
                      borderWidth: 2,
                      borderColor: COLORS.primary,
                    }}
                    contentFit="cover"
                    transition={200}
                  />

                </View>
              )}
            </View>

            {/* In love with */}
            {couple && (
              <View style={{ alignItems: "center", marginTop: 12 }}>
                <Text
                  style={{
                    fontSize: 16,
                    color: COLORS.primary,
                    textAlign: "center",
                  }}
                >
                  In love with {couple.soulmateName}
                </Text>

                {/* Decline Love button */}
                <TouchableOpacity
                  style={{
                    marginTop: 16,
                    backgroundColor: "red",
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: 8,
                  }}
                  onPress={() => setConfirmModalVisible(true)}
                >
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>
                    Decline Love
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* --- BIG STREAK CENTER --- */}
          {couple && (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                marginVertical: 40,
              }}
            >
              <View
                style={{
                  width: 320,
                  height: 320,
                  borderRadius: 210,
                  backgroundColor: COLORS.primary,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 20, color: "#ffff" }}>Streak</Text>
<Text style={{ fontSize: 56, fontWeight: "bold", color: "#ffff" }}>
  {streak?.streak ?? 0}
</Text>


                <Text style={{ fontSize: 20, color: "#ffff" }}>Days</Text>
              </View>
            </View>
          )}
            <FlatList
          data={posts}
          numColumns={3}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.gridItem} onPress={() => setSelectedPost(item)}>
              <Image
                source={item.imageUrl}
                style={styles.gridImage}
                contentFit="cover"
                transition={200}
              />
            </TouchableOpacity>
          )}
        />
        </View>
      </ScrollView>

      {/* EDIT PROFILE MODAL */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                  <Ionicons name="close" size={24} color={COLORS.white} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={editedProfile.fullname}
                  onChangeText={(text) =>
                    setEditedProfile((prev) => ({ ...prev, fullname: text }))
                  }
                  placeholderTextColor={COLORS.gray}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.bioInput]}
                  value={editedProfile.bio}
                  onChangeText={(text) =>
                    setEditedProfile((prev) => ({ ...prev, bio: text }))
                  }
                  multiline
                  numberOfLines={4}
                  placeholderTextColor={COLORS.gray}
                />
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      {/* SELECTED IMAGE MODAL */}
      <Modal
        visible={!!selectedPost}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSelectedPost(null)}
      >
        <View style={styles.modalBackdrop}>
          {selectedPost && (
            <View style={styles.postDetailContainer}>
              <View style={styles.postDetailHeader}>
                <TouchableOpacity onPress={() => setSelectedPost(null)}>
                  <Ionicons name="close" size={24} color={COLORS.white} />
                </TouchableOpacity>
              </View>

              <Image
                source={selectedPost.imageUrl}
                cachePolicy={"memory-disk"}
                style={styles.postDetailImage}
              />
            </View>
          )}
        </View>
      </Modal>
      <Modal
        visible={confirmModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: 20,
              width: "80%",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 16 }}>
              Are you sure about that…?
            </Text>

            <View style={{ flexDirection: "row", marginTop: 12 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: "red",
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 8,
                  marginRight: 12,
                }}
                onPress={handleDeclineLove}
              >
                <Text style={{ color: "#fff" }}>Yes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: "#ccc",
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 8,
                }}
                onPress={() => setConfirmModalVisible(false)}
              >
                <Text>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={goodbyeModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setGoodbyeModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: 20,
              width: "80%",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 16 }}>
              Sorry about your lost 😢. Hope to see u with new love soon!!!
            </Text>

            <TouchableOpacity
              style={{
                backgroundColor: COLORS.primary,
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 8,
              }}
              onPress={() => setGoodbyeModalVisible(false)}
            >
              <Text style={{ color: "#fff" }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function NoPostsFound() {
  return (
    <View
      style={{
        height: "100%",
        backgroundColor: COLORS.background,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Ionicons name="images-outline" size={48} color={COLORS.primary} />
      <Text style={{ fontSize: 20, color: COLORS.white }}>No posts yet</Text>
    </View>
  );
}
