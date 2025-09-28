import { api } from "@/convex/_generated/api";
import { styles } from "@/styles/auth.style";
import { useSignIn, useUser } from "@clerk/clerk-expo";
import { useMutation } from "convex/react";
import { Link, useRouter } from "expo-router";
import React from "react";
import {
  Image,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import OAuthButtons from "./oauthButton";

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { user } = useUser();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [showModal, setShowModal] = React.useState(false);

  const createUser = useMutation(api.users.createUser);

  const onSignInPress = async () => {
    if (!isLoaded) return;

    if (!emailAddress || !password) {
      setError("Please fill in all fields.");
      setShowModal(true);
      return;
    }

    try {
      const result = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });

        // ensure Convex user exists
        if (user) {
          await createUser({
            username:
              user.username ??
              user.primaryEmailAddress?.emailAddress.split("@")[0] ??
              "anonymous",
            fullname: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
            email: user.primaryEmailAddress?.emailAddress ?? "",
            image: user.imageUrl,
            clerkId: user.id,
          });
        }
        router.replace("/(tabs)");
      } else {
        setError("Unexpected sign-in result. Try again.");
        setShowModal(true);
      }
    } catch (err: any) {

  let message = "Something went wrong. Please try again.";
  if (err.errors && err.errors[0]?.message) {
    message = err.errors[0].message; // Clerk's detailed error
  } else if (err.message) {
    message = err.message;
  }

  setError(message);
  setShowModal(true);
}

  };

  return (
    <View style={styles.container}>
      {/* Modal for errors */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Logo */}
      <View style={styles.illustrationContainer}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.illustration}
          resizeMode="cover"
        />
      </View>

      {/* Form */}
      <View style={styles.loginSection}>
        <TextInput
          style={styles.input}
          placeholder="Enter email"
          autoCapitalize="none"
          value={emailAddress}
          onChangeText={setEmailAddress}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={onSignInPress}>
          <Text style={styles.buttonText}>Sign in</Text>
        </TouchableOpacity>

        <Text style={{ color: "#999", marginVertical: 12 }}>or</Text>
        <OAuthButtons />

        <Text style={styles.termsText}>
          By continuing, you agree to our Terms and Privacy Policy
        </Text>

        <View style={styles.linkRow}>
          <Text style={{ color: "#000000ff" }}>Don't have an account? </Text>
          <Link href="/sign-up">
            <Text style={styles.link}>Sign up</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}