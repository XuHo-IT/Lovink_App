import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { styles } from "@/styles/auth.style";
import { useSignUp, useUser } from "@clerk/clerk-expo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMutation } from "convex/react";
import { Link, useRouter } from "expo-router";
import * as React from "react";
import {
  Image,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { user } = useUser();
  const createUser = useMutation(api.users.createUser);
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");

  const [error, setError] = React.useState("");
  const [showModal, setShowModal] = React.useState(false);

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    if (!emailAddress || !password) {
      setError("Email and password are required.");
      setShowModal(true);
      return;
    }

    try {
      await signUp.create({ emailAddress, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      console.error(err);
      setError("Sign-up failed. Try again.");
      setShowModal(true);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;
    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });

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
        setError("Invalid verification code.");
        setShowModal(true);
      }
    } catch (err: any) {
      console.error(err);
      setError("Verification failed. Try again.");
      setShowModal(true);
    }
  };

  // Modal for errors
  const ErrorModal = () => (
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
  );

  if (pendingVerification) {
    return (
      <View style={styles.container}>
        <ErrorModal />
        <Text style={styles.title}>Verify your email</Text>
        <TextInput
          value={code}
          placeholder="Enter your verification code"
          onChangeText={setCode}
          style={styles.input}
          keyboardType="number-pad"
        />
        <TouchableOpacity onPress={onVerifyPress} style={styles.button}>
          <Text style={styles.buttonText}>Verify</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ErrorModal />

      {/* Brand */}
      <View style={styles.brandSection}>
        <View style={styles.logoContainer}>
          <Ionicons name="leaf" size={32} color={COLORS.primary} />
        </View>
        <Text style={styles.appName}>spotlight</Text>
        <Text style={styles.tagline}>don&apos;t miss anything</Text>
      </View>

      {/* Illustration */}
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
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Enter email"
          onChangeText={setEmailAddress}
          style={styles.input}
        />
        <TextInput
          value={password}
          placeholder="Enter password"
          secureTextEntry
          onChangeText={setPassword}
          style={styles.input}
        />

        <TouchableOpacity onPress={onSignUpPress} style={styles.button}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>

        <View style={styles.linkRow}>
          <Text style={{ color: "white" }}>Already have an account? </Text>
          <Link href="/sign-in">
            <Text style={styles.link}>Sign in</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}
